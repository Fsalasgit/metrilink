// src/pages/VanoDetailPage.jsx
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function VanoDetailPage({
  projectId,
  measurement,
  waitingForMeasurement,
  onBack,
  onEditField,
  onChangeNota,
}) {
  const rows = [
    { label: "ANCHO 1", field: "ancho_1" },
    { label: "ANCHO 2", field: "ancho_2" },
    { label: "ANCHO 3", field: "ancho_3" },
    { label: "ALTO 1", field: "alto_1" },
    { label: "ALTO 2", field: "alto_2" },
    { label: "ALTO 3", field: "alto_3" },
  ];

  return (
    <>
      {/* barra superior tipo "< V01" */}
      <Card sx={{ mt: 1, mb: 2, bgcolor: "#eee" }}>
        <CardContent sx={{ py: 1 }}>
          <Box display="flex" alignItems="center">
            <IconButton size="small" onClick={onBack}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" fontWeight={600}>
              {measurement.n_vano}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" align="center" fontWeight={700} mb={1}>
        {projectId}
      </Typography>

      <Card>
        <CardContent sx={{ maxHeight: 340, overflowY: "auto" }}>
          {rows.map((r) => (
            <Box
              key={r.field}
              sx={{
                py: 1,
                borderBottom: "1px solid #ddd",
                cursor: "pointer",
              }}
              onClick={() => onEditField(r.field)}
            >
              <Typography variant="body2">
                {r.label} :{" "}
                {measurement[r.field] != null
                  ? `${measurement[r.field]} mm.`
                  : "- mm."}
              </Typography>
            </Box>
          ))}

          <Box mt={2}>
            <Typography
              variant="caption"
              fontWeight={600}
              display="block"
              mb={0.5}
              align="right"
            >
              COMENTARIOS
            </Typography>
            <TextField
              multiline
              minRows={2}
              fullWidth
              value={measurement.nota || ""}
              onChange={(e) => onChangeNota(e.target.value)}
            />
          </Box>

          {waitingForMeasurement && (
            <Typography
              variant="body2"
              color="error"
              align="center"
              sx={{ mt: 1 }}
            >
              Modificando {waitingForMeasurement.field} del vano{" "}
              {waitingForMeasurement.vano}...
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          sx={{ bgcolor: "#000", color: "#fff", borderRadius: 0, px: 6 }}
          onClick={onBack}
        >
          OK
        </Button>
      </Box>
    </>
  );
}
