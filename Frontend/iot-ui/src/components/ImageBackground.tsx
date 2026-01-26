import "../styles/ImageBackground.css";

type Props = {
  dim?: number;
  imageUrl: string;
};

export function ImageBackground({ dim = 0.45, imageUrl }: Props) {
  return (
    <div
      className="image-bg"
      style={
        {
          "--bg-image": `url(${imageUrl})`,
          "--bg-dim": dim,
        } as React.CSSProperties
      }
    >
      <div
        className="image-bg__image"
        style={{ backgroundImage: `var(--bg-image)` }}
      />
      <div className="image-bg__overlay" />
    </div>
  );
}
