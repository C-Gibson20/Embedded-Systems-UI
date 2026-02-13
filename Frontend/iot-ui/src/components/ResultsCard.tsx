import type { AnalysisResult, Maturation } from "../lib/Types";
import "../styles/ResultsCard.css";

type Props = {
  result: AnalysisResult | null;
  isBusy?: boolean;
  error?: string | null;

  showRunButton: boolean;
  onRunAnalysis: () => void;
  isApplyingInstructions: boolean;
  onInstructionsUpload: () => void;
  canAnalyze: boolean;
  canUploadInstructions: boolean;

  maturation: Maturation;
  onMaturationChange: (m: Maturation) => void;

  hasUploaded: boolean;
  confirmation?: string | null;
};

export function ResultsCard({ 
  result, 
  isBusy, 
  error, 
  showRunButton, 
  onRunAnalysis, 
  isApplyingInstructions, 
  onInstructionsUpload, 
  canAnalyze, 
  maturation, 
  onMaturationChange,
  canUploadInstructions, 
  hasUploaded 
}: Props) {
  // --- UI State ---
  const uploadDisabled = isBusy || hasUploaded || isApplyingInstructions;

  return (
    <div className="results-card">
      <div className="results-card__header">
        <div className="results-card__title">Identification</div>
        <div className="results-card__subtitle">
          Process image for identification and care automation.
        </div>

        {showRunButton && (
          <button
            className="results-card__button"
            onClick={onRunAnalysis}
            disabled={!canAnalyze}
            type="button"
          >
            Run Analysis
          </button>
        )}
      </div>

      <div className="results-card__body">
        {isBusy && (
          <div>Processing…</div>
        )}

        {!isBusy && error && (
          <div className="results-card__error">
            {error}
          </div>
        )}

        {!isBusy && !error && !result && (
          <div>Capture an image, then run analysis.</div>
        )}

        {!isBusy && result && (
          <div className="results-card__result">
            <div className="results-card__result-header">
              <div className="results-card__label">
                {result.label}
              </div>
              {/* <div className="results-card__confidence">
                {(result.confidence * 100).toFixed(1)}% confidence
              </div> */}
            </div>

            <ul className="results-card__notes">
              {result.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>

            <label className="results-card__field">
              <div className="results-card__field-label">Maturation</div>
              <select
                className="results-card__select"
                value={maturation}
                onChange={(e) => onMaturationChange(e.target.value as Maturation)}
              >
                <option value="Seedling">Seedling</option>
                <option value="Mature">Mature</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruiting">Fruiting</option>
              </select>
            </label>

            {canUploadInstructions && (
              <button
                className="results-card__button"
                onClick={onInstructionsUpload}
                disabled={uploadDisabled}
                type="button"
              >
                {hasUploaded
                  ? "Care Routine Updated"
                  : isApplyingInstructions
                  ? "Updating Care Instructions…"
                  : "Update Care Instructions"}
              </button>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
