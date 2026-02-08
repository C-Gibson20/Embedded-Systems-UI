import { useEffect, useMemo, useState } from "react";
import { ImageBackground } from "../components/ImageBackground";
import { DeviceCard } from "../components/DeviceCard";
import {PlantPanel} from "../components/PlantPanel";
import { analyzeImage } from "../lib/api/analyze";  
import type { AnalysisResult, Maturation, DeviceStatus, SensorsResponse } from "../lib/Types";
import { pollForResult } from "../lib/api/capture"
import { getStoredPiImageUrl } from "../lib/api/piImage";
import { loadDevices, saveDevices, type SavedDevice } from "../lib/devices/storage";
import { sendInstructions } from "../lib/api/instructions";
import { SensorsCard } from "../components/SensorsCard";
import { fetchDeviceStatus } from "../lib/api/deviceStatus";
import { fetchPlantName } from "../lib/api/plantName";
import { fetchSensors } from "../lib/api/sensors";
import "../styles/App.css";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRunForCurrentImage, setHasRunForCurrentImage] = useState(false);
  const canAnalyze = useMemo(() => !!file && !isBusy, [file, isBusy]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [piImageUrl, setPiImageUrl] = useState<string | null>(null);
  const displayImageUrl = imageUrl ?? piImageUrl;

  const [devices, setDevices] = useState<SavedDevice[]>(() => loadDevices());
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    () => loadDevices()[0]?.deviceId ?? null
  );
  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId) ?? null;
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("unknown");

  const [isApplyingInstructions, setIsApplyingInstructions] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const showRunButton = !!file && !hasRunForCurrentImage;
  
  const [maturation, setMaturation] = useState<Maturation>("Mature");
  const [currentPlantName, setCurrentPlantName] = useState<string | null>(null);
  const [sensors, setSensors] = useState<SensorsResponse | null>(null);
  
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

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function refresh() {
      if (!selectedDevice) {
        setDeviceStatus("unknown");
        return;
      }
      try {
        const s = await fetchDeviceStatus(selectedDevice.deviceId, selectedDevice.pairingSecret);
        if (cancelled) return;
        setDeviceStatus(s.paired ? "paired" : "unpaired");
      } catch {
        if (cancelled) return;
        setDeviceStatus("unpaired");
      }
    }

    refresh();
    if (selectedDevice) timer = window.setInterval(refresh, 30000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [selectedDevice?.deviceId, selectedDevice?.pairingSecret]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentPlantName() {
      if (!selectedDevice) {
        setCurrentPlantName(null);
        return;
      }

      try {
        const name = await fetchPlantName(selectedDevice.deviceId);
        if (!cancelled) setCurrentPlantName(name);
      } catch {
        if (!cancelled) setCurrentPlantName(null);
      }
    }

    loadCurrentPlantName();
    return () => {
      cancelled = true;
    };
  }, [selectedDevice?.deviceId]);

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
      setCurrentPlantName(completed.result.label);
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

    const notesWithMaturation = [
      ...result.notes,
      `Maturation stage: ${maturation}`,
    ];

    try {
      const { deviceId, pairingSecret } = selectedDevice;
      await sendInstructions(deviceId, pairingSecret, activeJobId, notesWithMaturation);
      setHasUploaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setHasUploaded(false);
    } finally {
      setIsApplyingInstructions(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    setSensors(null);

    async function refresh() {
      if (!selectedDevice) {
        setSensors(null);
        return;
      }
      try {
        const s = await fetchSensors(selectedDevice.deviceId, selectedDevice.pairingSecret);
        if (!cancelled && s.device_id === selectedDevice.deviceId) setSensors(s);
      } catch {
        if (!cancelled) setSensors(null);
      }
    }

    refresh();
    if (selectedDevice) timer = window.setInterval(refresh, 60000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [selectedDevice?.deviceId, selectedDevice?.pairingSecret]);

  function clearAll() {
    setFile(null);
    setPiImageUrl(null);
    setResult(null);
    setError(null);
    setActiveJobId(null);
    setHasRunForCurrentImage(false);
    setMaturation("Mature");
    setHasUploaded(false);
    setIsApplyingInstructions(false);
  }

  return (
    <div className="app">
      <ImageBackground imageUrl={`${import.meta.env.BASE_URL}background_image.png`} dim={0.45} />
      
      <div className="app__content">
        <div className="app__container">
          <header className="app__header">
            <div className="app__title">HANA 花</div>
            <div className="app__subtitle">
              Intelligent Plant Care, Powered by AI.
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
              deviceStatus={deviceStatus}
            />
          </div>

          <div className="app__grid">
            <PlantPanel
              selectedDeviceId={selectedDeviceId}
              deviceStatus={deviceStatus}
              currentPlantName={currentPlantName}

              imageUrl={displayImageUrl}
              result={result}
              error={error}
              isBusy={isBusy}
              showRunButton={showRunButton}
              canAnalyze={canAnalyze}

              maturation={maturation}
              onMaturationChange={setMaturation}
              canUploadInstructions={!!selectedDevice && !!activeJobId}
              hasUploaded={hasUploaded}
              isApplyingInstructions={isApplyingInstructions}

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
              onRunAnalysis={runAnalysis}
              onUploadInstructions={uploadInstructions}

              collapseKey={selectedDeviceId}
            />

          </div>
          <div className="app__sensor-data">
              <SensorsCard 
                sensors={sensors}
              />  
          </div>
        </div>
      </div>
    </div>
  );
}
