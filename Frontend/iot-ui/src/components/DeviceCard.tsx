import { useMemo, useState } from "react";
import type { SavedDevice } from "../lib/devices/storage";
import "../styles/DeviceCard.css";

type Props = {
  devices: SavedDevice[];
  selectedId: string | null;
  onSelect: (deviceId: string) => void;
  onAdd: (d: SavedDevice) => void;
  onRemove: (deviceId: string) => void;
  disabled?: boolean;
};

export function DeviceCard({
  devices,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  disabled,
}: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"add" | "remove">("add");

  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [pairingSecret, setPairingSecret] = useState("");

  const [removeId, setRemoveId] = useState<string>("");

  const canAdd = useMemo(
    () => !!name.trim() && !!deviceId.trim() && !!pairingSecret.trim(),
    [name, deviceId, pairingSecret]
  );

  const canRemove = useMemo(() => {
    const id = (removeId || selectedId || "").trim();
    return !!id;
  }, [removeId, selectedId]);

  function closeSettings() {
    setIsSettingsOpen(false);
    setSettingsTab("add");
    setRemoveId("");
  }

  return (
    <div className="device-card">
      <div>
        <div className="device-card__title">Device</div>
        <div>Select a PlantIO device from the list, or manage devices in settings.</div>
      </div>

      <div className="device-card__controls">
        <select
          className="device-card__select"
          disabled={disabled || devices.length === 0}
          value={selectedId ?? ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="" disabled>
            Select device…
          </option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.name} ({d.deviceId})
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={disabled}
          className="device-card__button"
          onClick={() => setIsSettingsOpen(true)}
        >
          Device Settings
        </button>
      </div>
      
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Device settings"
          className="device-modal__backdrop"
        >
          <div className="device-modal__panel">
            <div className="device-modal__section-tabs">
              <button
                type="button"
                className={
                  settingsTab === "add"
                    ? "device-modal__section device-modal__section--active"
                    : "device-modal__section"
                }
                onClick={() => setSettingsTab("add")}
              >
                Add device
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
                Remove device
              </button>
            </div>

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

                  <button
                    className="device-card__button"
                    type="button"
                    onClick={closeSettings}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="device-modal__inputs">
                <div className="device-modal__hint">
                  Select device to remove.
                </div>

                <select
                  className="device-card__select"
                  disabled={disabled || devices.length === 0}
                  value={removeId || selectedId || ""}
                  onChange={(e) => setRemoveId(e.target.value)}
                >
                  <option value="" disabled>
                    Select device...
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
                    Remove
                  </button>

                  <button
                    className="device-card__button"
                    type="button"
                    onClick={closeSettings}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
