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

export default function ProjectsPage({
  projects,
  syncStatuses = {},
  onSelect,
  onCreate,
}) {
  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography
            variant="subtitle2"
            fontWeight={600}
          >
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
            {projects.map((project) => {
              const projectKey = String(
                project.n_proyecto
              );

              const syncInfo =
                syncStatuses[projectKey];

              const isSent =
                syncInfo?.status === "sent";

              const hasPendingChanges =
                syncInfo?.status === "pending";

              let statusText = "SIN MEDIR";

              if (isSent) {
                statusText = "ENVIADO A SHEET";
              } else if (hasPendingChanges) {
                statusText = "CAMBIOS SIN ENVIAR";
              }

              return (
                <ListItemButton
                  key={project.n_proyecto}
                  onClick={() =>
                    onSelect(project.n_proyecto)
                  }
                >
                  <ListItemText
                    primary={project.n_proyecto}
                    secondary="CLIENTE"
                  />

                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color={
                      isSent
                        ? "success.main"
                        : "text.primary"
                    }
                    sx={{
                      maxWidth: 115,
                      textAlign: "right",
                      lineHeight: 1.15,
                    }}
                  >
                    {statusText}
                  </Typography>
                </ListItemButton>
              );
            })}

            {projects.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No hay proyectos aún.
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      <Box
        display="flex"
        justifyContent="center"
        mt={2}
      >
        <Button
          sx={{
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 0,
            px: 4,
          }}
          onClick={onCreate}
        >
          CREAR PR
        </Button>
      </Box>
    </>
  );
}
