// src/components/layout/TopIconRow.jsx
import { Box } from "@mui/material";
import ConnectButton from "../buttons/ConnectButton";
import ClearButton from "../buttons/ClearButton";
import FullScreenButton from "../buttons/FullScreenButton";

export default function TopIconRow({
  onConnect,
  onClear,
  isFullscreen,
  onFullscreen,
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
      <ConnectButton onConnect={onConnect} />
      <ClearButton onClear={onClear} />
      <FullScreenButton isFullscreen={isFullscreen} onToggle={onFullscreen} />
    </Box>
  );
}
