// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   TextField,
//   InputAdornment,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   TablePagination,
//   Chip,
//   IconButton,
//   Tooltip,
//   Stack,
//   Typography,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import MapRoundedIcon from "@mui/icons-material/MapRounded";
// import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";

// /* ---------- Données statiques (exemple) ---------- */
// const DISTRIBUTEURS = [
//   { id: 1,  name: "Librairie Anfani",            city: "Niamey",   addr: "Quartier Plateau, Rue YN-12",     phone: "+227 90 00 00 01", lat: 13.5116, lng: 2.1254 },
//   { id: 2,  name: "Point Fahimta Zinder",        city: "Zinder",   addr: "Zengou, face lycée Kassama",      phone: "+227 90 00 00 02", lat: 13.8072, lng: 8.9881 },
//   { id: 3,  name: "Centre Scolaire Maradi",      city: "Maradi",   addr: "Maradaoua, Bd Principal",         phone: "+227 90 00 00 03", lat: 13.4916, lng: 7.0931 },
//   { id: 4,  name: "Librairie Tahoua",            city: "Tahoua",   addr: "Marché Central, Box 18",          phone: "+227 90 00 00 04", lat: 14.8990, lng: 5.2692 },
//   { id: 5,  name: "Boutique Savoir Dosso",       city: "Dosso",    addr: "Route de Gaya, en face SONIDEP",  phone: "+227 90 00 00 05", lat: 13.0490, lng: 3.1937 },
//   { id: 6,  name: "Station Lecture Agadez",      city: "Agadez",   addr: "Aderbissanat, Rue du Marché",      phone: "+227 90 00 00 06", lat: 16.9740, lng: 7.9860 },
//   { id: 7,  name: "Librairie Diffa Savoir",      city: "Diffa",    addr: "Quartier Bagara",                  phone: "+227 90 00 00 07", lat: 13.3171, lng: 12.6117 },
//   { id: 8,  name: "Maison des Livres Tillabéri", city: "Tillabéri",addr: "Centre-ville, près de la Mairie", phone: "+227 90 00 00 08", lat: 14.2070, lng: 1.4540 },
//   { id: 9,  name: "Point Carte Arlit",           city: "Arlit",    addr: "Rue des Mines",                    phone: "+227 90 00 00 09", lat: 18.7350, lng: 7.3850 },
//   { id: 10, name: "Librairie de Gaya",           city: "Gaya",     addr: "Rond-point central",               phone: "+227 90 00 00 10", lat: 11.8830, lng: 3.4460 },
//   { id: 11, name: "Distributeur Konni",          city: "Birni N’Konni", addr: "Marché central",             phone: "+227 90 00 00 11", lat: 13.7870, lng: 5.2540 },
//   { id: 12, name: "Point Téra",                  city: "Téra",     addr: "Route de Niamey",                  phone: "+227 90 00 00 12", lat: 14.0100, lng: 0.7530 },
// ];

// /* ---------- Utils ---------- */
// const toRad = (x) => (x * Math.PI) / 180;
// const haversineKm = (a, b) => {
//   if (!a || !b) return null;
//   const R = 6371;
//   const dLat = toRad(b.lat - a.lat);
//   const dLon = toRad(b.lng - a.lng);
//   const lat1 = toRad(a.lat);
//   const lat2 = toRad(b.lat);
//   const h =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.asin(Math.sqrt(h));
// };

// const mapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

// export default function DistributeursModal({ open, onClose }) {
//   const [q, setQ] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRpp] = useState(5);

//   const [userPos, setUserPos] = useState(null); // {lat, lng}
//   const [geoDenied, setGeoDenied] = useState(false);

//   // Demande de géolocalisation quand le modal s’ouvre
//   useEffect(() => {
//     if (!open) return;
//     if (!navigator.geolocation) {
//       setGeoDenied(true);
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//         setGeoDenied(false);
//       },
//       () => setGeoDenied(true),
//       { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
//     );
//   }, [open]);

//   // Filtrage + distance + tri par distance si dispo
//   const rows = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     let base = DISTRIBUTEURS.map((d) => {
//       const dist =
//         userPos ? haversineKm(userPos, { lat: d.lat, lng: d.lng }) : null;
//       return { ...d, dist };
//     });

