interface ScanProgressBarProps {
  progress: number;
}

export default function ScanProgressBar({ progress }: ScanProgressBarProps) {
  return (
    <div className="w-full max-w-xl mt-6">

      <div className="flex justify-between mb-1 text-sm text-gray-400">
        <span>Scan Progress</span>
        <span>{progress}%</span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

    </div>
  );
}