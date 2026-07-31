// src/services/syncService.js

const SYNC_URL =
  "https://script.google.com/macros/s/AKfycbx2ow_Y4glYcBha8_N4vMhDoKU3S4Sbsh3x-pG_20Vj8BJ_c9XtC8gGkdL-GkWrcjc7lg/exec";

export async function syncMeasurementsToSheet(measurements) {
  const payload = {
    token: "MI_TOKEN_SEGURO",
    action: "sync_measurements",
    source: "metrilink",
    sentAt: new Date().toISOString(),
    measurements,
  };

  const response = await fetch(SYNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Error HTTP al sincronizar: ${response.status}`
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Apps Script no devolvió una respuesta JSON válida."
    );
  }

  if (!data?.ok) {
    throw new Error(
      data?.error ||
        "Apps Script informó que la sincronización falló."
    );
  }

  return data;
}
