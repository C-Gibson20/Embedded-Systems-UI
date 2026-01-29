import type { InstructionDispatchResponse, InstructionStatusResponse } from "../Types";
import { API_BASE, FRONTEND_KEY } from "../base"; 

async function getStatus(
    deviceId: string, 
    pairingSecret: string,
    instructionId: string
): Promise<InstructionStatusResponse> {
    const res = await fetch(`${API_BASE}/api/v1/instructions/status/${encodeURIComponent(deviceId)}?instruction_id=${encodeURIComponent(instructionId)}`, {
        headers: {
            "ES-Frontend-Key": FRONTEND_KEY,
            "ES-Pairing-Secret": pairingSecret,
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function sendInstructions(
    deviceId: string,
    pairingSecret: string,
    jobId: string,
    notes: string[],
    opts?: { timeoutMs?: number, pollMs?: number }
): Promise<string> {
    const timeoutMs = opts?.timeoutMs ?? 30000;
    const pollMs = opts?.pollMs ?? 1000;

    const dispatch = await fetch(`${API_BASE}/api/v1/instructions?device_id=${encodeURIComponent(deviceId)}`, {
        method: "POST",
        headers: {
            "ES-Frontend-Key": FRONTEND_KEY,
            "ES-Pairing-Secret": pairingSecret,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_id: jobId, notes }),
    });

    if (!dispatch.ok) throw new Error(await dispatch.text());
    const dispatched = (await dispatch.json()) as InstructionDispatchResponse;

    const instructionId = dispatched.instruction_id;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
        const s = await getStatus(deviceId, pairingSecret, instructionId);

        if (s.status === "applied") return s.message ?? "Instructions applied successfully.";
        if (s.status === "error") throw new Error(s.error ?? "Error applying instructions.");

        await new Promise(r => setTimeout(r, pollMs));
    }

    throw new Error("Timeout waiting for instruction to be applied.");
}
