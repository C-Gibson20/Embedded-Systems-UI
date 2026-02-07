export type AnalysisResult = {
  label: string;
  confidence: number;
  notes: string[];
};

export type CaptureResponse = { 
  job_id: string; 
  status?: string 
};

export type ResultResponse =
  | { device_id: string; job_id: string; status: "capturing" | "processing" }
  | { device_id: string; job_id: string; status: "completed"; result: AnalysisResult }
  | { device_id: string; job_id: string; status: "error"; error?: string };

export type InstructionDispatchResponse = {
  device_id: string;
  instruction_id: string;
  job_id: string;
  status: "dispatching";
};

export type InstructionStatusResponse =
  | { device_id: string; instruction_id: string; job_id: string; status: "dispatching" }
  | { device_id: string; instruction_id: string; job_id: string; status: "applied"; message: string }
  | { device_id: string; instruction_id: string; job_id: string; status: "error"; error: string };

export type Maturation = "Seedling" | "Mature" | "Flowering" | "Fruiting";