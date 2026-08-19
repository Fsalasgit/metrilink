// src/pages/VanosPage.jsx

import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function VanosPage({
  projectId,
  vanos,
  onBack,
  onAdd,
  onOpenVano,
}) {

  // =====================================================
  // FILTRO
  // =====================================================

  const [filtro, setFiltro] = useState("");

  // =====================================================
  // VANOS FILTRADOS
  // =====================================================

  const vanosFiltrados = useMemo(() => {

    const texto = filtro
      .trim()
      .toLowerCase();

    // Si no escribió nada mostramos todos
    if (!texto) {
      return vanos;
    }

    return vanos.filter((vano) => {

      const numeroVano = String(
        vano?.n_vano ?? ""
      ).toLowerCase();

      return numeroVano.includes(texto);
    });

  }, [vanos, filtro]);

  return (
    <>
      {/* ================================================= */}
      {/* PROYECTO */}
      {/* ================================================= */}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mt={2}
        mb={1}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
        >
          {projectId || "Sin proyecto"}
        </Typography>
      </Box>

      {/* ================================================= */}
      {/* AGREGAR */}
      {/* ================================================= */}

      <Box
        display="flex"
        justifyContent="center"
        mb={2}
      >
        <Button
          sx={{
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 0,
            px: 4,

            "&:hover": {
              bgcolor: "#222",
            },
          }}
          onClick={onAdd}
        >
          AGREGAR
        </Button>
      </Box>

      {/* ================================================= */}
      {/* LISTADO VANOS */}
      {/* ================================================= */}

      <Card>
        <CardContent>

          <Typography
            variant="subtitle2"
            fontWeight={600}
          >
            Vanos
          </Typography>

          {/* ================================================= */}
          {/* FILTRO */}
          {/* ================================================= */}

          <TextField
            size="small"
            variant="standard"
            placeholder="...FILTRAR VANO"
            fullWidth

            value={filtro}

            onChange={(e) => {
              setFiltro(e.target.value);
            }}

            sx={{
              mt: 1,
              mb: 1,
            }}
          />

          {/* ================================================= */}
          {/* RESULTADOS */}
          {/* ================================================= */}

          <List dense>

            {vanosFiltrados.map((v) => (

              <ListItemButton
                key={v.id}
                onClick={() =>
                  onOpenVano(v.n_vano)
                }
              >

                <ListItemText
                  primary={v.n_vano}
                />

              </ListItemButton>

            ))}

            {/* NO HAY VANOS CARGADOS */}

            {vanos.length === 0 && (

              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                No hay vanos cargados.
              </Typography>

            )}

            {/* HAY VANOS PERO EL FILTRO NO ENCONTRÓ NINGUNO */}

            {vanos.length > 0 &&
              vanosFiltrados.length === 0 && (

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  No se encontraron vanos con "{filtro}".
                </Typography>

              )}

          </List>

        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* VOLVER */}
      {/* ================================================= */}

      <Box mt={2}>
        <Button
          startIcon={
            <ArrowBackIosNewIcon fontSize="small" />
          }
          size="small"
          onClick={onBack}
        >
          Volver a proyectos
        </Button>
      </Box>
    </>
  );
}