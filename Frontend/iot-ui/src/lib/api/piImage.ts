import { API_BASE } from "./base.ts"; 

export function getStoredPiImageUrl(deviceId: string) {
    return `${API_BASE}/api/v1/pi/stored_image/${encodeURIComponent(deviceId)}`;
}