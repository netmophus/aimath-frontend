import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import API from "../api";

/* ---------- Utils ---------- */
const toRad = (x) => (x * Math.PI) / 180;
const haversineKm = (a, b) => {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const a1 = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
  return R * c;
};

const mapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

export default function DistributeursModal({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRpp] = useState(5);
  const [userPos, setUserPos] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [distributeurs, setDistributeurs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Chargement des distributeurs depuis l'API
  useEffect(() => {
    if (!open) return;
    
    const fetchDistributeurs = async () => {
      setLoading(true);
      try {
        const response = await API.get("/distributors");
        console.log("Réponse API:", response.data); // Debug
        // Assurer que c'est bien un tableau
        const data = Array.isArray(response.data) ? response.data : [];
        setDistributeurs(data);
      } catch (error) {
        console.error("Erreur lors du chargement des distributeurs:", error);
        setDistributeurs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributeurs();
  }, [open]);

  // Demande de géolocalisation quand le modal s'ouvre
  //merci
  useEffect(() => {
    if (!open) return;
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoDenied(false);
      },
      () => setGeoDenied(true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [open]);

  // Filtrage et tri des distributeurs
  const rows = useMemo(() => {
    // S'assurer que distributeurs est un tableau
    if (!Array.isArray(distributeurs)) {
      return [];
    }
    
    let base = distributeurs.map((d) => {
      const dist = userPos ? haversineKm(userPos, d) : null;
      return { ...d, dist, mapUrl: mapsUrl(d.latitude, d.longitude) };
    });

    // Filtrage par texte
    if (q.trim()) {
      const searchLower = q.toLowerCase();
      base = base.filter(
        (d) =>
          (d.name && d.name.toLowerCase().includes(searchLower)) ||
          (d.city && d.city.toLowerCase().includes(searchLower)) ||
          (d.address && d.address.toLowerCase().includes(searchLower)) ||
          (d.phone && d.phone.includes(q))
      );
    }

    // Tri: distance croissante si connue, sinon par ville
    base.sort((a, b) => {
      if (a.dist != null && b.dist != null) return a.dist - b.dist;
      if (a.dist != null) return -1;
      if (b.dist != null) return 1;
      return a.city.localeCompare(b.city);
    });

    return base;
  }, [q, userPos, distributeurs]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  // Reset de la pagination quand on filtre
  useEffect(() => setPage(0), [q]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: isMobile ? 1 : 2 }}>
        Distributeurs officiels de cartes Fahimta
      </DialogTitle>

      <DialogContent dividers sx={{ p: isMobile ? 1 : 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher (ville, nom, adresse, téléphone)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box display="flex" alignItems="center" gap={1}>
            {userPos ? (
              <Chip
                icon={<NearMeRoundedIcon />}
                color="success"
                label="Autour de moi"
                size="small"
              />
            ) : geoDenied ? (
              <Chip label="Géolocalisation refusée" color="warning" size="small" />
            ) : (
              <Chip label="Localisation..." color="info" size="small" />
            )}
          </Box>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chargement des distributeurs...
            </Typography>
          </Box>
        ) : isMobile ? (
          // Version mobile avec des cartes
          <Stack spacing={2}>
            {paged.map((d) => (
              <Card key={d._id || d.id} elevation={2}>
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {d.name}
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {d.city} - {d.address}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="primary" />
                      <Typography variant="body2">{d.phone}</Typography>
                    </Box>
                    
                    {d.dist != null && (
                      <Chip 
                        icon={<NearMeRoundedIcon />}
                        label={`${d.dist.toFixed(1)} km`} 
                        color="success" 
                        size="small" 
                      />
                    )}
                  </Stack>
                </CardContent>
                
                <CardActions sx={{ pt: 0, pb: 1 }}>
                  <Button
                    size="small"
                    startIcon={<MapRoundedIcon />}
                    href={d.mapUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Voir sur la carte
                  </Button>
                </CardActions>
              </Card>
            ))}
            
            {paged.length === 0 && !loading && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                Aucun distributeur trouvé.
              </Typography>
            )}
          </Stack>
        ) : (
          // Version desktop avec tableau
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell align="right">Distance</TableCell>
                  <TableCell align="center">Carte</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((d) => (
                  <TableRow key={d._id || d.id}>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" fontWeight="bold">
                          {d.name}
                        </Typography>
                        {userPos && d.dist != null && (
                          <Chip 
                            icon={<NearMeRoundedIcon />}
                            label={`${d.dist.toFixed(1)} km`} 
                            color="success" 
                            size="small" 
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{d.city || "—"}</TableCell>
                    <TableCell>{d.address || "—"}</TableCell>
                    <TableCell>{d.phone || "—"}</TableCell>
                    <TableCell align="right">
                      {d.dist != null ? `${d.dist.toFixed(1)} km` : "—"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ouvrir dans Google Maps">
                        <IconButton
                          size="small"
                          href={d.mapUrl}
                          target="_blank"
                          rel="noopener"
                        >
                          <MapRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {paged.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun distributeur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRpp(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page"
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}