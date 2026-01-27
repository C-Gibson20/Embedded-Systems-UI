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
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="image-card">
      <div className="image-card__header">
        <div>
          <div className="image-card__title">Upload Image</div>
          <div className="image-card__subtitle">
            Upload an image (or capture from camera on supported devices).
          </div>
        </div>

        <div className="image-card__actions">
          <button
            className="image-card__button"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            type="button"
          >
            Choose Image
          </button>

          <button
            className="pi-image-card__button"
            onClick={onTakePhoto}
            disabled={isBusy}
            type="button"
          >
            Take Photo
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
          <div className="image-card__placeholder">
            No Image Selected
          </div>
        )}
      </div>
    </div>
  );
}
