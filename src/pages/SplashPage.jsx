// src/pages/SplashPage.jsx
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";

export default function SplashPage({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 1500);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Metri<span style={{ color: "#e53935" }}>Link</span>
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        by ABALUM
      </Typography>
    </Box>
  );
}
