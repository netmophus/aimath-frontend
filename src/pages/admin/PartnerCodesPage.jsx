// // pages/admin/PartnerCodesPage.jsx
// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import {
//   Box, Paper, Typography, TextField, MenuItem, Button,
//   Table, TableHead, TableRow, TableCell, TableBody, Chip, Divider, CircularProgress, Stack
// } from "@mui/material";
// import PageLayout from "../../components/PageLayout";
// import API from "../../api";

// const currency = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;
// const fmtDT = (d) => (d ? new Date(d).toLocaleString("fr-FR") : "—");

// const statusChip = (s) => {
//   if (s === "used") return <Chip size="small" label="Utilisée" color="success" />;
//   if (s === "activated") return <Chip size="small" label="Activée" color="info" />;
//   return <Chip size="small" label="Générée" />;
// };

// export default function PartnerCodesPage() {
//   const [status, setStatus] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [items, setItems] = useState([]);
//   const [q, setQ] = useState("");

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setErr("");
//       const res = await API.get(`/payments/partners/my-codes?status=${status}`);
//       setItems(Array.isArray(res.data?.items) ? res.data.items : []);
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Erreur de chargement.");
//     } finally {
//       setLoading(false);
//     }
//   }, [status]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return items;
//     return items.filter((it) =>
//       [it.code, it.batchId, it.status].some((x) => String(x || "").toLowerCase().includes(s))
//     );
//   }, [items, q]);

//   const onExportCSV = () => {
//     const header = [
//       "batchId","code","status","faceValueCfa","assignedAt","activatedAt","soldAt","commissionCfa","usedAt"
//     ];
//     const rows = filtered.map((c) => [
//       c.batchId, c.code, c.status, c.faceValueCfa || "",
//       c.assignedAt || "", c.activatedAt || "", c.soldAt || "",
//       c.commissionCfa || 0, c.usedAt || ""
//     ].map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(","));
//     const csv = [header.join(","), ...rows].join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = "mes-codes.csv"; a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <PageLayout>
//       <Box p={4} mt={10}>
//         <Typography variant="h4" fontWeight="bold" mb={1}>🧾 Mes cartes</Typography>
//         <Typography variant="body1" color="text.secondary" mb={3}>
//           Liste de mes codes assignés (filtre par statut, recherche, export CSV).
//         </Typography>

//         <Paper sx={{ p: 2.5, borderRadius: 2 }}>
//           <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" mb={2}>
//             <TextField
//               select size="small" label="Statut" value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               sx={{ minWidth: 200 }}
//             >
//               <MenuItem value="all">Tous</MenuItem>
//               <MenuItem value="activated">Activés</MenuItem>
//               <MenuItem value="used">Utilisés</MenuItem>
//             </TextField>

//             <TextField
//               size="small" placeholder="Rechercher (code, lot, statut)…"
//               value={q} onChange={(e) => setQ(e.target.value)}
//               sx={{ minWidth: 260 }}
//             />

//             <Button variant="outlined" onClick={fetchData}>Rafraîchir</Button>
//             <Button variant="contained" onClick={onExportCSV}>Exporter CSV</Button>
//           </Stack>

//           <Divider sx={{ mb: 2 }} />

//           {loading ? (
//             <Box py={6} display="flex" justifyContent="center"><CircularProgress /></Box>
//           ) : err ? (
//             <Typography color="error">{err}</Typography>
//           ) : (
//             <Table size="small">
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Lot</TableCell>
//                   <TableCell>Code</TableCell>
//                   <TableCell>Statut</TableCell>
//                   <TableCell align="right">Valeur</TableCell>
//                   <TableCell>Assigné</TableCell>
//                   <TableCell>Activé (lot)</TableCell>
//                   <TableCell>Vendu</TableCell>
//                   <TableCell>Utilisé</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filtered.map((c) => (
//                   <TableRow key={c.code}>
//                     <TableCell>{c.batchId}</TableCell>
//                     <TableCell><Typography fontWeight={700}>{c.code}</Typography></TableCell>
//                     <TableCell>{statusChip(c.status)}</TableCell>
//                     <TableCell align="right">{c.faceValueCfa ? currency(c.faceValueCfa) : "—"}</TableCell>
//                     <TableCell>{fmtDT(c.assignedAt)}</TableCell>
//                     <TableCell>{fmtDT(c.activatedAt)}</TableCell>
//                     <TableCell>{fmtDT(c.soldAt)}</TableCell>
//                     <TableCell>{fmtDT(c.usedAt)}</TableCell>
//                   </TableRow>
//                 ))}
//                 {filtered.length === 0 && (
//                   <TableRow><TableCell colSpan={8}>
//                     <Typography color="text.secondary">Aucun code.</Typography>
//                   </TableCell></TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </Paper>
//       </Box>
//     </PageLayout>
//   );
// }





