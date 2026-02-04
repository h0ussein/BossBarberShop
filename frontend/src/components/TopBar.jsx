import logo from '../assets/logo.jpeg';

const TopBar = ({ onMenuClick, onQuickBook, navItems, activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="relative flex items-center justify-between">
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

          {/* Logo - Absolutely centered on desktop, centered in flex on mobile */}
          <div className="flex items-center justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <img 
              src={logo} 
              alt="Abed Merhi Barbershop" 
              className="h-10 w-auto object-contain md:h-11 lg:h-12"
            />
          </div>

          {/* Right side - Desktop Navigation / Spacer on mobile */}
          <div className="flex items-center">
            <nav className="hidden lg:flex lg:items-center lg:gap-1">
              {navItems?.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium uppercase tracking-wide transition ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-black/60 hover:bg-black/5 hover:text-black'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="h-4 w-4">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Spacer for mobile to balance the menu button */}
            <div className="h-10 w-10 lg:hidden"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
