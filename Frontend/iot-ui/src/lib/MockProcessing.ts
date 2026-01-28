import type { AnalysisResult } from "./Types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockProcessImage(_file: File): Promise<AnalysisResult> {
  await sleep(800);

  return {
    label: "Example plant",
    confidence: 0.87,
    notes: [
      "Mock result (no backend connection).",
    ],
  };
}
