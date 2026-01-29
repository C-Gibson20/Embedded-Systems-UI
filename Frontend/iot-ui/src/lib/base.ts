function required(name: string): string {
  const v = import.meta.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const API_BASE = required("VITE_API_BASE");
export const FRONTEND_KEY = required("VITE_FRONTEND_KEY");
export const STORAGE_KEY = required("VITE_STORAGE_KEY");