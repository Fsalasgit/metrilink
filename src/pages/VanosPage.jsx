// src/pages/VanosPage.jsx
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
  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="center" mt={2} mb={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {projectId || "Sin proyecto"}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          sx={{ bgcolor: "#000", color: "#fff", borderRadius: 0, px: 4 }}
          onClick={onAdd}
        >
          AGREGAR
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600}>
            Vanos
          </Typography>
          <TextField
            size="small"
            variant="standard"
            placeholder="...FILTRAR VANO"
            fullWidth
            sx={{ mt: 1, mb: 1 }}
          />
          <List dense>
            {vanos.map((v) => (
              <ListItemButton key={v.id} onClick={() => onOpenVano(v.n_vano)}>
                <ListItemText primary={v.n_vano} />
              </ListItemButton>
            ))}
            {vanos.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No hay vanos cargados.
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      <Box mt={2}>
        <Button
          startIcon={<ArrowBackIosNewIcon fontSize="small" />}
          size="small"
          onClick={onBack}
        >
          Volver a proyectos
        </Button>
      </Box>
    </>
  );
}
