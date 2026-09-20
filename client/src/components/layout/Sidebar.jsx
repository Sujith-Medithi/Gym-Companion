import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    to: '/workouts',
    label: 'Workouts',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    to: '/habits',
    label: 'Habits',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Persistent Pin State for Desktop Sidebar (true = pinned open, false = minimized)
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('gym_sidebar_pinned');
    if (saved !== null) return saved === 'true';
    return localStorage.getItem('ai_gym_sidebar_retracted') !== 'true';
  });

  // Transient hover state for minimized sidebar
  const [isHovered, setIsHovered] = useState(false);

  // Expanded whenever pinned OR temporarily hovered
  const isExpanded = isPinned || isHovered;

  const handleTogglePin = (e) => {
    e.stopPropagation();
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem('gym_sidebar_pinned', String(next));
      if (!next) {
        setIsHovered(false);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA installation choice outcome: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      {/* Mobile overlay with fade backdrop blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md transition-opacity duration-300 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Retractable Sidebar container with hover-expand */}
      <aside
        onMouseEnter={() => {
          if (!isPinned) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isPinned) setIsHovered(false);
        }}
        className={`
          fixed top-0 left-0 z-50 flex flex-col border-r border-subtle
          bg-surface shadow-2xl transition-all duration-300 ease-in-out select-none
          h-full md:sticky md:top-0 md:h-screen md:translate-x-0 md:rounded-none md:border-r md:border-subtle
          ${isExpanded ? 'md:w-72' : 'md:w-20'}
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'}
        `}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-subtle px-4">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            {isExpanded && (
              <div className="flex flex-col animate-fadeIn">
                <span
                  className="text-[15px] font-bold tracking-tight leading-tight whitespace-nowrap"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Gym <span style={{ color: 'var(--primary)' }}>Companion</span>
                </span>
                <span 
                  className="text-[10px] font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  AI Fitness
                </span>
              </div>
            )}
          </div>

          {/* Retract/Pin Toggle Button */}
          {isExpanded && (
            <button
              onClick={handleTogglePin}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus:outline-none animate-fadeIn"
              style={{
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              title={isPinned ? 'Minimize Sidebar' : 'Pin Sidebar Maximized'}
              aria-label={isPinned ? 'Minimize Sidebar' : 'Pin Sidebar Maximized'}
            >
              <svg
                className={`h-4 w-4 transform transition-transform duration-300 ${!isPinned ? 'rotate-180' : ''}`}
                style={{ color: !isPinned ? 'var(--primary)' : 'inherit' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 transition-colors md:hidden focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center h-11 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus:outline-none ${
                  !isExpanded ? 'justify-center p-0' : 'px-4 py-2.5 gap-3.5'
                } ${
                  isActive
                    ? 'font-semibold bg-[var(--primary-light)]'
                    : 'font-medium hover:bg-[var(--bg-card-hover)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Subtle left accent for active state */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {item.icon}
                  </span>

                  {/* Text Label */}
                  {isExpanded && (
                    <span
                      className="truncate text-sm tracking-wide animate-fadeIn"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Install Application Callout — Anchored to bottom of sidebar */}
        {!isStandalone && (
          <div className="mt-auto shrink-0 border-t border-subtle p-3">
            <button
              onClick={handleInstallClick}
              title={!isExpanded ? 'Install Gym Companion' : undefined}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus:outline-none ${
                !isExpanded ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
              }`}
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </span>
              {isExpanded && <span className="truncate text-sm animate-fadeIn">Install App</span>}
            </button>
          </div>
        )}
      </aside>

      {/* PWA Installation Instructions Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-xl border p-6 shadow-2xl space-y-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-default)' }}>
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="h-4.5 w-4.5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" /></svg>
                Install Gym Companion
              </h3>
              <button
                onClick={() => setShowInstallModal(false)}
                className="rounded-md p-1.5 transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Install AI Gym Trainer on your device for fast offline access, native performance, and a borderless full-screen experience.
            </p>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg border p-3.5 space-y-1" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card-hover)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--status-info)' }}>Chrome / Edge (Desktop)</p>
                <p className="text-slate-300 leading-relaxed">Click the install icon (📥) in the browser address bar at top right, or open 3 dots menu ➔ &quot;Install AI Gym Trainer&quot;.</p>
              </div>

              <div className="rounded-lg border p-3.5 space-y-1" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card-hover)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--status-success)' }}>iPhone / iPad (Safari)</p>
                <p className="text-slate-300 leading-relaxed">Tap the Share button (square with up arrow) at bottom bar ➔ scroll down & tap &quot;Add to Home Screen&quot;.</p>
              </div>

              <div className="rounded-lg border p-3.5 space-y-1" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card-hover)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Android (Chrome)</p>
                <p className="text-slate-300 leading-relaxed">Tap the 3 dots menu at top right ➔ tap &quot;Install app&quot; or &quot;Add to Home screen&quot;.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInstallModal(false)}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm cursor-pointer btn-primary-gradient"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
