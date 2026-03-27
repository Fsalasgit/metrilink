// src/pages/VanoDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const ORDER = ["ancho_1", "ancho_2", "ancho_3", "alto_1", "alto_2", "alto_3"];

const LABEL = {
  ancho_1: "ANCHO 1",
  ancho_2: "ANCHO 2",
  ancho_3: "ANCHO 3",
  alto_1: "ALTO 1",
  alto_2: "ALTO 2",
  alto_3: "ALTO 3",
};

const calcMinMaxDev = (values) => {
  const nums = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  if (nums.length < 2) return null;

  const min = Math.min(...nums);
  const max = Math.max(...nums);

  return { min, max, dev: max - min };
};

export default function VanoDetailPage({
  projectId,
  measurement,
  waitingForMeasurement,
  onBack,
  onEditField,
  onChangeNota,
  onChangeRevoque,
  onChangeTapajunta,
  onManualMeasure,
}) {
  const [manualMode, setManualMode] = useState(false);

  const rows = useMemo(
    () => [
      { label: "ANCHO 1", field: "ancho_1" },
      { label: "ANCHO 2", field: "ancho_2" },
      { label: "ANCHO 3", field: "ancho_3" },
      { label: "ALTO 1", field: "alto_1" },
      { label: "ALTO 2", field: "alto_2" },
      { label: "ALTO 3", field: "alto_3" },
    ],
    []
  );

  // Próximo campo faltante según el orden pedido
  const nextMissingField = useMemo(() => {
    if (!measurement) return null;
    return ORDER.find((f) => measurement?.[f] == null) || null;
  }, [measurement]);

  // ✅ AUTO-SECUENCIA SOLO SI NO ESTÁ EN MODO MANUAL
  useEffect(() => {
    if (!measurement) return;
    if (manualMode) return;
    if (!nextMissingField) return;

    const alreadyWaitingThisExactField =
      waitingForMeasurement?.id === measurement.id &&
      waitingForMeasurement?.field === nextMissingField;

    if (alreadyWaitingThisExactField) return;

    onEditField(nextMissingField);
  }, [
    measurement,
    nextMissingField,
    waitingForMeasurement,
    onEditField,
    manualMode,
  ]);

  // Mensaje “Esperando medida …”
  const waitingMsg = useMemo(() => {
    if (manualMode) {
      return "Modo manual activo: tocá el campo y cargá la medida.";
    }

    // si estamos esperando por este vano -> mostrar ese
    if (
      waitingForMeasurement?.id === measurement?.id &&
      waitingForMeasurement?.field
    ) {
      return `Esperando medida ${
        LABEL[waitingForMeasurement.field] || waitingForMeasurement.field
      }...`;
    }

    // si NO estamos esperando aún, pero hay un próximo faltante, mostramos el próximo
    if (nextMissingField) {
      return `Esperando medida ${LABEL[nextMissingField] || nextMissingField}...`;
    }

    // nada pendiente
    return null;
  }, [waitingForMeasurement, measurement, nextMissingField, manualMode]);

  // ✅ Desvíos (min/max/diff)
  const widthStats = useMemo(() => {
    return calcMinMaxDev([
      measurement?.ancho_1,
      measurement?.ancho_2,
      measurement?.ancho_3,
    ]);
  }, [measurement]);

  const heightStats = useMemo(() => {
    return calcMinMaxDev([
      measurement?.alto_1,
      measurement?.alto_2,
      measurement?.alto_3,
    ]);
  }, [measurement]);

  const handleRowClick = (field) => {
    // ✅ Si manual está activo: pedir valor por prompt y guardar
    if (manualMode) {
      const current = measurement?.[field];
      const raw = window.prompt(
        `Cargar ${LABEL[field]} (mm):`,
        current != null ? String(current) : ""
      );
      if (raw == null) return;

      const cleaned = String(raw).replace(",", ".").trim();
      const num = Number(cleaned);

      if (!Number.isFinite(num) || num <= 0) return;

      // guarda la medida manual (la persistencia la maneja App.jsx)
      onManualMeasure?.(field, num);
      return;
    }

    // ✅ Caso normal: láser
    onEditField(field);
  };

  return (
    <>
      <Card sx={{ mt: 1, mb: 2, bgcolor: "#eee" }}>
        <CardContent sx={{ py: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <IconButton size="small" onClick={onBack}>
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" fontWeight={600}>
                {measurement?.n_vano}
              </Typography>
            </Box>

            {/* ✅ Botón que corta secuencia */}
            <Button
              size="small"
              variant={manualMode ? "contained" : "outlined"}
              onClick={() => setManualMode((v) => !v)}
              sx={{ borderRadius: 0 }}
            >
              COLOCAR MEDIDA MANUAL
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" align="center" fontWeight={700} mb={1}>
        {projectId}
      </Typography>

      {/* ✅ Mensaje */}
      {waitingMsg && (
        <Typography variant="body2" color="error" align="center" sx={{ mb: 1 }}>
          {waitingMsg}
        </Typography>
      )}

      <Card>
        <CardContent sx={{ maxHeight: 340, overflowY: "auto" }}>
          {rows.map((r) => {
            const isWaitingThisField =
              !manualMode &&
              waitingForMeasurement?.id === measurement?.id &&
              waitingForMeasurement?.field === r.field;

            return (
              <Box
                key={r.field}
                sx={{
                  py: 1,
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                  bgcolor: isWaitingThisField
                    ? "rgba(255,0,0,0.06)"
                    : "transparent",
                }}
                // ✅ aunque esté esperando, tocar otro campo cambia el “esperando”
                onClick={() => handleRowClick(r.field)}
              >
                <Typography variant="body2">
                  {r.label} :{" "}
                  {measurement?.[r.field] != null
                    ? `${measurement[r.field]} mm.`
                    : "- mm."}
                </Typography>
              </Box>
            );
          })}

          {/* ✅ BLOQUE DESVÍO / FALSA ESCUADRA */}
          <Box
            sx={{
              mt: 2,
              p: 1,
              bgcolor: "#f7f7f7",
              border: "1px solid #e5e5e5",
            }}
          >
            <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
              DESVÍO DE VANO (FALSA ESCUADRA)
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Anchos:</strong>{" "}
              {[
                measurement?.ancho_1 ?? "-",
                measurement?.ancho_2 ?? "-",
                measurement?.ancho_3 ?? "-",
              ].join(" / ")}
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Altos:</strong>{" "}
              {[
                measurement?.alto_1 ?? "-",
                measurement?.alto_2 ?? "-",
                measurement?.alto_3 ?? "-",
              ].join(" / ")}
            </Typography>

            <Typography variant="body2">
              <strong>Desvío ancho:</strong>{" "}
              {widthStats
                ? `${widthStats.dev} mm (min ${widthStats.min} / max ${widthStats.max})`
                : "-"}
            </Typography>

            <Typography variant="body2">
              <strong>Desvío alto:</strong>{" "}
              {heightStats
                ? `${heightStats.dev} mm (min ${heightStats.min} / max ${heightStats.max})`
                : "-"}
            </Typography>
          </Box>

          <Box mt={2}>
            <Typography
              variant="caption"
              fontWeight={600}
              display="block"
              mb={1}
              align="right"
            >
              TERMINACIONES
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl fullWidth size="small">
                <InputLabel id="revoque-label">REVOQUE</InputLabel>
                <Select
                  labelId="revoque-label"
                  value={measurement?.revoque || ""}
                  label="REVOQUE"
                  onChange={(e) => onChangeRevoque?.(e.target.value)}
                >
                  <MenuItem value="">-</MenuItem>
                  <MenuItem value="FINO">FINO</MenuItem>
                  <MenuItem value="GRUESO">GRUESO</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="tapajunta-label">TAPAJUNTA</InputLabel>
                <Select
                  labelId="tapajunta-label"
                  value={measurement?.tapajunta || ""}
                  label="TAPAJUNTA"
                  onChange={(e) => onChangeTapajunta?.(e.target.value)}
                >
                  <MenuItem value="">-</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="COMPLETO">COMPLETO</MenuItem>
                  <MenuItem value="LATERALES Y SUPERIOR">LATERALES Y SUPERIOR</MenuItem>
                  <MenuItem value="LATERALES E INFERIOR">LATERALES E INFERIOR</MenuItem>
                  <MenuItem value="LATERALES">LATERALES</MenuItem>
                  <MenuItem value="SUPERIOR">SUPERIOR</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

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
              value={measurement?.nota || ""}
              onChange={(e) => onChangeNota(e.target.value)}
            />
          </Box>

          {/* ✅ mensaje final */}
          {!nextMissingField && !manualMode && (
            <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.7 }}>
              Secuencia completa.
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
