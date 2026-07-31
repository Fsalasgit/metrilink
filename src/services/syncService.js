export async function syncMeasurementsToSheet(measurements) {
  const url = "https://script.google.com/macros/s/AKfycbxTlq_x_BmoOz5ziXa_aF1onqqiEtOZSF2F8ztKQW9AoQ_Sw91fHqXQO-JayhYwQCydLw/exec";

  const payload = {
    token: "MI_TOKEN_SEGURO",
    source: "metrilink",
    sentAt: new Date().toISOString(),
    measurements,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}