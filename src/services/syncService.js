export async function syncMeasurementsToSheet(measurements) {
  const url = "https://script.google.com/macros/s/AKfycbwb6se2qiDJ_L5z-bXeVY4H_Q6kd2R-PhJNSlfp1VfqOF7dlI1j50lr9nYfS6V8fXHyhw/exec";

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