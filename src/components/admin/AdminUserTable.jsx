import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
} from "@mui/material";
import API from "../../api";

const AdminUserTable = () => {
  const [users, setUsers] = useState([]);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/users?page=${page + 1}&limit=${rowsPerPage}&phone=${phoneSearch}`);
      setUsers(res.data.users);
      setTotalUsers(res.data.totalUsers);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggleStatus = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      fetchUsers(); // Refresh after toggle
    } catch (err) {
      console.error("❌ Erreur changement de statut", err);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  return (
    <Box mt={5}>
      <Typography variant="h6" gutterBottom>
        📋 Liste des utilisateurs
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Recherche par téléphone"
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Rechercher
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>École</TableCell>
            <TableCell>Rôle</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.schoolName}</TableCell>
              <TableCell>
                <Chip label={user.role} color="primary" size="small" />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.isActive ? "Actif" : "Désactivé"}
                  color={user.isActive ? "success" : "error"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleToggleStatus(user._id)}
                >
                  {user.isActive ? "Désactiver" : "Activer"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalUsers}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
      />
    </Box>
  );
};

export default AdminUserTable;