// pages/admin/PartnerCodesPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Paper, Typography, TextField, MenuItem, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Divider, CircularProgress, Stack
} from "@mui/material";
import PageLayout from "../../components/PageLayout";
import API from "../../api";

const currency = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;
const fmtDT = (d) => (d ? new Date(d).toLocaleString("fr-FR") : "—");

const statusChip = (s) => {
  if (s === "used") return <Chip size="small" label="Utilisée" color="success" />;
  if (s === "activated") return <Chip size="small" label="Activée" color="info" />;
  return <Chip size="small" label="Générée" />;
};

export default function PartnerCodesPage() {
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await API.get(`/payments/partners/my-codes?status=${status}`);
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      [
        it.codeMasked,     // ✅ recherche sur le code masqué
        it.batchId,
        it.status
      ].some((x) => String(x || "").toLowerCase().includes(s))
    );
  }, [items, q]);

  const onExportCSV = () => {
    const header = [
      "batchId","codeMasked","status","faceValueCfa","assignedAt","activatedAt","soldAt","commissionCfa","usedAt"
    ];
    const rows = filtered.map((c) => [
      c.batchId,
      c.codeMasked,                 // ✅ on exporte uniquement la version masquée
      c.status,
      c.faceValueCfa || "",
      c.assignedAt || "",
      c.activatedAt || "",
      c.soldAt || "",
      c.commissionCfa || 0,
      c.usedAt || ""
    ].map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mes-codes.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Typography variant="h4" fontWeight="bold" mb={1}>🧾 Mes cartes</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Liste de mes codes assignés (filtre par statut, recherche, export CSV).
        </Typography>

        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" mb={2}>
            <TextField
              select size="small" label="Statut" value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="activated">Activés</MenuItem>
              <MenuItem value="used">Utilisés</MenuItem>
            </TextField>

            <TextField
              size="small" placeholder="Rechercher (code, lot, statut)…"
              value={q} onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 260 }}
            />

            <Button variant="outlined" onClick={fetchData}>Rafraîchir</Button>
            <Button variant="contained" onClick={onExportCSV}>Exporter CSV</Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box py={6} display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : err ? (
            <Typography color="error">{err}</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Lot</TableCell>
                  <TableCell>Code (masqué)</TableCell> {/* ✅ libellé explicite */}
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Valeur</TableCell>
                  <TableCell>Assigné</TableCell>
                  <TableCell>Activé (lot)</TableCell>
                  <TableCell>Vendu</TableCell>
                  <TableCell>Utilisé</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c, idx) => (
                  <TableRow key={`${c.batchId}-${idx}`}> {/* ✅ pas de code clair pour la clé */}
                    <TableCell>{c.batchId}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{c.codeMasked}</Typography> {/* ✅ affichage masqué */}
                    </TableCell>
                    <TableCell>{statusChip(c.status)}</TableCell>
                    <TableCell align="right">{c.faceValueCfa ? currency(c.faceValueCfa) : "—"}</TableCell>
                    <TableCell>{fmtDT(c.assignedAt)}</TableCell>
                    <TableCell>{fmtDT(c.activatedAt)}</TableCell>
                    <TableCell>{fmtDT(c.soldAt)}</TableCell>
                    <TableCell>{fmtDT(c.usedAt)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8}>
                    <Typography color="text.secondary">Aucun code.</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </PageLayout>
  );
}
