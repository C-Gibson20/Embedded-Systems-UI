import { API_BASE } from "../base.ts"; 

export function getStoredPiImageUrl(jobId: string) {
    return `${API_BASE}/api/v1/pi/stored_image/${encodeURIComponent(jobId)}`;
}