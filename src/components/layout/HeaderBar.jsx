// src/components/layout/HeaderBar.jsx
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function HeaderBar({ screen }) {
  const title =
    screen === "projects"
      ? "Medidor laser"
      : screen === "vanos" || screen === "vanoDetail"
      ? "VANOS"
      : "";

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <IconButton size="small">
        <MenuIcon />
      </IconButton>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="subtitle1" fontWeight={700} color="error">
        ML
      </Typography>
    </Box>
  );
}
