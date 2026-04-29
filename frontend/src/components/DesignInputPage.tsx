import SearchBar from "./SearchBar"

export default function DesignInputPage() {
  return (
    <div className="w-screen overflow-hidden bg-black ">
      <div
        className="
          absolute -top-10 -right-10
          h-[400px] w-[400px]
          bg-blue-500/20
          rounded-full
          blur-[120px]
        "
      />
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <SearchBar />
      </div>
    </div>
  )
}
