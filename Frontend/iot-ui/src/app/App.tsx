import { useEffect, useMemo, useState } from "react";
import { ImageInputCard } from "../components/ImageInputCard";
import { ResultsCard } from "../components/ResultsCard";
// import { mockProcessImage } from "../lib/MockProcessing";
import { analyzeImage } from "../lib/api/analyze";  
import type { AnalysisResult } from "../lib/Types";
import { ImageBackground } from "../components/ImageBackground";
import { pollForResult } from "../lib/api/capture"
import { getStoredPiImageUrl } from "../lib/api/piImage";
import { loadDevices, saveDevices, type SavedDevice } from "../lib/devices/storage";
import { DevicePicker } from "../components/DevicePicker";
import "../styles/App.css";
// import { VideoBackground } from "../components/VideoBackground";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hasRunForCurrentImage, setHasRunForCurrentImage] = useState(false);

  const [piImageUrl, setPiImageUrl] = useState<string | null>(null);
  const displayImageUrl = imageUrl ?? piImageUrl;

  const [devices, setDevices] = useState<SavedDevice[]>(() => loadDevices());
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(() => loadDevices()[0]?.deviceId ?? null);

  // Create/revoke object URL cleanly
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

  async function runAnalysis() {
    if (!file || isBusy) return;

    setHasRunForCurrentImage(true);

    setIsBusy(true);
    setError(null);
    setResult(null);

    try {
      // const r = await mockProcessImage(file);
      const r = await analyzeImage(file);
      setResult(r);
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
    setHasRunForCurrentImage(true);

    try {
      const { deviceId, pairingSecret } = selectedDevice;
      const r = await pollForResult(deviceId, pairingSecret, { timeoutMs: 90000, pollMs: 1000 });
      setResult(r);

      setFile(null);
      setPiImageUrl(getStoredPiImageUrl(deviceId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setHasRunForCurrentImage(false);
    } finally {
      setIsBusy(false);
    }
  }

  function clearAll() {
    setFile(null);
    setPiImageUrl(null);
    setResult(null);
    setError(null);
    setHasRunForCurrentImage(false);
  }

  const showRunButton = !!file && !hasRunForCurrentImage;
 
  return (
    <div className="app">
      <ImageBackground imageUrl={`${import.meta.env.BASE_URL}background_image.png`} dim={0.45} />
      {/* <ImageBackground imageUrl="/background_image.png" dim={0.45} /> */}
      {/* <VideoBackground dim={0.6} /> */}

      <div className="app__content">
        <div className="app__container">
          <header className="app__header">
            <div className="app__title">PlantIO</div>
            <div className="app__subtitle">
              Intelligent plant recognition for automated care.
            </div>
          </header>

          <div className="app__device-picker">
            <DevicePicker
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
              canAnalyze={canAnalyze}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
