export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-night-800 gap-4">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-night-500" />
        <div className="absolute inset-0 rounded-full border-4 border-pitch-400 border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-400 font-display tracking-wide">{message}</p>
    </div>
  );
}
