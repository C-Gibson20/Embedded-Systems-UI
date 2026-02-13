import { API_BASE } from "../base";
import type { ResultResponse } from "../Types";

// Fetches the plant name from the backend based on the device's latest analysis result
export async function fetchPlantName(
  deviceId: string
): Promise<string | null> {
  // Query the backend for the latest result associated with the device ID
  const res = await fetch(
    `${API_BASE}/api/v1/result/${encodeURIComponent(deviceId)}`,
  );

  if (!res.ok) return null;
  const data = await res.json() as ResultResponse;

  // return the plant name if the analysis is completed and a label is available, otherwise return null
  if (data.status === "completed" && data.result?.label) {
    return data.result.label;
  }

  return null;
}
