// src/hooks/useMeasurements.js

import { useEffect, useMemo, useState } from "react";
import {
  loadMeasurements,
  saveMeasurement,
  clearAllMeasurements,
} from "../services/storageService";

export const calcularDesviacion = (valores) => {
  const nums = valores
    .filter(
      (valor) =>
        valor !== null &&
        valor !== undefined &&
        valor !== ""
    )
    .map((valor) => Number(valor))
    .filter((valor) => Number.isFinite(valor));

  if (nums.length < 2) return null;

  return Math.max(...nums) - Math.min(...nums);
};

export function useMeasurements() {
  const [measurements, setMeasurements] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedVano, setSelectedVano] = useState(null);

  // Actualiza el estado y guarda automáticamente en localStorage.
  const updateAndSaveMeasurements = (updateFunction) => {
    setMeasurements((currentMeasurements) => {
      const updatedMeasurements = updateFunction(currentMeasurements);

      saveMeasurement(updatedMeasurements);

      return updatedMeasurements;
    });
  };

  // Cargar mediciones guardadas al iniciar.
  useEffect(() => {
    const stored = loadMeasurements();

    setMeasurements(Array.isArray(stored) ? stored : []);

    if (Array.isArray(stored) && stored.length > 0) {
      setSelectedProject(stored[0].n_proyecto);
    }
  }, []);

  // Proyectos únicos.
  const projects = useMemo(() => {
    const projectMap = new Map();

    measurements.forEach((measurement) => {
      if (
        measurement.n_proyecto &&
        !projectMap.has(measurement.n_proyecto)
      ) {
        projectMap.set(measurement.n_proyecto, {
          n_proyecto: measurement.n_proyecto,
        });
      }
    });

    return Array.from(projectMap.values());
  }, [measurements]);

  // Vanos correspondientes al proyecto seleccionado.
  const vanos = useMemo(() => {
    return measurements.filter(
      (measurement) =>
        measurement.n_proyecto === selectedProject
    );
  }, [measurements, selectedProject]);

  // Medición correspondiente al vano seleccionado.
  const selectedMeasurement = useMemo(() => {
    if (!selectedProject || !selectedVano) {
      return null;
    }

    return (
      measurements.find(
        (measurement) =>
          measurement.n_proyecto === selectedProject &&
          measurement.n_vano === selectedVano
      ) || null
    );
  }, [measurements, selectedProject, selectedVano]);

  // Crear proyecto.
  const createProject = (projectNumber) => {
    const normalizedProject = String(projectNumber || "").trim();

    if (!normalizedProject) return;

    setSelectedProject(normalizedProject);
  };

  // Agregar vano.
  const addVano = (vanoCode) => {
    const normalizedVano = String(vanoCode || "").trim();

    if (!selectedProject || !normalizedVano) return;

    const id = `${selectedProject}-${normalizedVano}`;

    // Si ya existe, simplemente lo seleccionamos.
    if (measurements.some((measurement) => measurement.id === id)) {
      setSelectedVano(normalizedVano);
      return;
    }

    const newMeasurement = {
      id,
      n_proyecto: selectedProject,
      n_vano: normalizedVano,

      ancho_1: null,
      ancho_2: null,
      ancho_3: null,

      alto_1: null,
      alto_2: null,
      alto_3: null,

      desviacion_ancho: null,
      desviacion_alto: null,

      revoque: "",
      tapajunta: "",
      apertura: "",
      embutida: "",
      revestimiento: "",
      npt: "",
      nota: "",

      fotos: [],

      fecha_ultima_lectura: null,

      ancho: null,
      alto: null,
    };

    updateAndSaveMeasurements((currentMeasurements) => [
      ...currentMeasurements,
      newMeasurement,
    ]);

    setSelectedVano(normalizedVano);
  };

  // Aplicar medición manual o proveniente del láser.
  const applyMeasurement = (id, field, value) => {
    const numericValue = Number(value);

    if (!id || !field || !Number.isFinite(numericValue)) {
      return;
    }

    updateAndSaveMeasurements((currentMeasurements) =>
      currentMeasurements.map((measurement) => {
        if (measurement.id !== id) {
          return measurement;
        }

        const updatedMeasurement = {
          ...measurement,
          [field]: numericValue,
          fecha_ultima_lectura: new Date().toLocaleString(),
        };

        const desviacionAncho = calcularDesviacion([
          updatedMeasurement.ancho_1,
          updatedMeasurement.ancho_2,
          updatedMeasurement.ancho_3,
        ]);

        const desviacionAlto = calcularDesviacion([
          updatedMeasurement.alto_1,
          updatedMeasurement.alto_2,
          updatedMeasurement.alto_3,
        ]);

        return {
          ...updatedMeasurement,
          desviacion_ancho: desviacionAncho,
          desviacion_alto: desviacionAlto,
        };
      })
    );
  };

  // Actualizar observación.
  const updateNote = (id, nota) => {
    updateAndSaveMeasurements((currentMeasurements) =>
      currentMeasurements.map((measurement) =>
        measurement.id === id
          ? {
              ...measurement,
              nota,
              fecha_ultima_lectura: new Date().toLocaleString(),
            }
          : measurement
      )
    );
  };

  // Actualizar cualquier campo del vano.
  const updateField = (id, field, value) => {
    if (!id || !field) return;

    updateAndSaveMeasurements((currentMeasurements) =>
      currentMeasurements.map((measurement) =>
        measurement.id === id
          ? {
              ...measurement,
              [field]: value,
              fecha_ultima_lectura: new Date().toLocaleString(),
            }
          : measurement
      )
    );
  };

  // Agregar foto al vano.
  const addPhotoToMeasurement = (id, photoData) => {
    if (!id || !photoData) return;

    updateAndSaveMeasurements((currentMeasurements) =>
      currentMeasurements.map((measurement) =>
        measurement.id === id
          ? {
              ...measurement,
              fotos: [
                ...(Array.isArray(measurement.fotos)
                  ? measurement.fotos
                  : []),
                photoData,
              ],
              fecha_ultima_lectura: new Date().toLocaleString(),
            }
          : measurement
      )
    );
  };

  // Eliminar foto del vano localmente.
  // Esta función debe ejecutarse después de que Drive confirme la eliminación.
  const removePhotoFromMeasurement = (measurementId, fileId) => {
    if (!measurementId || !fileId) return;

    updateAndSaveMeasurements((currentMeasurements) =>
      currentMeasurements.map((measurement) => {
        if (measurement.id !== measurementId) {
          return measurement;
        }

        const currentPhotos = Array.isArray(measurement.fotos)
          ? measurement.fotos
          : [];

        return {
          ...measurement,
          fotos: currentPhotos.filter(
            (photo) => photo?.fileId !== fileId
          ),
          fecha_ultima_lectura: new Date().toLocaleString(),
        };
      })
    );
  };

  const calculateDeviation = (values) => {
    const nums = values
      .map((value) => value?.value ?? value)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      )
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    if (nums.length < 2) return null;

    const min = Math.min(...nums);
    const max = Math.max(...nums);

    return {
      min,
      max,
      deviation: max - min,
    };
  };

  const clearAll = () => {
    clearAllMeasurements(setMeasurements);
    setSelectedProject(null);
    setSelectedVano(null);
  };

  return {
    measurements,
    projects,

    selectedProject,
    setSelectedProject,

    vanos,

    selectedVano,
    setSelectedVano,

    selectedMeasurement,

    createProject,
    addVano,

    applyMeasurement,
    updateNote,
    updateField,

    addPhotoToMeasurement,
    removePhotoFromMeasurement,

    clearAll,
    calculateDeviation,
  };
}