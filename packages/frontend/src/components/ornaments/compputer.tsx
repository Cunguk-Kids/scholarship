export function Computer() {
  return (
    <div className="bg-black rounded-2xl rotate-6 h-max w-max">
      <div className="bg-white rounded-2xl px-4 border-2 pt-4 flex flex-col relative isolate -translate-x-2 -translate-y-2 hover:translate-0 transition-transform gap-4">
        <div className="text-3xl font-paytone">20k+</div>
        <div className="text-xs">Verified Voters Across Indonesia</div>
        <div className="-mr-4 mt-auto shrink-0 relative">
          <img src="/computer.png" className="w-[181px]" alt="computer" />
        </div>
      </div>
    </div>
  );
}
