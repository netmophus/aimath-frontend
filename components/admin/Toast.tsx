"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  tone?: "succes" | "erreur";
  onClose: () => void;
}

/** Retour visuel discret, sans dépendance externe. Se referme seul après 4s. */
export default function Toast({ message, tone = "succes", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 max-w-xs rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
        tone === "succes" ? "bg-fh-bleu" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
