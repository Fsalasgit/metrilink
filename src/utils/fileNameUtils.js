// src/utils/fileNameUtils.js

export const sanitizeFilePart = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "_");
};

export const buildDateFileName = () => {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, "0");

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("") + "_" + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
};

export const buildVanoPhotoFileName = ({ projectId, vanoId }) => {
  const projectSafe = sanitizeFilePart(projectId);
  const vanoSafe = sanitizeFilePart(vanoId);
  const dateSafe = buildDateFileName();

  return `${projectSafe}_${vanoSafe}_${dateSafe}.jpg`;
};