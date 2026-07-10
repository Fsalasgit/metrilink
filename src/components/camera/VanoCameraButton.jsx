// src/components/camera/VanoCameraButton.jsx

import { Button } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function VanoCameraButton({ onCapture, disabled }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onCapture?.(file);

    e.target.value = "";
  };

  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<PhotoCameraIcon />}
      fullWidth
      disabled={disabled}
      sx={{ borderRadius: 0, mt: 2 }}
    >
      TOMAR FOTO DEL VANO

      <input
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleChange}
      />
    </Button>
  );
}