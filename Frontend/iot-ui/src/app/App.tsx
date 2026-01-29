import { useEffect, useMemo, useState } from "react";
import { ImageInputCard } from "../components/ImageInputCard";
import { ResultsCard } from "../components/ResultsCard";
import { ImageBackground } from "../components/ImageBackground";
import { DeviceCard } from "../components/DeviceCard";
import { analyzeImage } from "../lib/api/analyze";  
import type { AnalysisResult } from "../lib/Types";
import { pollForResult } from "../lib/api/capture"
import { getStoredPiImageUrl } from "../lib/api/piImage";
import { loadDevices, saveDevices, type SavedDevice } from "../lib/devices/storage";
import { sendInstructions } from "../lib/api/instructions";
import "../styles/App.css";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRunForCurrentImage, setHasRunForCurrentImage] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [piImageUrl, setPiImageUrl] = useState<string | null>(null);
  const displayImageUrl = imageUrl ?? piImageUrl;

  const [devices, setDevices] = useState<SavedDevice[]>(() => loadDevices());
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    () => loadDevices()[0]?.deviceId ?? null
  );

  const [isApplyingInstructions, setIsApplyingInstructions] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    saveDevices(devices);
    if (!selectedDeviceId && devices[0]) setSelectedDeviceId(devices[0].deviceId);
  }, [devices, selectedDeviceId]);

  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId) ?? null;

  const canAnalyze = useMemo(() => !!file && !isBusy, [file, isBusy]);

  const showRunButton = !!file && !hasRunForCurrentImage;

  async function runAnalysis() {
    if (!file || isBusy) return;

    setIsBusy(true);
    setError(null);
    setResult(null);

    try {
      const r = await analyzeImage(file);
      setResult(r);
      setHasRunForCurrentImage(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setHasRunForCurrentImage(false);
    } finally {
      setIsBusy(false);
    }
  }

  async function runAnalysisCapture() {
    if (isBusy) return;

    if (!selectedDevice) {
      setError("No device selected");
      return;
    }

    setIsBusy(true);
    setError(null);
    setResult(null);

    try {
      const { deviceId, pairingSecret } = selectedDevice;
      const completed = await pollForResult(deviceId, pairingSecret, { timeoutMs: 90000, pollMs: 1000 });

      setActiveJobId(completed.job_id);
      setResult(completed.result);
      setFile(null);
      setPiImageUrl(getStoredPiImageUrl(completed.job_id));
      setHasRunForCurrentImage(true);
      setHasUploaded(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setHasRunForCurrentImage(false);
    } finally {
      setIsBusy(false); 
    }
  }

  async function uploadInstructions() {
    if (!result || isApplyingInstructions || isBusy) return;

    if (!selectedDevice) {
      setError("No device selected");
      return;
    }

    if (!activeJobId) {
      setError("No active jobs available for instructions upload");
      return;
    }
    
    setIsApplyingInstructions(true);
    setError(null);

    try {
      const { deviceId, pairingSecret } = selectedDevice;
      await sendInstructions(deviceId, pairingSecret, activeJobId, result.notes);
      setHasUploaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setHasUploaded(false);
    } finally {
      setIsApplyingInstructions(false);
    }
  }

  function clearAll() {
    setFile(null);
    setPiImageUrl(null);
    setResult(null);
    setError(null);
    setActiveJobId(null);
    setHasRunForCurrentImage(false);
    setHasUploaded(false);
    setIsApplyingInstructions(false);
  }

  return (
    <div className="app">
      <ImageBackground imageUrl={`${import.meta.env.BASE_URL}background_image.png`} dim={0.45} />
      
      <div className="app__content">
        <div className="app__container">
          <header className="app__header">
            <div className="app__title">PlantIO</div>
            <div className="app__subtitle">
              Intelligent plant recognition for automated care.
            </div>
          </header>

          <div className="app__device-picker">
            <DeviceCard
              devices={devices}
              selectedId={selectedDeviceId}
              onSelect={(id) => setSelectedDeviceId(id)}
              disabled={isBusy}
              onAdd={(d) => setDevices((prev) => [...prev.filter(x => x.deviceId !== d.deviceId), d])}
              onRemove={(id) => {
                setDevices((prev) => prev.filter(d => d.deviceId !== id));
                setSelectedDeviceId((cur) => (cur === id ? null : cur));
              }}
            />
          </div>

          <div className="app__grid">
            <ImageInputCard
              imageUrl={displayImageUrl}
              onPickFile={(f) => {
                setPiImageUrl(null);
                setFile(f);
                setResult(null);
                setError(null);
                setActiveJobId(null);
                setIsApplyingInstructions(false);
                setHasRunForCurrentImage(false);
                setHasUploaded(false);
              }}
              onTakePhoto={runAnalysisCapture}
              onClear={clearAll}
              isBusy={isBusy}
            />
            <ResultsCard 
              result={result} 
              isBusy={isBusy} 
              error={error} 
              showRunButton={showRunButton}
              onRunAnalysis={runAnalysis}
              onInstructionsUpload={uploadInstructions}
              canAnalyze={canAnalyze}
              canUploadInstructions={!!selectedDevice && !!activeJobId}
              hasUploaded={hasUploaded}
              isApplyingInstructions={isApplyingInstructions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
