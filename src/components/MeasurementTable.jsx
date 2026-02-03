// src/component/MeasurementTable.jsx

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

export default function MeasurementTable({
  measurements,
  setWaitingForMeasurement,
  setModifyingField,
}) {
  if (!measurements || measurements.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 2 }}>
        No hay vanos registrados aún.
      </Typography>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Vanos registrados
        </Typography>

        <List dense>
          {measurements.map((m) => (
            <Box key={m.id} sx={{ mb: 2, borderBottom: "1px solid #ccc" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                {m.n_vano} — {m.n_proyecto}
              </Typography>

              {/* ANCHOS */}
              <FieldRow
                label="ANCHO 1"
                value={m.ancho_1}
                field="ancho_1"
                onSelect={() => {
                  setWaitingForMeasurement({ id: m.id, field: "ancho_1" });
                  setModifyingField({ field: "ancho_1", vano: m.n_vano });
                }}
              />

              <FieldRow
                label="ANCHO 2"
                value={m.ancho_2}
                field="ancho_2"
                onSelect={() => {
                  setWaitingForMeasurement({ id: m.id, field: "ancho_2" });
                  setModifyingField({ field: "ancho_2", vano: m.n_vano });
                }}
              />

              <FieldRow
                label="ANCHO 3"
                value={m.ancho_3}
                field="ancho_3"
                onSelect={() => {
                  setWaitingForMeasurement({ id: m.id, field: "ancho_3" });
                  setModifyingField({ field: "ancho_3", vano: m.n_vano });
                }}
              />

              {/* ALTOS */}
              <FieldRow
                label="ALTO 1"
                value={m.alto_1}
                field="alto_1"
                onSelect={() => {
                  setWaitingForMeasurement({ id: m.id, field: "alto_1" });
                  setModifyingField({ field: "alto_1", vano: m.n_vano });
                }}
              />

              <FieldRow
                label="ALTO 2"
                value={m.alto_2}
                field="alto_2"
                onSelect={() => {
                  setWaitingForMeasurement({ id: m.id, field: "alto_2" });
                  setModifyingField({ field: "alto_2", vano: m.n_vano });
                }}
              />

              <FieldRow
                label="ALTO 3"
                value={m.alto_3}
                field="alto_3"
                onSelect={() => {
                  setWaitingForMeasurement({ id: m.id, field: "alto_3" });
                  setModifyingField({ field: "alto_3", vano: m.n_vano });
                }}
              />
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

/* ⬇ COMPONENTE AUXILIAR PARA MOSTRAR UNA FILA DE MEDICIÓN */
function FieldRow({ label, value, onSelect }) {
  return (
    <ListItemButton onClick={onSelect} sx={{ py: 0.5 }}>
      <ListItemText
        primary={
          <Typography variant="body2">
            {label}: {value != null ? `${value} mm` : "- mm"}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
