import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileShell from './components/MobileShell';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Offers from './pages/Offers';
import { useAuth } from './contexts/AuthContext';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    id: 'booking',
    label: 'Book',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'offers',
    label: 'Offers',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
];

const MainApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Get tab from URL hash or default to 'home'
  const getTabFromUrl = () => {
    const hash = location.hash.replace('#', '');
    const validTabs = ['home', 'booking', 'contact', 'profile', 'offers'];
    return validTabs.includes(hash) ? hash : 'home';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync activeTab with URL hash on mount and location changes
  useEffect(() => {
    const tab = getTabFromUrl();
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.hash]);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/auth#profile');
    } else {
      navigate('#profile', { replace: true });
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'profile' && !isAuthenticated) {
      navigate('/auth#profile');
    } else {
      // Update URL hash - this will trigger hashchange event
      window.location.hash = tabId;
      setActiveTab(tabId);
    }
  };

  return (
    <MobileShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
      navItems={navItems}
    >
      {/* Keep all pages mounted to preserve state and prevent refetching */}
      <div className={activeTab === 'home' ? 'block' : 'hidden'}>
        <Home onBook={() => setActiveTab('booking')} />
      </div>
      <div className={activeTab === 'booking' ? 'block' : 'hidden'}>
        <Booking />
      </div>
      <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
        <Contact />
      </div>
      <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
        <Profile />
      </div>
      <div className={activeTab === 'offers' ? 'block' : 'hidden'}>
        <Offers />
      </div>
    </MobileShell>
  );
};

export default MainApp;
