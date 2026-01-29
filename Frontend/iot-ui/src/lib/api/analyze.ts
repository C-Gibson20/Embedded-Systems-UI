import type { AnalysisResult } from "../Types";
import { API_BASE } from "../base"; 

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
      /*  */
    }
    throw new Error(detail);
  }

  return response.json() as Promise<AnalysisResult>;
}
