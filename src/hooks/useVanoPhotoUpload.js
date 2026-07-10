// src/hooks/useVanoPhotoUpload.js

import { useState } from "react";
import { comprimirImagen } from "../utils/imageUtils";
import { uploadVanoPhoto } from "../services/photoService";
import { buildVanoPhotoFileName } from "../utils/fileNameUtils";

const API_TOKEN = "MI_TOKEN_SEGURO";

export function useVanoPhotoUpload({
  selectedProject,
  selectedMeasurement,
  addPhotoToMeasurement,
}) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState(false);

  const handleCapturePhoto = async (file) => {
    if (!selectedMeasurement) {
      setPhotoError(true);
      setPhotoMessage("No hay vano seleccionado.");
      throw new Error("No hay vano seleccionado.");
    }

    try {
      setUploadingPhoto(true);
      setPhotoError(false);
      setPhotoMessage("Preparando foto...");

      const compressed = await comprimirImagen(file);

      const fileName = buildVanoPhotoFileName({
        projectId: selectedProject,
        vanoId: selectedMeasurement.n_vano,
      });

      setPhotoMessage("Subiendo foto a Drive...");

      const uploaded = await uploadVanoPhoto({
        token: API_TOKEN,
        projectId: selectedProject,
        vanoId: selectedMeasurement.n_vano,
        imageBase64: compressed.base64,
        imageType: compressed.type,
        fileName,
      });

      const photoData = {
        fileId: uploaded.fileId,
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName || fileName,
        projectFolderUrl: uploaded.projectFolderUrl || "",
        fecha: new Date().toISOString(),
      };

      addPhotoToMeasurement(selectedMeasurement.id, photoData);

      setPhotoError(false);
      setPhotoMessage("Foto guardada correctamente.");

      return photoData;
    } catch (error) {
      console.error("Error subiendo foto:", error);
      setPhotoError(true);
      setPhotoMessage("No se pudo guardar la foto.");
      throw error;
    } finally {
      setUploadingPhoto(false);
    }
  };

  return {
    uploadingPhoto,
    photoMessage,
    photoError,
    handleCapturePhoto,
  };
}