const BottomNav = ({ items, activeTab, onChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium uppercase tracking-wide transition sm:px-4 ${
                isActive
                  ? 'text-black'
                  : 'text-black/50 hover:text-black/70'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  isActive ? 'bg-black text-white' : 'bg-black/5 text-black/50'
                }`}
              >
                {item.icon}
              </span>
              <span className="hidden xs:block sm:block">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
