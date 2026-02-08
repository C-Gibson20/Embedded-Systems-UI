import type { SensorsResponse } from "../lib/Types";
import { Meter, SensorError, SensorLoading } from "./SensorReadings";
import "../styles/SensorsCard.css";

type Props = {
  sensors: SensorsResponse | null;
};

const waterTicks = [0, 33, 66, 100];
const waterLabels = ["Low", "Medium", "High"];

const lightTicks = [0, 25, 50, 75, 100];
const lightLabels = ["Low", "Medium", "Bright Indirect", "Bright Direct"];

function timeAgo(lastUpdated: Date) {
    const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (mins < 1) return "Just Now";
    if (mins === 1) return "1 Minute Ago";
    return `${mins} Minutes Ago`;
}

export function SensorsCard({
  sensors,
}: Props) {

  const updated = sensors?.water.status === "ok" || sensors?.light.status === "ok";
  const mostRecentUpdate = sensors
    ? Math.max(
        sensors.water.status === "ok" ? sensors.water.updatedAt : 0,
        sensors.light.status === "ok" ? sensors.light.updatedAt : 0
      )
    : 0;
  const hasUpdate = mostRecentUpdate > 0 && Number.isFinite(mostRecentUpdate);

  return (
    <div className="sensor-card">
      <div>
        <div className="sensor-card__title">Environment</div>
        <div>Live environmental data from your HANA device.</div>
      </div>
      <div className="sensor-card__updated">
        {hasUpdate
          ? `Updated ${timeAgo(new Date(mostRecentUpdate))}`
          : "Awaiting first sensor reading"}
      </div>

      {sensors?.water.status === "ok" && (
        <Meter
          label="Soil Moisture Level"
          value={sensors.water.value}
          ticks={waterTicks}
          labels={waterLabels}
        />
      )}

      {sensors?.water.status === "loading" && (
        <SensorLoading label="Soil Moisture Sensor" />
      )}

      {sensors?.water.status === "error" && (
        <SensorError label="Soil Moisture Sensor" />
      )}


      {sensors?.light.status === "ok" && (
        <Meter
          label="Light Level"
          value={sensors.light.value}
          ticks={lightTicks}
          labels={lightLabels}
        />
      )}

      {sensors?.light.status === "loading" && (
        <SensorLoading label="Light Sensor" />
      )}

      {sensors?.light.status === "error" && (
        <SensorError label="Light Sensor" />
      )}

    </div>
  );
}
