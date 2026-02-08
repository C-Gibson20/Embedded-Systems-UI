import type { SensorsResponse } from "../Types";
import { API_BASE, FRONTEND_KEY } from "../base";

export async function fetchSensors(deviceId: string, pairingSecret: string): Promise<SensorsResponse> {
  const res = await fetch(`${API_BASE}/api/v1/sensors/${encodeURIComponent(deviceId)}`, {
    headers: {
      ...(FRONTEND_KEY ? { "ES-Frontend-Key": FRONTEND_KEY } : {}),
      "ES-Pairing-Secret": pairingSecret,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
