// src/components/buttons/ClearButton.jsx
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ClearButton({ onClear }) {
  return (
    <Tooltip title="Borrar todas las mediciones">
      <IconButton size="small" onClick={onClear}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  );
}
