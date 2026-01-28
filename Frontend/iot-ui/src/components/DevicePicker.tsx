import { useMemo, useState } from "react";
import type { SavedDevice } from "../lib/devices/storage";
import "../styles/DevicePicker.css";

type Props = {
  devices: SavedDevice[];
  selectedId: string | null;
  onSelect: (deviceId: string) => void;
  onAdd: (d: SavedDevice) => void;
  onRemove: (deviceId: string) => void;
  disabled?: boolean;
};

export function DevicePicker({
  devices,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  disabled,
}: Props) {
  // Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"add" | "remove">("add");

  // Add device form state
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [pairingSecret, setPairingSecret] = useState("");

  // Remove device state (lets you remove any device, not only selected)
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
    <div className="device-picker" style={{ display: "grid", gap: 10 }}>
      <div className="device-picker__header" style={{ display: "grid", gap: 4 }}>
        <div className="device-picker__title">Device</div>
        <div className="device-picker__subtitle">
          Select a PlantIO device from the list, or manage devices in settings.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          className="device-picker__select"
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
          className="device-settings__button"
          onClick={() => setIsSettingsOpen(true)}
        >
          Device settings
        </button>
      </div>

      {/* Modal / Popup */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Device settings"
          className="device-modal__backdrop device-modal__backdrop--open"
        >
          <div className="device-modal__panel device-modal__panel--open">

            {/* Tabs */}
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

            {/* Content */}
            {settingsTab === "add" ? (
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  className={"device-modal__input"}
                  disabled={disabled}
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className={"device-modal__input"}
                  disabled={disabled}
                  placeholder="Device ID"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                />
                <input
                  className={"device-modal__input"}
                  disabled={disabled}
                  placeholder="Pairing Authentication"
                  value={pairingSecret}
                  onChange={(e) => setPairingSecret(e.target.value)}
                />

                <div className="device-modal__actions">
                  <button
                    className="add-device__button"
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
                    type="button"
                    className="device-modal__secondary"
                    onClick={closeSettings}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <div className="device-modal__hint">
                  Select device to remove.
                </div>

                <select
                  className="device-picker__select"
                  disabled={disabled || devices.length === 0}
                  value={removeId || selectedId || ""}
                  onChange={(e) => setRemoveId(e.target.value)}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
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
                    className="remove-device__button"
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
                    type="button"
                    className="device-modal__secondary"
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


// import {useMemo, useState} from "react";
// import type { SavedDevice } from "../lib/devices/storage";
// import "../styles/DevicePicker.css";

// type Props = {
//     devices: SavedDevice[];
//     selectedId: string | null;
//     onSelect: (deviceId: string) => void;
//     onAdd: (d: SavedDevice) => void;
//     onRemove: (deviceId: string) => void;
//     disabled?: boolean;
// }

// export function DevicePicker({ devices, selectedId, onSelect, onAdd, onRemove, disabled }: Props) {
//     const [name, setName] = useState("");
//     const [deviceId, setDeviceId] = useState("");
//     const [pairingSecret, setPairingSecret] = useState("");

//     const canAdd = useMemo(
//         () => !!name.trim() && !!deviceId.trim() && !!pairingSecret.trim(), 
//         [name, deviceId, pairingSecret]
//     );

// return (
//     <div style={{ display: "grid", gap: 8 }}>
//       <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//         <select
//           className="device-picker__select"
//           disabled={disabled || devices.length === 0}
//           value={selectedId ?? ""}
//           onChange={(e) => onSelect(e.target.value)}
//         >
//           <option value="" disabled>
//             Select device…
//           </option>
//           {devices.map((d) => (
//             <option key={d.deviceId} value={d.deviceId}>
//               {d.name} ({d.deviceId})
//             </option>
//           ))}
//         </select>

//         {selectedId && (
//           <button className="remove-device__button" disabled={disabled} onClick={() => onRemove(selectedId)} type="button">
//             Remove
//           </button>
//         )}
//       </div>

//       <div style={{ display: "grid", gap: 6 }}>
//         <div className="device-picker__title">Select Device</div>
//         <div className="device-picker__subtitle">
//           Select a PlantIO device from the list or pair new device.
//         </div>
//         <input disabled={disabled} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
//         <input disabled={disabled} placeholder="Device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
//         <input disabled={disabled} placeholder="Pairing Authentication" value={pairingSecret} onChange={(e) => setPairingSecret(e.target.value)} />

//         <button
//           className="add-device__button"
//           disabled={disabled || !canAdd}
//           type="button"
//           onClick={() => {
//             onAdd({ name: name.trim(), deviceId: deviceId.trim(), pairingSecret: pairingSecret.trim() });
//             setName(""); setDeviceId(""); setPairingSecret("");
//           }}
//         >
//           Add device
//         </button>
//       </div>
//     </div>
//   );
// }    