//     if (s) {
//       base = base.filter((d) =>
//         [d.name, d.city, d.addr, d.phone].some((f) =>
//           String(f).toLowerCase().includes(s)
//         )
//       );
//     }

//     // tri: distance croissante si connue, sinon par ville
//     base.sort((a, b) => {
//       if (a.dist != null && b.dist != null) return a.dist - b.dist;
//       if (a.dist != null) return -1;
//       if (b.dist != null) return 1;
//       return a.city.localeCompare(b.city);
//     });

//     return base;
//   }, [q, userPos]);

//   const paged = useMemo(() => {
//     const start = page * rowsPerPage;
//     return rows.slice(start, start + rowsPerPage);
//   }, [rows, page, rowsPerPage]);

//   // Reset de la pagination quand on filtre
//   useEffect(() => setPage(0), [q]);

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ fontWeight: 800 }}>
//         Distributeurs officiels de cartes Fahimta
//       </DialogTitle>

//       <DialogContent dividers>
//         <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
//           <TextField
//             size="small"
//             placeholder="Rechercher (ville, nom, adresse, téléphone)…"
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             fullWidth
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//             }}
//           />

//           <Box display="flex" alignItems="center" gap={1}>
//             {userPos ? (
//               <Chip
//                 icon={<NearMeRoundedIcon />}
//                 color="success"
//                 label="Autour de moi"
//                 variant="outlined"
//               />
//             ) : (
//               <Chip
//                 icon={<NearMeRoundedIcon />}
//                 color={geoDenied ? "warning" : "default"}
//                 variant="outlined"
//                 label={geoDenied ? "Géolocalisation refusée" : "Localisation indisponible"}
//               />
//             )}
//           </Box>
//         </Stack>

//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Distributeur</TableCell>
//               <TableCell>Ville</TableCell>
//               <TableCell>Adresse</TableCell>
//               <TableCell>Téléphone</TableCell>
//               <TableCell align="right">Distance</TableCell>
//               <TableCell align="center">Carte</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paged.map((d) => (
//               <TableRow key={d.id} hover>
//                 <TableCell>
//                   <Typography fontWeight={700}>{d.name}</Typography>
//                 </TableCell>
//                 <TableCell>{d.city}</TableCell>
//                 <TableCell>{d.addr}</TableCell>
//                 <TableCell>{d.phone}</TableCell>
//                 <TableCell align="right">
//                   {d.dist != null ? `${d.dist.toFixed(1)} km` : "—"}
//                 </TableCell>
//                 <TableCell align="center">
//                   <Tooltip title="Ouvrir dans Google Maps">
//                     <IconButton
//                       size="small"
//                       href={mapsUrl(d.lat, d.lng)}
//                       target="_blank"
//                       rel="noopener"
//                     >
//                       <MapRoundedIcon />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>
//               </TableRow>
//             ))}

//             {paged.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   Aucun résultat.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>

//         <TablePagination
//           component="div"
//           count={rows.length}
//           page={page}
//           onPageChange={(_, p) => setPage(p)}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={(e) => {
//             setRpp(parseInt(e.target.value, 10));
//             setPage(0);
//           }}
//           labelRowsPerPage="Lignes par page"
//           rowsPerPageOptions={[5, 10, 25]}
//         />
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose}>Fermer</Button>
//       </DialogActions>
//     </Dialog>
//   );
// }



// src/components/DistributeursModal.jsx
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
  CircularProgress,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import API from "../api";

/* ---------- Utils ---------- */
const toRad = (x) => (x * Math.PI) / 180;
const haversineKm = (a, b) => {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
};

const mapsUrl = (lat, lng) =>
  typeof lat === "number" && typeof lng === "number"
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : null;

/* ✅ Helper pour vérifier si ouvert maintenant */
const checkIfOpenNow = (openingHours) => {
  if (!openingHours) return null;
  if (typeof openingHours === "string") return null; // Pas de calcul pour texte libre
  
  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = dayNames[now.getDay()];
  const daySchedule = openingHours[today];
  
  if (!daySchedule || daySchedule.closed) return false;
  
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isOpen = currentTime >= daySchedule.open && currentTime < daySchedule.close;
  return { isOpen, closeTime: daySchedule.close };
};

