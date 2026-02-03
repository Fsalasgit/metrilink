// src/services/storageService.js

const STORAGE_KEY = "measurements";

export const loadMeasurements = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error("Error cargando mediciones", e);
    return [];
  }
};

export const saveMeasurement = (updatedMeasurements) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeasurements));
  } catch (e) {
    console.error("Error guardando mediciones", e);
  }
};

/**
 * Actualiza UN solo campo (ancho_1, alto_2, etc) de un vano.
 * Conserva TODO lo demás.
 */
export const updateMeasurement = (id, field, value) => {
  let measurements = loadMeasurements();

  let updatedMeasurements = measurements.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        [field]:
          typeof value === "number" ? value : parseFloat(value),
        fecha_ultima_lectura: new Date().toLocaleString(),
      };
    }
    return m;
  });

  saveMeasurement(updatedMeasurements);
  return updatedMeasurements;
};

export const clearAllMeasurements = (setMeasurements) => {
  localStorage.removeItem(STORAGE_KEY);
  if (setMeasurements) setMeasurements([]);
};
