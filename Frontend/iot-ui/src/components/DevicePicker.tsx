import {useMemo, useState} from "react";
import type { SavedDevice } from "../lib/devices/storage";

type Props = {
    devices: SavedDevice[];
    selectedId: string | null;
    onSelect: (deviceId: string) => void;
    onAdd: (d: SavedDevice) => void;
    onRemove: (deviceId: string) => void;
    disabled?: boolean;
}

export function DevicePicker({ devices, selectedId, onSelect, onAdd, onRemove, disabled }: Props) {
    const [name, setName] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [pairingSecret, setPairingSecret] = useState("");

    const canAdd = useMemo(
        () => !!name.trim() && !!deviceId.trim() && !!pairingSecret.trim(), 
        [name, deviceId, pairingSecret]
    );

return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
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

        {selectedId && (
          <button disabled={disabled} onClick={() => onRemove(selectedId)} type="button">
            Remove
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <input disabled={disabled} placeholder="Name (e.g. Kitchen)" value={name} onChange={(e) => setName(e.target.value)} />
        <input disabled={disabled} placeholder="Device ID (e.g. pi-01)" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
        <input disabled={disabled} placeholder="Pairing secret" value={pairingSecret} onChange={(e) => setPairingSecret(e.target.value)} />

        <button
          disabled={disabled || !canAdd}
          type="button"
          onClick={() => {
            onAdd({ name: name.trim(), deviceId: deviceId.trim(), pairingSecret: pairingSecret.trim() });
            setName(""); setDeviceId(""); setPairingSecret("");
          }}
        >
          Add device
        </button>
      </div>
    </div>
  );
}    