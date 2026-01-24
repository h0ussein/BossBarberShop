import TopBar from './TopBar';
import BottomNav from './BottomNav';
import SideDrawer from './SideDrawer';

const MobileShell = ({
  activeTab,
  onTabChange,
  drawerOpen,
  setDrawerOpen,
  navItems,
  children,
}) => {
  return (
    <div className="min-h-screen bg-white text-black">
      <TopBar
        onMenuClick={() => setDrawerOpen(true)}
        onQuickBook={() => onTabChange('booking')}
      />
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={navItems}
        onNavigate={onTabChange}
      />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 md:px-6 lg:pb-8">{children}</main>
      <BottomNav items={navItems} activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
};

export default MobileShell;
