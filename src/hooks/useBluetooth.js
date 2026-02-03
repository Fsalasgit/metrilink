// src/hooks/useBluetooth.js
import { useEffect, useRef, useState } from "react";
import {
  connectToBoschGLM,
  startMeasurementListener,
} from "../services/bluetoothService";

export function useBluetooth(onNewMeasurement) {
  const [status, setStatus] = useState("Estado: offline");
  const [waitingForMeasurement, setWaitingForMeasurement] = useState(null);

  const waitingRef = useRef(waitingForMeasurement);
  useEffect(() => {
    waitingRef.current = waitingForMeasurement;
  }, [waitingForMeasurement]);

  const handleConnect = async () => {
    setStatus("🔍 Buscando Bosch GLM...");
    await connectToBoschGLM(
      (msg) => {
        setStatus(msg);
        startMeasurementListener(onNewMeasurement, () => waitingRef.current);
      },
      (err) => {
        setStatus(err);
      }
    );
  };

  const waitForField = (meta) => {
    setWaitingForMeasurement(meta); // { id, field, vano }
  };

  const clearWaiting = () => setWaitingForMeasurement(null);

  return {
    status,
    waitingForMeasurement,
    handleConnect,
    waitForField,
    clearWaiting,
  };
}
