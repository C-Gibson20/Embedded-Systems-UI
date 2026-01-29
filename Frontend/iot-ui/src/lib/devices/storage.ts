import { STORAGE_KEY } from "../base";

export type SavedDevice = {
    name: string;
    deviceId: string;
    pairingSecret: string;
};

export function loadDevices(): SavedDevice[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as SavedDevice[]) : [];
    } catch {
        return [];
    }
}

export function saveDevices(devices: SavedDevice[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
}