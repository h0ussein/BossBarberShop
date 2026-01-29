const SideDrawer = ({ open, onClose, items, onNavigate }) => {
  return (
    <div
      className={`fixed inset-0 z-40 transition lg:hidden ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      <aside
        className={`absolute left-0 top-0 h-full w-72 border-r border-black/10 bg-white p-6 shadow-xl transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-black">ABED MERHI</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">Barbershop</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-black/60 transition hover:border-black/30 hover:text-black"
          >
            Close
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-left text-sm font-medium text-black/70 transition hover:border-black/20 hover:bg-black/5 hover:text-black"
            >
              <span>{item.label}</span>
              <span className="text-black/30">→</span>
            </button>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-xs text-black/60">
          <p className="mb-2 font-semibold text-black">Working Hours</p>
          <p>Mon - Sat: 9:00 AM - 9:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </aside>
    </div>
  );
};

export default SideDrawer;
