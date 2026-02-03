// src/hooks/useMeasurements.js
import { useEffect, useMemo, useState } from "react";
import {
  loadMeasurements,
  saveMeasurement,
  updateMeasurement,
  clearAllMeasurements,
} from "../services/storageService";


export const calcularDesviacion = (valores) => {
  const nums = valores.filter(
    (v) => typeof v === "number" && !isNaN(v)
  );

  if (nums.length < 2) return null;

  return Math.max(...nums) - Math.min(...nums);
};


export function useMeasurements() {
  const [measurements, setMeasurements] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedVano, setSelectedVano] = useState(null);

  // Cargar al inicio
  useEffect(() => {
    const stored = loadMeasurements();
    setMeasurements(stored);
    if (stored.length > 0) {
      setSelectedProject(stored[0].n_proyecto);
    }
  }, []);

  // Proyectos únicos
  const projects = useMemo(() => {
    const map = new Map();
    measurements.forEach((m) => {
      if (m.n_proyecto && !map.has(m.n_proyecto)) {
        map.set(m.n_proyecto, { n_proyecto: m.n_proyecto });
      }
    });
    return Array.from(map.values());
  }, [measurements]);

  // Vanos del proyecto seleccionado
  const vanos = useMemo(
    () => measurements.filter((m) => m.n_proyecto === selectedProject),
    [measurements, selectedProject]
  );

  const selectedMeasurement =
    selectedProject && selectedVano
      ? measurements.find(
          (m) =>
            m.n_proyecto === selectedProject && m.n_vano === selectedVano
        )
      : null;

  // Crear proyecto (el primer vano se crea con addVano)
  const createProject = (projectNumber) => {
    setSelectedProject(projectNumber);
  };

  // Agregar VANO
  const addVano = (vanoCode) => {
    if (!selectedProject) return;

    const id = `${selectedProject}-${vanoCode}`;

    // Si ya existe, no lo pisamos
    if (measurements.some((m) => m.id === id)) {
      setSelectedVano(vanoCode);
      return;
    }

    const newMeasurement = {
      id,
      n_proyecto: selectedProject,
      n_vano: vanoCode,

      ancho_1: null,
      ancho_2: null,
      ancho_3: null,

      alto_1: null,
      alto_2: null,
      alto_3: null,

      desviacion_ancho: null,
      desviacion_alto: null,

      nota: "",
      fecha_ultima_lectura: null,
      ancho: null,
      alto: null,
    };

    const updated = [...measurements, newMeasurement];
    setMeasurements(updated);
    saveMeasurement(updated);
    setSelectedVano(vanoCode);
  };

  // 👇 Llamado cuando llega medición BLE
  const applyMeasurement = (id, field, value) => {
    let updated = updateMeasurement(id, field, value);

    updated = updated.map((m) => {
      if (m.id !== id) return m;

      const desviacion_ancho = calcularDesviacion([
        m.ancho_1,
        m.ancho_2,
        m.ancho_3,
      ]);

      const desviacion_alto = calcularDesviacion([
        m.alto_1,
        m.alto_2,
        m.alto_3,
      ]);

      return {
        ...m,
        desviacion_ancho,
        desviacion_alto,
      };
    });

    setMeasurements(updated);
    saveMeasurement(updated);
  };


  const updateNote = (id, nota) => {
    const updated = measurements.map((m) =>
      m.id === id ? { ...m, nota } : m
    );
    setMeasurements(updated);
    saveMeasurement(updated);
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
    clearAll,
  };
}


