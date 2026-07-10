// src/services/photoService.js

const PHOTO_UPLOAD_URL =
  "https://script.google.com/macros/s/AKfycbz4CtTIQHEK9vWba6TE8hMzdTCACJLBS43Svyqgo1Z9HQMt0_jiUdjKP_1AmAx3NLmxzQ/exec"

export async function uploadVanoPhoto({
  token,
  projectId,
  vanoId,
  imageBase64,
  imageType,
  fileName,
}) {
  const payload = {
    token,
    action: "uploadVanoPhoto",
    source: "metrilink",
    sentAt: new Date().toISOString(),

    projectId,
    vanoId,
    fileName,
    imageBase64,
    imageType,
  };

  const response = await fetch(PHOTO_UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data || data.status !== "ok") {
    throw new Error(data?.message || "No se pudo subir la foto.");
  }

  return data;
}