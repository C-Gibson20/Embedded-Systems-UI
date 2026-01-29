import type { AnalysisResult } from "../lib/Types";
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

  hasUploaded: boolean;
  confirmation?: string | null;
};

export function ResultsCard({ result, isBusy, error, showRunButton, onRunAnalysis, isApplyingInstructions, onInstructionsUpload, canAnalyze, hasUploaded }: Props) {
  const uploadDisabled = isBusy || hasUploaded || isApplyingInstructions;

  return (
    <div className="results-card">
      <div className="results-card__header">
        <div className="results-card__title">Result</div>
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
          <div>Select an image, then run analysis.</div>
        )}

        {result && (
          <div className="results-card__result">
            <div className="results-card__result-header">
              <div className="results-card__label">
                {result.label}
              </div>
              <div className="results-card__confidence">
                {(result.confidence * 100).toFixed(1)}% confidence
              </div>
            </div>

            <ul className="results-card__notes">
              {result.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>

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
          </div>
        )}
      </div>
    </div>
  );
}
