// src/services/syncService.js

const SYNC_URL =
  "https://script.google.com/macros/s/AKfycbyQ9lci7AB13WBmSf9M_0ynW1-yszce9FqldRu4uwOuc_okGXm7lkqe0XDn9_iP-WiCoQ/exec";

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
