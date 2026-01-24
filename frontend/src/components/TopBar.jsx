const TopBar = ({ onMenuClick, onQuickBook }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black transition hover:border-black/30 hover:bg-black/5 lg:hidden"
          aria-label="Open menu"
        >
          <span className="block h-5 w-5">
            <span className="mb-1.5 block h-0.5 w-full bg-black"></span>
            <span className="mb-1.5 block h-0.5 w-full bg-black/70"></span>
            <span className="block h-0.5 w-full bg-black"></span>
          </span>
        </button>
        <div className="text-center lg:text-left">
          <h1 className="text-lg font-bold tracking-tight text-black">BOSS</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Barbershop</p>
        </div>
        <button
          type="button"
          onClick={onQuickBook}
          className="rounded-full bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-black/80"
        >
          Book Now
        </button>
      </div>
    </header>
  );
};

export default TopBar;
