export default function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-night-400 border-t-pitch-400 animate-spin"
    />
  );
}
