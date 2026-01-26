import type { AnalysisResult } from "./Types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockProcessImage(_file: File): Promise<AnalysisResult> {
  // Simulate latency + deterministic-ish output
  await sleep(800);

  // Replace this later with a real backend call.
  return {
    label: "Example plant",
    confidence: 0.87,
    notes: [
      "Mock result (no backend yet).",
      "Lighting looks OK. Try filling more of the frame with the leaf.",
    ],
  };
}
