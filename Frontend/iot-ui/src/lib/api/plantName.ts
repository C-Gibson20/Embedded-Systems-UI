import { API_BASE, FRONTEND_KEY } from "../base";
import type { ResultResponse } from "../Types";

export async function fetchPlantName(
  deviceId: string
): Promise<string | null> {
  const res = await fetch(
    `${API_BASE}/api/v1/result/${encodeURIComponent(deviceId)}`,
  );

  if (!res.ok) return null;

  const data = await res.json() as ResultResponse;

  if (data.status === "completed" && data.result?.label) {
    return data.result.label;
  }

  return null;
}
