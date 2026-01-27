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

export async function triggerCapture(deviceId: string): Promise<CaptureResponse> {
    const res = await fetch(
        `${API_BASE}/api/v1/capture?device_id=${encodeURIComponent(deviceId)}`,
        {
            method: "POST",
            headers: FRONTEND_KEY ? { "ES-Frontend-Key": FRONTEND_KEY } : undefined,
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
    opts?: { timeoutMs?: number; pollMs?: number }
): Promise<AnalysisResult> {
    const timeoutMs = opts?.timeoutMs ?? 60000;
    const pollMs = opts?.pollMs ?? 1000;

    await triggerCapture(deviceId);

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const res = await fetchResult(deviceId);
        
        if (res.status === "completed" && res.result) return res.result;
        if (res.status === "error") throw new Error(res.error || "Pi job failed");

        await new Promise((resolve) => setTimeout(resolve, pollMs));
    }

    throw new Error("Timeout while waiting for result");
}