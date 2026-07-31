// src/pages/VanoDetailPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import VanoCameraButton from "../components/camera/VanoCameraButton";

const ORDER = ["ancho_1", "ancho_2", "ancho_3", "alto_1", "alto_2", "alto_3"];

const LABEL = {
  ancho_1: "ANCHO 1",
  ancho_2: "ANCHO 2",
  ancho_3: "ANCHO 3",
  alto_1: "ALTO 1",
  alto_2: "ALTO 2",
  alto_3: "ALTO 3",
};

const limpiarEspacios = (texto = "") => {
  return String(texto).replace(/\s+/g, " ").trim();
};

const unirTextoSinDuplicar = (textoBase, textoNuevo) => {
  const base = limpiarEspacios(textoBase);
  const nuevo = limpiarEspacios(textoNuevo);

  if (!base) return nuevo;
  if (!nuevo) return base;

  if (base.toLowerCase().endsWith(nuevo.toLowerCase())) {
    return base;
  }

  if (nuevo.toLowerCase().startsWith(base.toLowerCase())) {
    return nuevo;
  }

  const palabrasBase = base.split(" ");
  const palabrasNuevo = nuevo.split(" ");

  const maxOverlap = Math.min(palabrasBase.length, palabrasNuevo.length);

  for (let i = maxOverlap; i > 0; i--) {
    const finalBase = palabrasBase.slice(-i).join(" ").toLowerCase();
    const inicioNuevo = palabrasNuevo.slice(0, i).join(" ").toLowerCase();

    if (finalBase === inicioNuevo) {
      return limpiarEspacios(
        [...palabrasBase, ...palabrasNuevo.slice(i)].join(" ")
      );
    }
  }

  return limpiarEspacios(`${base} ${nuevo}`);
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

const getDriveFileId = (photo) => {
  if (photo?.fileId) return photo.fileId;

  const match = String(photo?.fileUrl || "").match(/\/d\/([^/]+)/);
  return match?.[1] || null;
};

const getDrivePreviewUrl = (photo) => {
  const fileId = getDriveFileId(photo);

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      fileId
    )}&sz=w1600`;
  }

  return photo?.fileUrl || "";
};

const formatPhotoDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("es-AR");
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
  onChangeApertura,
  onChangeEmbutida,
  onChangeNpt,
  onManualMeasure,
  onCapturePhoto,
  uploadingPhoto,
  photoMessage,
  photoError,
  onDeletePhoto,
}) {
  const [manualMode, setManualMode] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deletePhotoError, setDeletePhotoError] = useState("");

  const photos = useMemo(
    () => (Array.isArray(measurement?.fotos) ? measurement.fotos : []),
    [measurement]
  );

  // ✅ Estados para comentario por voz
  const [escuchandoComentario, setEscuchandoComentario] = useState(false);
  const [textoInterinoComentario, setTextoInterinoComentario] = useState("");
  const [errorVozComentario, setErrorVozComentario] = useState("");

  const recognitionComentarioRef = useRef(null);
  const textoComentarioFinalRef = useRef("");
  const onChangeNotaRef = useRef(onChangeNota);

  useEffect(() => {
    onChangeNotaRef.current = onChangeNota;
  }, [onChangeNota]);

  useEffect(() => {
    textoComentarioFinalRef.current = measurement?.nota || "";
  }, [measurement?.id, measurement?.nota]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorVozComentario(
        "Tu navegador no permite comentario por voz. Probá con Chrome o Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let textoFinal = "";
      let textoTemporal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const texto = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          textoFinal += ` ${texto}`;
        } else {
          textoTemporal += ` ${texto}`;
        }
      }

      textoFinal = limpiarEspacios(textoFinal);
      textoTemporal = limpiarEspacios(textoTemporal);

      if (textoFinal) {
        const textoUnificado = unirTextoSinDuplicar(
          textoComentarioFinalRef.current,
          textoFinal
        );

        textoComentarioFinalRef.current = textoUnificado;
        onChangeNotaRef.current?.(textoUnificado);
      }

      setTextoInterinoComentario(textoTemporal);
    };

    recognition.onerror = (event) => {
      console.error("Error de reconocimiento de voz en comentario:", event.error);
      setErrorVozComentario(
        "No se pudo tomar el comentario por voz. Revisá permisos del micrófono."
      );
      setEscuchandoComentario(false);
    };

    recognition.onend = () => {
      setEscuchandoComentario(false);
      setTextoInterinoComentario("");
    };

    recognitionComentarioRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Evita errores si el reconocimiento ya estaba detenido.
      }
    };
  }, []);

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

  const iniciarComentarioVoz = () => {
    if (!measurement) return;

    if (!recognitionComentarioRef.current) {
      setErrorVozComentario(
        "El comentario por voz no está disponible en este navegador."
      );
      return;
    }

    textoComentarioFinalRef.current = measurement?.nota || "";
    setErrorVozComentario("");
    setTextoInterinoComentario("");

    try {
      recognitionComentarioRef.current.start();
      setEscuchandoComentario(true);
    } catch (error) {
      console.error("Error al iniciar micrófono para comentario:", error);
      setErrorVozComentario("No se pudo iniciar el micrófono.");
      setEscuchandoComentario(false);
    }
  };

  const detenerComentarioVoz = () => {
    if (recognitionComentarioRef.current) {
      try {
        recognitionComentarioRef.current.stop();
      } catch (error) {
        // Evita errores si ya estaba detenido.
      }
    }

    setEscuchandoComentario(false);
    setTextoInterinoComentario("");
  };

  const limpiarComentario = () => {
    textoComentarioFinalRef.current = "";
    onChangeNota?.("");
    setTextoInterinoComentario("");
    setErrorVozComentario("");
  };

  const handleNotaManual = (e) => {
    const value = e.target.value;
    textoComentarioFinalRef.current = value;
    onChangeNota?.(value);
  };

  const handleBack = () => {
    detenerComentarioVoz();
    onBack?.();
  };

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

  const handleConfirmDeletePhoto = async () => {
    if (!photoToDelete || deletingPhoto) return;

    setDeletingPhoto(true);
    setDeletePhotoError("");

    try {
      await onDeletePhoto?.(photoToDelete);
      setPhotoToDelete(null);
    } catch (error) {
      console.error("Error eliminando la foto:", error);
      setDeletePhotoError(
        error?.message || "No se pudo eliminar la foto. Intentá nuevamente."
      );
    } finally {
      setDeletingPhoto(false);
    }
  };

  return (
    <>
      <Card sx={{ mt: 1, mb: 2, bgcolor: "#eee" }}>
        <CardContent sx={{ py: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <IconButton size="small" onClick={handleBack}>
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

              <FormControl fullWidth size="small">
                <InputLabel id="apertura-label">APERTURA</InputLabel>
                <Select
                  labelId="apertura-label"
                  value={measurement?.apertura || ""}
                  label="APERTURA"
                  onChange={(e) => onChangeApertura?.(e.target.value)}
                >
                  <MenuItem value="">-</MenuItem>
                  <MenuItem value="INTERIOR DERECHA">INTERIOR DERECHA</MenuItem>
                  <MenuItem value="INTERIOR IZQUIERDA">INTERIOR IZQUIERDA</MenuItem>
                  <MenuItem value="NO CORRESPONDE">NO CORRESPONDE</MenuItem>
                  <MenuItem value="EXTERIOR DERECHA">EXTERIOR DERECHA</MenuItem>
                  <MenuItem value="EXTERIOR IZQUIERDA">EXTERIOR IZQUIERDA</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="embutida-label">EMBUTIDA</InputLabel>
                <Select
                  labelId="embutida-label"
                  value={measurement?.embutida || ""}
                  label="EMBUTIDA"
                  onChange={(e) => onChangeEmbutida?.(e.target.value)}
                >
                  <MenuItem value="">-</MenuItem>
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
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

            <Box display="flex" gap={1} mb={1}>
              {!escuchandoComentario ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<MicIcon />}
                  onClick={iniciarComentarioVoz}
                  disabled={!measurement}
                  sx={{
                    bgcolor: "#1e3a8a",
                    borderRadius: 0,
                    "&:hover": {
                      bgcolor: "#1d4ed8",
                    },
                  }}
                >
                  Agregar comentario por voz
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={detenerComentarioVoz}
                  sx={{ borderRadius: 0 }}
                >
                  Detener
                </Button>
              )}

              <Button
                size="small"
                variant="outlined"
                onClick={limpiarComentario}
                disabled={!measurement || escuchandoComentario}
                sx={{ borderRadius: 0 }}
              >
                Limpiar
              </Button>
            </Box>

            {errorVozComentario && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {errorVozComentario}
              </Alert>
            )}

            <TextField
              multiline
              minRows={2}
              fullWidth
              value={measurement?.nota || ""}
              onChange={handleNotaManual}
              placeholder="Escribí o dictá un comentario del vano..."
            />

            {textoInterinoComentario && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Escuchando: {textoInterinoComentario}
              </Alert>
            )}
          </Box>

          <VanoCameraButton
            onCapture={onCapturePhoto}
            disabled={!measurement || uploadingPhoto}
          />

          <Button
            fullWidth
            variant="outlined"
            startIcon={<PhotoLibraryIcon />}
            disabled={photos.length === 0}
            onClick={() => setPhotoModalOpen(true)}
            sx={{ mt: 1, borderRadius: 0 }}
          >
            {photos.length > 0
              ? `VER FOTOS (${photos.length})`
              : "SIN FOTOS CARGADAS"}
          </Button>

          {photoMessage && (
            <Typography
              variant="caption"
              display="block"
              sx={{
                mt: 1,
                color: photoError ? "error.main" : "text.secondary",
              }}
            >
              {photoMessage}
            </Typography>
          )}

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
          onClick={handleBack}
        >
          OK
        </Button>
      </Box>

      <Dialog
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: 1,
            width: "calc(100% - 16px)",
            maxHeight: "92vh",
          },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          Fotos del vano {measurement?.n_vano}
          <IconButton
            aria-label="Cerrar"
            onClick={() => setPhotoModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {photos.length === 0 ? (
            <Typography align="center">No hay fotos cargadas.</Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2,
              }}
            >
              {photos.map((photo, index) => {
                const previewUrl = getDrivePreviewUrl(photo);
                const driveUrl = photo?.fileUrl || previewUrl;

                return (
                  <Card key={photo?.fileId || `${photo?.fileName}-${index}`}>
                    <Box
                      component="a"
                      href={driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "block", textDecoration: "none" }}
                    >
                      <Box
                        component="img"
                        src={previewUrl}
                        alt={photo?.fileName || `Foto ${index + 1}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sx={{
                          display: "block",
                          width: "100%",
                          height: 220,
                          objectFit: "contain",
                          bgcolor: "#f2f2f2",
                          cursor: "pointer",
                        }}
                      />
                    </Box>

                    <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        noWrap
                        title={photo?.fileName || ""}
                      >
                        {photo?.fileName || `Foto ${index + 1}`}
                      </Typography>

                      {photo?.fecha && (
                        <Typography variant="caption" color="text.secondary">
                          {formatPhotoDate(photo.fecha)}
                        </Typography>
                      )}

                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Button
                          component="a"
                          href={driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<OpenInNewIcon />}
                          sx={{ px: 0 }}
                        >
                          Abrir en Drive
                        </Button>

                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => {
                            setDeletePhotoError("");
                            setPhotoToDelete(photo);
                          }}
                          disabled={deletingPhoto}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPhotoModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación antes de eliminar la foto */}
      <Dialog
        open={Boolean(photoToDelete)}
        onClose={() => {
          if (deletingPhoto) return;
          setPhotoToDelete(null);
          setDeletePhotoError("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>¿Eliminar esta foto?</DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2">
            La foto <strong>{photoToDelete?.fileName || "seleccionada"}</strong>{" "}
            se enviará a la papelera de Google Drive y dejará de aparecer en
            este vano.
          </Typography>

          <Typography variant="body2" fontWeight={700} sx={{ mt: 1 }}>
            ¿Realmente desea eliminarla?
          </Typography>

          {deletePhotoError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {deletePhotoError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setPhotoToDelete(null);
              setDeletePhotoError("");
            }}
            disabled={deletingPhoto}
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeletePhoto}
            disabled={deletingPhoto}
            startIcon={
              deletingPhoto ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineIcon />
              )
            }
          >
            {deletingPhoto ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}