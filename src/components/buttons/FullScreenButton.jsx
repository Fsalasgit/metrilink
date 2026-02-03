// src/components/buttons/FullScreenButton.jsx
import { IconButton, Tooltip } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

export default function FullScreenButton({ isFullscreen, onToggle }) {
  return (
    <Tooltip title={isFullscreen ? "Salir de fullscreen" : "Fullscreen"}>
      <IconButton size="small" onClick={onToggle}>
        <CheckBoxOutlineBlankIcon />
      </IconButton>
    </Tooltip>
  );
}
