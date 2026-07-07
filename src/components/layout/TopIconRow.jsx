import { Box } from "@mui/material";
import ConnectButton from "../buttons/ConnectButton";
import ClearButton from "../buttons/ClearButton";
import FullScreenButton from "../buttons/FullScreenButton";
import SyncButton from "../buttons/SyncButton";

export default function TopIconRow({
  onConnect,
  onClear,
  isFullscreen,
  onFullscreen,
  onSync,
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
      <ConnectButton onConnect={onConnect} />
      <ClearButton onClear={onClear} />
      {onSync && <SyncButton onSync={onSync} />}
      <FullScreenButton isFullscreen={isFullscreen} onToggle={onFullscreen} />
    </Box>
  );
}