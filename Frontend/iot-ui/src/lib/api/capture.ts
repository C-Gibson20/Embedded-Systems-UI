import type { ResultResponse, CaptureResponse } from "../Types";
import { API_BASE, FRONTEND_KEY } from "../base.ts"; 

export async function triggerCapture(
    deviceId: string, 
    pairingSecret: string
): Promise<CaptureResponse> {
    const res = await fetch(`${API_BASE}/api/v1/capture?device_id=${encodeURIComponent(deviceId)}`,
        {
            method: "POST",
            headers: {
                ...(FRONTEND_KEY ? { "ES-Frontend-Key": FRONTEND_KEY } : {}),
                "ES-Pairing-Secret": pairingSecret,
            },
        }
    );
    
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function pollForResult(
    deviceId: string,
    pairingSecret: string,
    opts?: { timeoutMs?: number; pollMs?: number }
): Promise<Extract<ResultResponse, { status: "completed" }>> {
    const timeoutMs = opts?.timeoutMs ?? 60000;
    const pollMs = opts?.pollMs ?? 1000;

    const cap = await triggerCapture(deviceId, pairingSecret);
    const expectedJobId = cap.job_id;

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const res = await fetch(`${API_BASE}/api/v1/result/${encodeURIComponent(deviceId)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as ResultResponse;

        if (data.device_id !== deviceId) {
            throw new Error("Mismatched device ID in result");
        }

        if (data.job_id !== expectedJobId) {
            await new Promise((r) => setTimeout(r, pollMs));
            continue;
        }

        if (data.status === "completed") return data;
        if (data.status === "error") throw new Error(data.error || "Pi job failed");

        await new Promise((r) => setTimeout(r, pollMs));
    }

    throw new Error("Timeout while waiting for result");
}