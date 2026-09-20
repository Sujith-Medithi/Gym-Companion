import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';

const TopNav = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/workouts': return 'Workouts';
      case '/habits': return 'Habits';
      case '/progress': return 'Progress';
      case '/settings': return 'Settings';
      default: return 'AI Gym Trainer';
    }
  };
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'modern-saas';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'modern-saas' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA installation choice outcome (Header): ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 px-6 lg:px-8 border-b border-subtle bg-surface/90 backdrop-blur-md flex items-center justify-between">
      <div className="w-full max-w-[1440px] flex items-center justify-between">
        {/* Left: Menu toggle / retract chevron + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] md:hidden focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus:outline-none cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          </button>

          <div>
            <h2 className="text-lg font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{getPageTitle()}</h2>
            <p className="hidden text-[11px] font-semibold tracking-wider sm:block uppercase" style={{ color: 'var(--primary)' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right: User area */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 transition-all duration-200 hover:bg-[var(--bg-card-hover)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus:outline-none cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
          </button>

          {/* PWA Install Download Icon */}
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="rounded-xl p-2.5 text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-[#00D9FF] focus-visible:ring-2 focus-visible:ring-[#00D9FF] focus:outline-none cursor-pointer"
              title="Install App"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          )}

          {/* Notification bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 transition-all duration-200 hover:bg-[var(--bg-card-hover)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus:outline-none cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            title="Notifications"
            aria-expanded={showNotifications}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {/* Notification dot */}
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full ring-2" style={{ backgroundColor: 'var(--primary)', ringColor: 'var(--bg-surface)' }}></span>
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              className="absolute right-12 top-12 w-80 rounded-xl border p-4 shadow-lg z-50 animate-fadeIn space-y-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border-default)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Notifications</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold hover:underline transition-colors focus:outline-none"
                  style={{ color: 'var(--primary)' }}
                >
                  Dismiss All
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-subtle)' }}>
                  <svg className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Reminders Active</p>
                    <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>Workout, hydration, and habit loops are configured.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-subtle)' }}>
                  <svg className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--status-info)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Pose Models Cached</p>
                    <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>MediaPipe trackers are stored for offline workouts.</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-center" style={{ borderColor: 'var(--border-default)' }}>
                <a
                  href="/settings"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold hover:underline transition-colors focus:outline-none"
                  style={{ color: 'var(--primary)' }}
                >
                  Notification Preferences
                </a>
              </div>
            </div>
          )}

          {/* User avatar + profile details */}
          <div className="h-10 px-3 rounded-lg border flex items-center gap-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
              style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border-default)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
              <p className="text-[10px] font-semibold leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="ml-1.5 rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
              style={{ color: 'var(--text-muted)' }}
              title="Sign out"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
