// src/pages/ProjectsPage.jsx
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

export default function ProjectsPage({ projects, onSelect, onCreate }) {
  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600}>
            Proyectos
          </Typography>
          <TextField
            size="small"
            variant="standard"
            placeholder="...FILTRAR PR"
            fullWidth
            sx={{ mt: 1, mb: 1 }}
          />
          <List dense>
            {projects.map((p) => (
              <ListItemButton key={p.n_proyecto} onClick={() => onSelect(p.n_proyecto)}>
                <ListItemText primary={p.n_proyecto} secondary="CLIENTE" />
                <Typography variant="caption" fontWeight={600}>
                  SIN MEDIR
                </Typography>
              </ListItemButton>
            ))}
            {projects.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No hay proyectos aún.
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          sx={{ bgcolor: "#000", color: "#fff", borderRadius: 0, px: 4 }}
          onClick={onCreate}
        >
          CREAR PR
        </Button>
      </Box>
    </>
  );
}