/* ✅ Helper pour formatter les heures d'aujourd'hui */
const getTodaySchedule = (openingHours) => {
  if (!openingHours) return null;
  if (typeof openingHours === "string") return openingHours;
  
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = dayNames[new Date().getDay()];
  const daySchedule = openingHours[today];
  
  if (!daySchedule) return null;
  if (daySchedule.closed) return "Fermé aujourd'hui";
  return `${daySchedule.open} - ${daySchedule.close}`;
};

export default function DistributeursModal({ open, onClose }) {
  // UI
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0); // 0-index UI
  const [rowsPerPage, setRpp] = useState(5);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);         // lignes de la page courante
  const [total, setTotal] = useState(0);        // total items côté serveur

  // Géoloc
  const [userPos, setUserPos] = useState(null); // {lat, lng}
  const [geoDenied, setGeoDenied] = useState(false);

  // ✅ Filtre par région si géolocalisation refusée
  const [selectedRegion, setSelectedRegion] = useState("");

  // ✅ Rayon ajustable pour /near (km) - Par défaut 5 km (distances urbaines)
  const [radiusKm, setRadiusKm] = useState(5);

  // Demande de géolocalisation quand le modal s’ouvre
  useEffect(() => {
    if (!open) return;
    // reset pagination & recherche à chaque ouverture (optionnel)
    setPage(0);

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
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [open]);

  // Chargement des données
  const fetchData = async () => {
    if (!open) return;
    setLoading(true);
    try {
      // Notre API backend utilise pagination 1-index
      const paramsBase = {
        page: page + 1,
        pageSize: rowsPerPage,
        search: q || undefined,
      };

      let res;

      if (userPos && !geoDenied) {
        // ↪️ on tente l'endpoint géospatial (tri par distance côté DB)
        res = await API.get("/distributors/near", {
          params: { ...paramsBase, lat: userPos.lat, lng: userPos.lng, radiusKm },
        });
      } else {
        // ✅ fallback: liste paginée standard + filtre par région si sélectionnée
        res = await API.get("/distributors", { 
          params: { 
            ...paramsBase, 
            region: selectedRegion || undefined,
          } 
        });
      }

      // Structure attendue côté back:
      // { data: [], pagination: { total, page, pageSize, ... } }
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const pagination = res.data?.pagination || {};
      setRows(data);
      setTotal(Number(pagination.total || 0));
    } catch (e) {
      console.error("Erreur fetch distributeurs:", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quand pagination/recherche/position/région/rayon changent
  useEffect(() => {
    const id = setTimeout(fetchData, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [open, page, rowsPerPage, q, userPos, geoDenied, selectedRegion, radiusKm]);

  // Reset page quand filtre recherche, région ou rayon change
  useEffect(() => setPage(0), [q, selectedRegion, radiusKm]);

  // Normalisation pour le rendu
  const displayRows = useMemo(() => {
    return rows.map((d) => {
      const lat =
        d?.location?.coordinates?.[1] != null ? d.location.coordinates[1] : undefined;
      const lng =
        d?.location?.coordinates?.[0] != null ? d.location.coordinates[0] : undefined;

      // distance client (au cas où le back ne renvoie pas déjà trié)
      const dist = userPos ? haversineKm(userPos, { lat, lng }) : null;

      // ✅ Calcul de l'état d'ouverture
      const openStatus = checkIfOpenNow(d.openingHours);
      const todaySchedule = getTodaySchedule(d.openingHours);

      return {
        id: d._id || d.id,
        name: d.name,
        city: d.city,
        addr: d.address,
        phone: d.phone,
        lat,
        lng,
        dist,
        mapUrl: d.mapUrl || mapsUrl(lat, lng),
        openStatus,
        todaySchedule,
      };
    });
  }, [rows, userPos]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        Distributeurs officiels de cartes Fahimta
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mb: 2 }}
          alignItems="center"
        >
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

          {/* ✅ Filtre par région si géolocalisation refusée */}
          {(geoDenied || !userPos) && (
            <TextField
              select
              size="small"
              label="Région"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Toutes les régions</MenuItem>
              <MenuItem value="Niamey">Niamey</MenuItem>
              <MenuItem value="Agadez">Agadez</MenuItem>
              <MenuItem value="Diffa">Diffa</MenuItem>
              <MenuItem value="Dosso">Dosso</MenuItem>
              <MenuItem value="Maradi">Maradi</MenuItem>
              <MenuItem value="Tahoua">Tahoua</MenuItem>
              <MenuItem value="Tillabéri">Tillabéri</MenuItem>
              <MenuItem value="Zinder">Zinder</MenuItem>
            </TextField>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            {userPos ? (
              <>
                <Chip
                  icon={<NearMeRoundedIcon />}
                  color="success"
                  label={`Autour de moi`}
                  variant="outlined"
                />
                {/* ✅ Rayon ajustable - Options fines pour distances courtes */}
                <TextField
                  select
                  size="small"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  sx={{ minWidth: 100 }}
                >
                  <MenuItem value={0.5}>≤ 500 m</MenuItem>
                  <MenuItem value={1}>≤ 1 km</MenuItem>
                  <MenuItem value={2}>≤ 2 km</MenuItem>
                  <MenuItem value={5}>≤ 5 km</MenuItem>
                  <MenuItem value={10}>≤ 10 km</MenuItem>
                  <MenuItem value={20}>≤ 20 km</MenuItem>
                  <MenuItem value={50}>≤ 50 km</MenuItem>
                  <MenuItem value={100}>≤ 100 km</MenuItem>
                </TextField>
              </>
            ) : (
              <Chip
                icon={<NearMeRoundedIcon />}
                color={geoDenied ? "warning" : "default"}
                variant="outlined"
                label={geoDenied ? "Géolocalisation refusée" : "Localisation indisponible"}
              />
            )}

            <Tooltip title="Rafraîchir">
              <IconButton size="small" onClick={fetchData}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>

        <Box sx={{ position: "relative", minHeight: 220 }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.6)",
                display: "grid",
                placeItems: "center",
                zIndex: 1,
                borderRadius: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Distributeur</TableCell>
                <TableCell>Ville</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell align="right">Distance</TableCell>
                <TableCell align="center">Carte</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography fontWeight={700}>{d.name || "—"}</Typography>
                        {/* ✅ Indicateur GPS précis */}
                        {d.lat != null && d.lng != null ? (
                          <Tooltip title="Géolocalisation GPS précise">
                            <Chip label="GPS" color="success" size="small" sx={{ fontSize: 9, height: 16 }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Pas de coordonnées GPS précises">
                            <Chip label="⚠️" size="small" variant="outlined" sx={{ fontSize: 9, height: 16 }} />
                          </Tooltip>
                        )}
                      </Stack>
                      
                      {/* ✅ Indicateur Ouvert/Fermé + Horaires */}
                      {d.openStatus && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip 
                            label={d.openStatus.isOpen ? "Ouvert" : "Fermé"} 
                            color={d.openStatus.isOpen ? "success" : "error"} 
                            size="small"
                            sx={{ fontSize: 10, height: 18, fontWeight: 700 }}
                          />
                          {d.openStatus.isOpen && d.openStatus.closeTime && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                              jusqu'à {d.openStatus.closeTime}
                            </Typography>
                          )}
                        </Stack>
                      )}
                      {d.todaySchedule && !d.openStatus && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                          {d.todaySchedule}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{d.city || "—"}</TableCell>
                  <TableCell>{d.addr || "—"}</TableCell>
                  <TableCell>{d.phone || "—"}</TableCell>
                  <TableCell align="right">
                    {d.dist != null ? `${d.dist.toFixed(1)} km` : "—"}
                  </TableCell>
                  <TableCell align="center">
                    {d.mapUrl ? (
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
                    ) : (
                      <Chip size="small" label="—" />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {displayRows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun résultat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRpp(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page"
          rowsPerPageOptions={[5, 10, 25]}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
