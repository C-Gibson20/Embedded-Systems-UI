type Props = {
  dim?: number;
  blur?: number;
};

export function VideoBackground({ dim = 0.45 }: Props) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/background_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${dim})` }}
      />
    </div>
  );
}
