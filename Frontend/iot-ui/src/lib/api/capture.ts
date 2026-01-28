import type { AnalysisResult } from "../Types";
import { API_BASE } from "./base.ts"; 

const FRONTEND_KEY = "falconWolfGoat";

type CaptureResponse = { job_id: string; status?: string };

type ResultResponse = {
    job_id: string;
    status: "capturing" | "processing" | "completed" | "error";
    result?: AnalysisResult;
    error?: string;
}

export async function triggerCapture(deviceId: string, pairingSecret: string): Promise<CaptureResponse> {
    const res = await fetch(
        `${API_BASE}/api/v1/capture?device_id=${encodeURIComponent(deviceId)}`,
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

export async function fetchResult(deviceId: string): Promise<ResultResponse> {
    const res = await fetch(`${API_BASE}/api/v1/result/${encodeURIComponent(deviceId)}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function pollForResult(
    deviceId: string,
    pairingSecret: string,
    opts?: { timeoutMs?: number; pollMs?: number }
): Promise<AnalysisResult> {
    const timeoutMs = opts?.timeoutMs ?? 60000;
    const pollMs = opts?.pollMs ?? 1000;

    await triggerCapture(deviceId, pairingSecret);

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const res = await fetch(`${API_BASE}/api/v1/result/${encodeURIComponent(deviceId)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        if (data.status === "completed" && data.result) return data.result;
        if (data.status === "error") throw new Error(data.error || "Pi job failed");

        await new Promise((resolve) => setTimeout(resolve, pollMs));
    }

    throw new Error("Timeout while waiting for result");
}