// src/services/bluetoothService.js

let characteristicRef = null;

/**
 * Conecta al Bosch GLM via BLE
 * onSuccess(msg), onError(msg)
 */

// export const connectToBoschGLM = async (onSuccess, onError) => {
//   try {
//     console.log("🔍 Buscando Bosch GLM...");

//     const device = await navigator.bluetooth.requestDevice({
//       acceptAllDevices: true,
//       optionalServices: ["02a6c0d0-0451-4000-b000-fb3210111989"], // servicio GLM
//     });

//     console.log(`✅ Dispositivo encontrado: ${device.name || "Sin nombre"}`);

//     const server = await device.gatt.connect();
//     console.log("🔗 Conectado al GATT Server.");

//     const service = await server.getPrimaryService(
//       "02a6c0d0-0451-4000-b000-fb3210111989"
//     );

//     characteristicRef = await service.getCharacteristic(
//       "02a6c0d1-0451-4000-b000-fb3210111989"
//     );

//     // Comando AutoSync (ejemplo)
//     const autoSyncCommand = new Uint8Array([0xc0, 0x55, 0x02, 0x01, 0x00, 0x1a]);
//     await characteristicRef.writeValue(autoSyncCommand);
//     console.log("📡 Comando AutoSync enviado.");

//     onSuccess("✅ Conexión BLE exitosa.");
//   } catch (error) {
//     console.error("❌ Error al conectar:", error);
//     onError("❌ Error al conectar.");
//   }
// };

const GLM_SERVICE_UUID = "02a6c0d0-0451-4000-b000-fb3210111989";
const GLM_CHARACTERISTIC_UUID = "02a6c0d1-0451-4000-b000-fb3210111989";

// Poné acá el nombre REAL con el que aparece el dispositivo
const TARGET_DEVICE_NAME = "GLM 50-27 CG x6028"; 
// o usá namePrefix si no estás segura del nombre exacto

export const connectToBoschGLM = async (onSuccess, onError) => {
  try {
    console.log("🔍 Buscando Bosch GLM...");

    const device = await navigator.bluetooth.requestDevice({
      filters: [
        // opción 1: nombre exacto
        // { name: TARGET_DEVICE_NAME },

        // opción 2: prefijo
        { namePrefix: TARGET_DEVICE_NAME },
      ],
      optionalServices: [GLM_SERVICE_UUID],
    });

    console.log("✅ Dispositivo encontrado:", {
      name: device.name,
      id: device.id, // esto NO es la MAC
    });

    const server = await device.gatt.connect();
    console.log("🔗 Conectado al GATT Server.");

    const service = await server.getPrimaryService(GLM_SERVICE_UUID);

    characteristicRef = await service.getCharacteristic(
      GLM_CHARACTERISTIC_UUID
    );

    const autoSyncCommand = new Uint8Array([0xc0, 0x55, 0x02, 0x01, 0x00, 0x1a]);
    await characteristicRef.writeValue(autoSyncCommand);
    console.log("📡 Comando AutoSync enviado.");

    onSuccess(`✅ Conectado a ${device.name || "dispositivo BLE"}`);
  } catch (error) {
    console.error("❌ Error al conectar:", error);
    onError("❌ Error al conectar.");
  }
};


/**
 * Arranca listener de mediciones
 * onMeasurement(distance, meta)
 * getWaitingForMeasurement() → { id, field, vano }
 */
export const startMeasurementListener = (onMeasurement, getWaitingForMeasurement) => {
  if (!characteristicRef) {
    console.error("⚠️ No hay characteristic BLE activa.");
    return;
  }

  console.log("📡 Iniciando escucha de mediciones...");
  characteristicRef.startNotifications();

  characteristicRef.addEventListener("characteristicvaluechanged", (event) => {
    const value = new Uint8Array(event.target.value.buffer);
    if (value.length < 10) return;

    // Validación de cabecera (ejemplo GLM)
    if (value[0] !== 0xc0 || value[1] !== 0x55 || value[2] === 0xa1) return;

    // Distancia en metros flotante, offset 7, little endian (check con tu doc)
    const dataView = new DataView(value.buffer);
    const distance = dataView.getFloat32(7, true);
    const distanceRounded = Math.round(distance * 1000);

    if (!distanceRounded || distanceRounded === 0) {
      console.warn("⚠️ Medición 0 ignorada.");
      return;
    }

    console.log("📏 Medición recibida:", distanceRounded, "mm");

    const waiting = getWaitingForMeasurement && getWaitingForMeasurement();
    if (!waiting || !waiting.id || !waiting.field) {
      console.warn("⚠️ No hay campo esperando medición, se ignora.");
      return;
    }

    onMeasurement(distanceRounded, { ...waiting });
  });
};
