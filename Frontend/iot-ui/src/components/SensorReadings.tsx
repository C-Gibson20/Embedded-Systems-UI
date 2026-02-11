import "../styles/SensorReadings.css";

export function Meter({
  label,
  value,
  ticks,
  labels,
}: {
  label: string;
  value: number;
  ticks: number[];
  labels: string[];
}) {
  return (
    <div className="meter">
      <div className="meter__header">
        <div className="meter__label">{label}</div>
        <div className="meter__value">{Math.round(value)}%</div>
      </div>

      <div className="meter__track">
        <div className="meter__fill" style={{ width: `${value}%` }} />
        <div className="meter__marker" style={{ left: `${value}%` }} />
        <div className="meter__ticks">
          {ticks.map((t) => (
            <span key={t} className="meter__tick" style={{ left: `${t}%` }} />
          ))}
        </div>
      </div>

      <div className="meter__labels">
        {labels.map((l, i) => {
          const midpoint = (ticks[i] + ticks[i + 1]) / 2;
          return (
            <span
              key={l}
              className="meter__label-item"
              style={{ left: `${midpoint}%` }}
            >
              {l}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function SensorError({ label}: { label: string }) {
    return (
        <div className="sensor-error">
            <div className="sensor-error__title">{label} Unavailable</div>
            <div className="sensor-error__message">Please reset your HANA device and check connection.</div>
        </div>
    );
}

export function SensorLoading({ label }: { label: string }) {
  
  return (
    <div className="sensor-missing">
      <div className="sensor-missing__title">{label}</div>
      <div className="sensor-missing__message">
        {label} data will be made visible after first reading from your HANA device.
      </div>
    </div>
  );
}