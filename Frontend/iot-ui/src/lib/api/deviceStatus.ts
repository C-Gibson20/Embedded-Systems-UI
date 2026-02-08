import { API_BASE, FRONTEND_KEY } from "../base";
import type { DeviceStatusResponse } from "../Types";

export async function fetchDeviceStatus(
  deviceId: string,
  pairingSecret: string
): Promise<DeviceStatusResponse> {
  const res = await fetch(
    `${API_BASE}/api/v1/device/status/${encodeURIComponent(deviceId)}`,
    {
      headers: {
        ...(FRONTEND_KEY ? { "ES-Frontend-Key": FRONTEND_KEY } : {}),
        "ES-Pairing-Secret": pairingSecret,
      },
    }
  );

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
