import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { requestNotificationPermission } from '../utils/notificationManager.js';

const Settings = () => {
  const { user, updateSettings, deactivateAccount, deleteAccount } = useAuth();
  
  // Local form states
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState(true);

  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [waterReminder, setWaterReminder] = useState(true);
  const [sleepReminder, setSleepReminder] = useState(true);
  const [habitReminder, setHabitReminder] = useState(true);

  // Status states
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync form states with user context when user object changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeight(user.height || 0);
      setWeight(user.weight || 0);
      setAge(user.age || 0);
      setVoiceFeedback(user.voiceFeedback !== false);

      if (user.notifications) {
        setNotificationsEnabled(user.notifications.enabled !== false);
        setWorkoutReminder(user.notifications.workout !== false);
        setWaterReminder(user.notifications.water !== false);
        setSleepReminder(user.notifications.sleep !== false);
        setHabitReminder(user.notifications.habit !== false);
      }
    }
  }, [user]);

  const handleGlobalToggle = async () => {
    const nextVal = !notificationsEnabled;
    if (nextVal) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotificationsEnabled(false);
        return;
      }
    }
    setNotificationsEnabled(nextVal);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const payload = {
        name,
        height: height === '' ? 0 : Number(height),
        weight: weight === '' ? 0 : Number(weight),
        age: age === '' ? 0 : Number(age),
        voiceFeedback,
        notifications: {
          enabled: notificationsEnabled,
          workout: workoutReminder,
          water: waterReminder,
          sleep: sleepReminder,
          habit: habitReminder,
        },
      };

      await updateSettings(payload);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate your account? You will be logged out immediately.'
    );
    if (!confirmed) return;
    
    try {
      await deactivateAccount();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to deactivate account');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'WARNING: Are you absolutely sure you want to permanently delete your account? All your workouts and habits will be lost. This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await deleteAccount();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Configure biological variables, notification preferences, and account settings.</p>
      </div>

      {successMsg && (
        <div role="alert" className="rounded-lg border px-4 py-3 text-sm font-semibold flex items-center gap-2.5" style={{ borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.08)', color: 'var(--status-success)' }}>
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="rounded-lg border px-4 py-3 text-sm font-semibold flex items-center gap-2.5" style={{ borderColor: 'rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--status-danger)' }}>
          <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Unified Settings Grid layout without card-in-card nesting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Account & Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Profile Info */}
            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h2 className="text-sm font-semibold mb-4 pb-2 border-b flex items-center gap-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
                <svg className="h-4 w-4" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Account Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="settings-name" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] transition-all"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="settings-email" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full h-10 rounded-lg border px-3 text-sm cursor-not-allowed opacity-80"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>Email address cannot be changed.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Physical Profile */}
            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h2 className="text-sm font-semibold mb-4 pb-2 border-b flex items-center gap-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
                <svg className="h-4 w-4" style={{ color: 'var(--status-success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21a7.5 7.5 0 00-7.5-7.5v7.5z" />
                </svg>
                Physical Profile
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="settings-height" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Height (cm)</label>
                  <input
                    id="settings-height"
                    type="number"
                    min="0"
                    max="300"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] transition-all"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="settings-weight" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Weight (kg)</label>
                  <input
                    id="settings-weight"
                    type="number"
                    min="0"
                    max="500"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] transition-all"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="settings-age" className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Age</label>
                  <input
                    id="settings-age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] transition-all"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Audio & Notifications & Destructive Zone */}
          <div className="space-y-6">

            {/* Section 3: Feedback & Reminders */}
            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h2 className="text-sm font-semibold mb-4 pb-2 border-b flex items-center gap-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
                <svg className="h-4 w-4" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Voice Assistant</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time voice correction prompts during posture tracking.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceFeedback(!voiceFeedback)}
                    aria-label="Toggle voice feedback"
                    className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                    style={{ backgroundColor: voiceFeedback ? 'var(--primary)' : 'var(--border-default)' }}
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                      style={{ transform: voiceFeedback ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                <div className="border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />

                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Push Notifications</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Enable reminders for daily workouts and habit checks.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGlobalToggle}
                    aria-label="Toggle all push notifications"
                    className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                    style={{ backgroundColor: notificationsEnabled ? 'var(--primary)' : 'var(--border-default)' }}
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                      style={{ transform: notificationsEnabled ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Account Actions / Danger Zone */}
            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <h2 className="text-sm font-semibold mb-4 pb-2 border-b flex items-center gap-2" style={{ color: 'var(--status-danger)', borderColor: 'rgba(239,68,68,0.1)' }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Deactivate Account</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Temporarily disable your profile. You can reactivate at any time.</p>
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    className="self-start px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                  >
                    Deactivate
                  </button>
                </div>

                <div className="border-t" style={{ borderColor: 'rgba(239,68,68,0.1)' }} />

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--status-danger)' }}>Delete Permanently</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Irreversibly delete your profile, workout planners, and habit streaks.</p>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="self-start px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer"
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--status-danger)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--status-danger)'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--status-danger)'; }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Global Save Button - sticky bottom bar */}
        <div className="sticky bottom-4 z-20 mt-6 rounded-xl border p-4 shadow-lg flex items-center justify-between" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Save any changed preferences before leaving this page.</p>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center gap-2 ml-auto cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
