// src/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import API from "../api";

// ✅ Utiliser la même URL que axios (extraire de baseURL)
const getSocketUrl = () => {
  const baseURL = API.defaults.baseURL || "http://localhost:5000/api";
  // Retirer "/api" de la fin pour avoir juste l'URL racine
  return baseURL.replace(/\/api\/?$/, "");
};

const SOCKET_URL = getSocketUrl();

export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!token) return;

    // ✅ Initialiser Socket.io
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Events de connexion
    socket.on("connect", () => {
      console.log("✅ Socket.io connecté");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.io déconnecté");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      setIsConnected(false);
    });

    // ✅ Gestion présence utilisateurs
    socket.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [token]);

  // ✅ Méthodes utiles
  const joinChat = (otherUserId) => {
    socketRef.current?.emit("chat:join", { otherUserId });
  };

  const leaveChat = (otherUserId) => {
    socketRef.current?.emit("chat:leave", { otherUserId });
  };

  const sendMessage = (to, message) => {
    socketRef.current?.emit("message:send", { to, message });
  };

  const deleteMessage = (to, messageId) => {
    socketRef.current?.emit("message:delete", { to, messageId });
  };

  const startTyping = (to) => {
    socketRef.current?.emit("typing:start", { to });
  };

  const stopTyping = (to) => {
    socketRef.current?.emit("typing:stop", { to });
  };

  const checkUserOnline = (userId, callback) => {
    socketRef.current?.emit("user:check-online", { userId }, callback);
  };

  const onMessage = (callback) => {
    socketRef.current?.on("message:received", callback);
    return () => socketRef.current?.off("message:received", callback);
  };

  const onMessageDeleted = (callback) => {
    socketRef.current?.on("message:deleted", callback);
    return () => socketRef.current?.off("message:deleted", callback);
  };

  const onTyping = (callback) => {
    const handleActive = (data) => callback({ ...data, type: "active" });
    const handleInactive = (data) => callback({ ...data, type: "inactive" });
    
    socketRef.current?.on("typing:active", handleActive);
    socketRef.current?.on("typing:inactive", handleInactive);
    
    return () => {
      socketRef.current?.off("typing:active", handleActive);
      socketRef.current?.off("typing:inactive", handleInactive);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    deleteMessage, // ✅ Nouvelle fonction
    startTyping,
    stopTyping,
    checkUserOnline,
    onMessage,
    onMessageDeleted, // ✅ Nouvelle fonction
    onTyping,
  };
};
