import { STORAGE_KEY } from "../base";

// Metadata for a device saved in local storage
export type SavedDevice = {
    name: string;
    deviceId: string;
    pairingSecret: string;
};

// Retrieve saved devices from local storage
export function loadDevices(): SavedDevice[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as SavedDevice[]) : [];
    } catch {
        return [];
    }
}

// Save devices to local storage
export function saveDevices(devices: SavedDevice[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
}