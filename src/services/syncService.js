export async function syncMeasurementsToSheet(measurements) {
  const url = "https://script.google.com/macros/s/AKfycbwr97zjI1gUuwV3DO4VX-xOv71WgyFZCh4LFepj3DC7B-9CzKMPcx5uzos5sD965Yls5A/exec";

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