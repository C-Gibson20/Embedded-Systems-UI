export type SavedDevice = {
    name: string;
    deviceId: string;
    pairingSecret: string;
};

const KEY = "pi_devices_v1";

export function loadDevices(): SavedDevice[] {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as SavedDevice[]) : [];
    } catch {
        return [];
    }
}

export function saveDevices(devices: SavedDevice[]) {
    localStorage.setItem(KEY, JSON.stringify(devices));
}