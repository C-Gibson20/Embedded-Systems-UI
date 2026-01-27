const API_BASE = import.meta.env.VITE_API_BASE as string;

export function getStoredPiImageUrl(deviceId: string) {
    return `${API_BASE}/api/v1/pi-image/${encodeURIComponent(deviceId)}`;
}