import type { AnalysisResult } from "../Types";

const API_BASE =
  // import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
  import.meta.env.VITE_API_BASE_URL ?? "https://embedded-systems-ui.onrender.com";

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "Analysis failed";
    try {
      const err = await response.json();
      detail = err.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  return response.json() as Promise<AnalysisResult>;
}
