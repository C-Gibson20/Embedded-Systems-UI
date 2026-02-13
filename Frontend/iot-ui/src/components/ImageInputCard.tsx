import { useRef } from "react";
import "../styles/ImageInputCard.css";

type Props = {
  imageUrl: string | null;
  onPickFile: (file: File) => void;
  onTakePhoto: () => void;
  onClear: () => void;
  isBusy?: boolean;
};

export function ImageInputCard({
  imageUrl,
  onPickFile,
  onTakePhoto,
  onClear,
  isBusy,
}: Props) {
  // --- Refs ---
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="image-card">
      <div className="image-card__header">
        <div>
          <div className="image-card__title">Capture</div>
          <div className="image-card__subtitle">
            Capture image from camera on HANA device.
          </div>
        </div>

        <div>
          <button
            className="image-card__button"
            onClick={onTakePhoto}
            disabled={isBusy}
            type="button"
          >
            Capture Image
          </button>

          {imageUrl && (
            <button
              className="image-card__button"
              onClick={onClear}
              disabled={isBusy}
              type="button"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        className="image-card__input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPickFile(file);
          e.currentTarget.value = "";
        }}
      />

      <div className="image-card__preview">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Selected"
            className="image-card__image"
          />
        ) : (
          <div className="image-card__placeholder"></div>
        )}
      </div>
    </div>
  );
}
