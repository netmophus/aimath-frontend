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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  const [radiusKm, setRadiusKm] = useState(10000); // Rayon de filtrage en km (par défaut: pas de limite)

  // Chargement des distributeurs depuis l'API
  useEffect(() => {
    if (!open) return;
    
    const fetchDistributeurs = async () => {
      setLoading(true);
      try {
        const response = await API.get("/distributors");
        console.log("Réponse API:", response.data); // Debug
        // L'API retourne { data: [...], pagination: {...} }
        const data = Array.isArray(response.data?.data) 
          ? response.data.data 
          : Array.isArray(response.data) 
          ? response.data 
          : [];
        console.log(`✅ ${data.length} distributeurs chargés`); // Debug
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
      // Extraire lat/lng depuis location.coordinates [lng, lat] ou depuis latitude/longitude
      const lat = d.latitude || (d.location?.coordinates?.[1]);
      const lng = d.longitude || (d.location?.coordinates?.[0]);
      
      // Créer un objet avec lat/lng pour le calcul de distance
      const pos = lat && lng ? { lat, lng } : null;
      const dist = userPos && pos ? haversineKm(userPos, pos) : null;
      
      return { ...d, lat, lng, dist, mapUrl: mapsUrl(lat, lng) };
    });

    // Filtrage par distance (rayon)
    if (userPos && radiusKm < 10000) {
      base = base.filter((d) => d.dist == null || d.dist <= radiusKm);
    }

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

    console.log(`📍 ${base.length} distributeurs après filtrage (rayon: ${radiusKm < 10000 ? radiusKm + ' km' : 'tout le pays'})`); // Debug
    return base;
  }, [q, userPos, distributeurs, radiusKm]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  // Reset de la pagination quand on filtre ou change le rayon
  useEffect(() => setPage(0), [q, radiusKm]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: isMobile ? 1 : 2, fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
        {isMobile ? "Distributeurs Fahimta" : "Distributeurs officiels de cartes Fahimta"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: isMobile ? 1 : 2 }}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={isMobile ? "Rechercher…" : "Rechercher (ville, nom, adresse, téléphone)…"}
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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
            <Box display="flex" justifyContent={isMobile ? "center" : "flex-start"} alignItems="center" gap={1}>
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

            {userPos && (
              <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 200 }}>
                <InputLabel>Rayon</InputLabel>
                <Select
                  value={radiusKm}
                  label="Rayon"
                  onChange={(e) => setRadiusKm(e.target.value)}
                >
                  <MenuItem value={0.1}>100 m</MenuItem>
                  <MenuItem value={0.2}>200 m</MenuItem>
                  <MenuItem value={0.3}>300 m</MenuItem>
                  <MenuItem value={0.5}>500 m</MenuItem>
                  <MenuItem value={1}>1 km</MenuItem>
                  <MenuItem value={2}>2 km</MenuItem>
                  <MenuItem value={5}>5 km</MenuItem>
                  <MenuItem value={10}>10 km</MenuItem>
                  <MenuItem value={20}>20 km</MenuItem>
                  <MenuItem value={50}>50 km</MenuItem>
                  <MenuItem value={10000}>Tout le pays</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chargement des distributeurs...
            </Typography>
          </Box>
        ) : isMobile ? (
          // Version mobile avec des cartes
          <Stack spacing={1.5}>
            {paged.map((d) => (
              <Card key={d._id || d.id} elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5, pb: 1, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
                      {d.name}
                    </Typography>
                    {d.dist != null && (
                      <Chip 
                        icon={<NearMeRoundedIcon />}
                        label={`${d.dist.toFixed(1)} km`} 
                        color="success" 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  
                  <Stack spacing={0.5} sx={{ mb: 1 }}>
                    <Box display="flex" alignItems="start" gap={0.5}>
                      <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {d.city} - {d.address}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {d.phone}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Button
                    size="small"
                    startIcon={<MapRoundedIcon />}
                    href={d.mapUrl}
                    target="_blank"
                    rel="noopener"
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  >
                    Voir sur la carte
                  </Button>
                </CardContent>
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
                      <Typography variant="body2" fontWeight="bold">
                        {d.name}
                      </Typography>
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

        {rows.length > 0 && (
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
            labelRowsPerPage={isMobile ? "" : "Lignes par page"}
            labelDisplayedRows={({ from, to, count }) => 
              isMobile ? `${from}-${to}/${count}` : `${from}-${to} sur ${count}`
            }
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ 
              mt: 2,
              '.MuiTablePagination-selectLabel': {
                display: isMobile ? 'none' : 'block'
              },
              '.MuiTablePagination-select': {
                mr: isMobile ? 0 : 1
              }
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}