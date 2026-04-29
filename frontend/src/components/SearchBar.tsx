export default function SearchBar() {
  return (
    <div className="w-full max-w-lg">
      <div
        className="
          rounded-2xl
          border border-slate-800
          bg-slate-950/50
          p-3
        "
      >
        <div className="flex items-center gap-3">
          <input
            type="url"
            placeholder="Enter URL (e.g. www.example.com) "
            className="
              w-full
              rounded-xl
              border border-slate-800
              bg-black/30
              px-4 py-3
              placeholder:text-slate-500
              outline-none
              focus:border-cyan-400/50
              focus:ring-4 focus:ring-cyan-400/15
              transition
            "
          />

          <button
            className="
              rounded-xl
              bg-gradient-to-r from-blue-800 to-cyan-600
              px-5 py-3
              text-white font-medium
              hover:brightness-110
              active:brightness-95
              transition
              whitespace-nowrap
            "
          >
            Start Scanning
          </button>
        </div>
      </div>
    </div>
  )
}
