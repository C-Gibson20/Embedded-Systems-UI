import { useEffect, useState } from "react";
import type { AnalysisResult, Maturation, DeviceStatus } from "../lib/Types";
import { ImageInputCard } from "./ImageInputCard";
import { ResultsCard } from "./ResultsCard";
import { CurrentPlantCard } from "./CurrentPlantCard";
import "../styles/PlantPanel.css";

type Props = {
  selectedDeviceId: string | null;
  deviceStatus: DeviceStatus;
  currentPlantName: string | null;

  imageUrl: string | null;
  result: AnalysisResult | null;
  error: string | null;
  isBusy: boolean;
  showRunButton: boolean;
  canAnalyze: boolean;

  maturation: Maturation;
  onMaturationChange: (m: Maturation) => void;
  canUploadInstructions: boolean;
  hasUploaded: boolean;
  isApplyingInstructions: boolean;

  onPickFile: (f: File) => void;
  onTakePhoto: () => void;
  onClear: () => void;
  onRunAnalysis: () => void;
  onUploadInstructions: () => void;

  collapseKey?: string | null;
};

export function PlantPanel({
  selectedDeviceId,
  deviceStatus,
  currentPlantName,

  imageUrl,
  result,
  error,
  isBusy,
  showRunButton,
  canAnalyze,

  maturation,
  onMaturationChange,
  canUploadInstructions,
  hasUploaded,
  isApplyingInstructions,

  onPickFile,
  onTakePhoto,
  onClear,
  onRunAnalysis,
  onUploadInstructions,

  collapseKey,
}: Props) {
  // --- UI State --- 
  const [isManaging, setIsManaging] = useState(false);
  const canManage = !!selectedDeviceId && deviceStatus === "paired";
  const manageLabel = currentPlantName ? "Manage Plant" : "Identify Plant";

  // Reset management panel when device selection changes or panel is collapsed
  useEffect(() => {
    setIsManaging(false);
  }, [collapseKey]);

  return (
    <div className="plant-panel">
      <CurrentPlantCard
        deviceSelected={!!selectedDeviceId}
        deviceStatus={deviceStatus}
        currentPlantName={currentPlantName}
        isManaging={isManaging}
        
        onToggleManage={() => {
          if (!canManage) return;
          setIsManaging((v) => !v);
        }}
        buttonLabel={isManaging ? "Close" : manageLabel}
        buttonDisabled={!canManage}
      />

      {isManaging && (
        <div className="plant-panel__manage">
          <div className="plant-panel__grid">
            <ImageInputCard
              imageUrl={imageUrl}
              onPickFile={onPickFile}
              onTakePhoto={onTakePhoto}
              onClear={onClear}
              isBusy={isBusy}
            />

            <ResultsCard
              result={result}
              isBusy={isBusy}
              error={error}
              showRunButton={showRunButton}
              onRunAnalysis={onRunAnalysis}
              onInstructionsUpload={onUploadInstructions}
              canAnalyze={canAnalyze}
              maturation={maturation}
              onMaturationChange={onMaturationChange}
              canUploadInstructions={canUploadInstructions}
              hasUploaded={hasUploaded}
              isApplyingInstructions={isApplyingInstructions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
