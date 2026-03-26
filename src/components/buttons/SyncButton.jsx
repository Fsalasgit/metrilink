import { IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function SyncButton({ onSync }) {
  return (
    <IconButton onClick={onSync} color="primary">
      <CloudUploadIcon />
    </IconButton>
  );
}