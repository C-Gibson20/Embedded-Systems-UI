
import type { DeviceStatus } from "../lib/Types";
import "../styles/CurrentPlantCard.css";

type Props = {
  deviceSelected: boolean;
  deviceStatus: DeviceStatus;
  currentPlantName: string | null;

  isManaging: boolean;
  onToggleManage: () => void;

  buttonLabel: string;
  buttonDisabled?: boolean;
};


export function CurrentPlantCard({
  deviceSelected,
  deviceStatus,
  currentPlantName,
  isManaging,
  onToggleManage,
}: Props) {
  const canManage = deviceSelected && deviceStatus === "paired";
  
  const subtitle = (!deviceSelected || deviceStatus === "unpaired")
    ? "Please select and pair a HANA device to view its current plant."
    : currentPlantName
    ? `Last identified plant for this HANA device.`
    : "Identify a plant to begin automated care.";

  const buttonLabel = currentPlantName ? (isManaging ? "Close" : "Manage Plant") : "Setup Plant";

  return (
    <div className="current-plant-card">
      <div className="current-plant-card__header">
          <div className="current-plant-card__title">Plant</div>
          <div className="current-plant-card__subtitle">{subtitle}</div>
      
          {currentPlantName && (
            <div className="current-plant-card__plant">
              <div className="current-plant-card__name">{currentPlantName}</div>
            </div>
          )}
      </div>

        <button
          className="current-plant-card__button"
          onClick={onToggleManage}
          disabled={!canManage}
          type="button"
        >
          {buttonLabel}
        </button>
      
    </div>
  );
}
