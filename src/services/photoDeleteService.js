// src/services/photoDeleteService.js

// Usá la URL de la implementación del Apps Script anterior.
const PHOTO_API_URL =
  "https://script.google.com/macros/s/AKfycbxFCpOVRN8raqlSgyBZ6fVOrm-MCusAO29LIiY9Mjc6hQ4KVL3zsgxrkNSkNLH-2rY17w/exec";

const API_TOKEN = "MI_TOKEN_SEGURO";

/**
 * Elimina una fotografía de Google Drive.
 *
 * El archivo se mueve a la papelera.
 * Si Drive devuelve un error, la foto no debe quitarse
 * del estado local de React.
 */
export async function deletePhotoFromDrive(fileId) {
  const normalizedFileId = String(fileId || "").trim();

  if (!normalizedFileId) {
    throw new Error("La fotografía no tiene un fileId válido.");
  }

  let response;

  try {
    response = await fetch(PHOTO_API_URL, {
      method: "POST",

      // text/plain evita el preflight CORS de Apps Script.
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },

      body: JSON.stringify({
        token: API_TOKEN,
        action: "delete_photo",
        fileId: normalizedFileId,
      }),
    });
  } catch (error) {
    console.error("Error de conexión al eliminar foto:", error);

    throw new Error(
      "No se pudo conectar con Google Drive."
    );
  }

  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch (error) {
    console.error(
      "Respuesta inválida de Apps Script:",
      responseText
    );

    throw new Error(
      "Apps Script devolvió una respuesta inválida."
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.error ||
        `Error HTTP ${response.status} al eliminar la fotografía.`
    );
  }

  if (result.ok !== true) {
    throw new Error(
      result?.error ||
        "No se pudo eliminar la fotografía de Google Drive."
    );
  }

  return result;
}