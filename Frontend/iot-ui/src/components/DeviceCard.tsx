import { useMemo, useState } from "react";
import type { SavedDevice } from "../lib/devices/storage";
import type { DeviceStatus } from "../lib/Types";
import "../styles/DeviceCard.css";

type Props = {
  devices: SavedDevice[];
  selectedId: string | null;
  onSelect: (deviceId: string) => void;
  onAdd: (d: SavedDevice) => void;
  onRemove: (deviceId: string) => void;
  disabled?: boolean;
  deviceStatus: DeviceStatus;
};

export function DeviceCard({
  devices,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  disabled,
  deviceStatus,
}: Props) {
  // --- UI State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"select" | "add" | "remove">(
    "select"
  );
  
  // --- Form state for devices ---
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [pairingSecret, setPairingSecret] = useState("");
  const [removeId, setRemoveId] = useState<string>("");

  // Memoized lookups for current selection and form validation
  const selectedDevice = useMemo(
    () => devices.find((d) => d.deviceId === selectedId) ?? null,
    [devices, selectedId]
  );

  const canAdd = useMemo(
    () => !!name.trim() && !!deviceId.trim() && !!pairingSecret.trim(),
    [name, deviceId, pairingSecret]
  );

  const canRemove = useMemo(() => {
    const id = (removeId || selectedId || "").trim();
    return !!id;
  }, [removeId, selectedId]);

  // Reset modal state on exit
  function closeSettings() {
    setIsSettingsOpen(false);
    setSettingsTab("select");
    setRemoveId("");
  }

  return (
    <div className="device-card">
      <div className="device-card__top">
        <div>
          <div className="device-card__title">HANA Device</div>

          {selectedDevice ? (
            <div className="device-card__current">
              <div className="device-card__current-name">
                Name: {selectedDevice.name}
              </div>
              <div className="device-card__current-id">
                Device ID: {selectedDevice.deviceId}
              </div>
              <div className={`device-status device-status--${deviceStatus}`}>
                {deviceStatus === "paired" && "Paired"}
                {deviceStatus === "unpaired" && "Not Paired"}
                {deviceStatus === "unknown" && "Status Unknown"}
              </div>

            </div>
          ) : (
            <div className="device-card__hint">
              No device selected. Choose one in Manage Device.
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          className="device-card__button"
          onClick={() => setIsSettingsOpen((open) => !open)}
        >
          {isSettingsOpen ? "Close Settings" : "Manage Devices"}
        </button>
      </div>

      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Manage device"
          className="device-modal__backdrop"
        >
          <div className="device-modal__panel">
            <div className="device-modal__section-tabs">
              <button
                type="button"
                className={
                  settingsTab === "select"
                    ? "device-modal__section device-modal__section--active"
                    : "device-modal__section"
                }
                onClick={() => setSettingsTab("select")}
              >
                Select Device
              </button>

              <button
                type="button"
                className={
                  settingsTab === "add"
                    ? "device-modal__section device-modal__section--active"
                    : "device-modal__section"
                }
                onClick={() => setSettingsTab("add")}
              >
                Add Device
              </button>

              <button
                type="button"
                className={
                  settingsTab === "remove"
                    ? "device-modal__section device-modal__section--active"
                    : "device-modal__section"
                }
                onClick={() => setSettingsTab("remove")}
              >
                Remove Device
              </button>
            </div>

            {settingsTab === "select" && (
              <div className="device-modal__inputs">
                <div className="device-modal__hint">
                  Select the active HANA device.
                </div>

                <select
                  className="device-card__select"
                  disabled={disabled || devices.length === 0}
                  value={selectedId ?? ""}
                  onChange={(e) => onSelect(e.target.value)}
                >
                  <option value="" disabled>
                    Select Device…
                  </option>
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.name} ({d.deviceId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {settingsTab === "add" ? (
              <div className="device-modal__inputs">
                <input
                  className="device-modal__input"
                  disabled={disabled}
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="device-modal__input"
                  disabled={disabled}
                  placeholder="Device ID"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                />
                <input
                  className="device-modal__input"
                  disabled={disabled}
                  placeholder="Pairing Authentication"
                  value={pairingSecret}
                  onChange={(e) => setPairingSecret(e.target.value)}
                />

                <div>
                  <button
                    className="device-card__button"
                    disabled={disabled || !canAdd}
                    type="button"
                    onClick={() => {
                      onAdd({
                        name: name.trim(),
                        deviceId: deviceId.trim(),
                        pairingSecret: pairingSecret.trim(),
                      });
                      setName("");
                      setDeviceId("");
                      setPairingSecret("");
                      closeSettings();
                    }}
                  >
                    Add Device
                  </button>
                </div>
              </div>
            ) : settingsTab === "remove" ? (
              <div className="device-modal__inputs">
                <div className="device-modal__hint">Select device to remove.</div>

                <select
                  className="device-card__select"
                  disabled={disabled || devices.length === 0}
                  value={removeId || selectedId || ""}
                  onChange={(e) => setRemoveId(e.target.value)}
                >
                  <option value="" disabled>
                    Select Device...
                  </option>
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.name} ({d.deviceId})
                    </option>
                  ))}
                </select>

                <div className="device-modal__actions">
                  <button
                    className="device-card__button"
                    disabled={disabled || !canRemove}
                    type="button"
                    onClick={() => {
                      const id = (removeId || selectedId || "").trim();
                      if (!id) return;
                      onRemove(id);
                      setRemoveId("");
                      closeSettings();
                    }}
                  >
                    Remove Device
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
