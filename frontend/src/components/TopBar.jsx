const TopBar = ({ onMenuClick, onQuickBook, navItems, activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Mobile menu button */}
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

        {/* Logo */}
        <div className="text-center lg:text-left">
          <h1 className="text-lg font-bold tracking-tight text-black">BOSS</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Barbershop</p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {navItems?.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium uppercase tracking-wide transition ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="h-5 w-5">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Book Now button */}
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
