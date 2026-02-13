import { API_BASE } from "../base"; 

// Constructs the URL to access a previously captured image from the Pi based on the job ID
export function getStoredPiImageUrl(jobId: string) {
    return `${API_BASE}/api/v1/pi/stored_image/${encodeURIComponent(jobId)}`;
}