// src/components/buttons/ConnectButton.jsx
import { IconButton, Tooltip } from "@mui/material";
import BluetoothIcon from "@mui/icons-material/Bluetooth";

export default function ConnectButton({ onConnect }) {
  return (
    <Tooltip title="Conectar medidor">
      <IconButton size="small" onClick={onConnect}>
        <BluetoothIcon />
      </IconButton>
    </Tooltip>
  );
}
