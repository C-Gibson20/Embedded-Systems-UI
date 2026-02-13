import type { ResultResponse, CaptureResponse } from "../Types";
import { API_BASE, FRONTEND_KEY } from "../base"; 

// Signals the Pi to capture an image and begin analysis
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

// Orchestrates the capture command and polls the backend 
// Until the hardware returns a finished analysis or the timeout is reached
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
    // Loop until timeout exceeded
    while (Date.now() - start < timeoutMs) {
        const res = await fetch(`${API_BASE}/api/v1/result/${encodeURIComponent(deviceId)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as ResultResponse;

        // Security check to ensure the returned result corresponds to the correct device
        if (data.device_id !== deviceId) {
            throw new Error("Mismatched device ID in result");
        }

        // Ignore results of previous captures, only process the current job
        if (data.job_id !== expectedJobId) {
            await new Promise((r) => setTimeout(r, pollMs));
            continue;
        }

        // Return on successful completion or throw if Pi reports an error
        if (data.status === "completed") return data;
        if (data.status === "error") throw new Error(data.error || "Pi job failed");

        await new Promise((r) => setTimeout(r, pollMs));
    }

    throw new Error("Timeout while waiting for result");
}