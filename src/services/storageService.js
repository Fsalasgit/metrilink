// src/services/storageService.js

const STORAGE_KEY = "measurements";
const PROJECT_SYNC_STATUS_KEY = "project_sync_statuses";

export const loadMeasurements = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error cargando mediciones", error);
    return [];
  }
};

export const saveMeasurement = (updatedMeasurements) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedMeasurements)
    );
  } catch (error) {
    console.error("Error guardando mediciones", error);
  }
};

/**
 * Actualiza un solo campo de una medición.
 */
export const updateMeasurement = (id, field, value) => {
  const measurements = loadMeasurements();

  const updatedMeasurements = measurements.map((measurement) => {
    if (measurement.id !== id) {
      return measurement;
    }

    return {
      ...measurement,
      [field]:
        typeof value === "number"
          ? value
          : parseFloat(value),
      fecha_ultima_lectura: new Date().toLocaleString(),
    };
  });

  saveMeasurement(updatedMeasurements);

  return updatedMeasurements;
};

/**
 * Carga el estado de sincronización de todos los proyectos.
 *
 * Ejemplo:
 * {
 *   "1": {
 *     status: "sent",
 *     updatedAt: "2026-07-31T18:00:00.000Z"
 *   }
 * }
 */
export const loadProjectSyncStatuses = () => {
  try {
    const data = localStorage.getItem(
      PROJECT_SYNC_STATUS_KEY
    );

    if (!data) {
      return {};
    }

    const parsed = JSON.parse(data);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch (error) {
    console.error(
      "Error cargando estados de sincronización",
      error
    );

    return {};
  }
};

/**
 * Guarda el estado de un proyecto.
 *
 * Estados utilizados:
 * - pending: hay cambios pendientes
 * - sent: fue enviado correctamente a Google Sheets
 */
export const saveProjectSyncStatus = (
  projectId,
  status
) => {
  try {
    const projectKey = String(projectId || "").trim();

    if (!projectKey) {
      return loadProjectSyncStatuses();
    }

    const currentStatuses =
      loadProjectSyncStatuses();

    const updatedStatuses = {
      ...currentStatuses,
      [projectKey]: {
        status,
        updatedAt: new Date().toISOString(),
      },
    };

    localStorage.setItem(
      PROJECT_SYNC_STATUS_KEY,
      JSON.stringify(updatedStatuses)
    );

    return updatedStatuses;
  } catch (error) {
    console.error(
      "Error guardando estado de sincronización",
      error
    );

    return loadProjectSyncStatuses();
  }
};

export const clearProjectSyncStatuses = () => {
  localStorage.removeItem(
    PROJECT_SYNC_STATUS_KEY
  );
};

export const clearAllMeasurements = (setMeasurements) => {
  localStorage.removeItem(STORAGE_KEY);
  clearProjectSyncStatuses();

  if (setMeasurements) {
    setMeasurements([]);
  }
};
