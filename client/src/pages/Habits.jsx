import { useState } from 'react';
import { useHabits } from '../context/HabitContext.jsx';

// ─── Category SVG icon system ────────────────────────────
const getHabitIcon = (name) => {
  const lower = name.toLowerCase();

  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrate'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a6.715 6.715 0 00-3.722 1.118.75.75 0 11-.828-1.25 8.25 8.25 0 0110.8 12.685.75.75 0 11-1.06-1.06A6.75 6.75 0 0012 3.75zm0 0v2.25m0 8.25a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    );
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('rest'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    );
  if (lower.includes('step') || lower.includes('walk') || lower.includes('run'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    );
  if (lower.includes('vit') || lower.includes('pill') || lower.includes('med'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    );
  if (lower.includes('read') || lower.includes('learn') || lower.includes('book'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    );
  if (lower.includes('stretch') || lower.includes('yoga') || lower.includes('flex'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    );
  if (lower.includes('food') || lower.includes('diet') || lower.includes('eat') || lower.includes('calories'))
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    );
  // Default
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

// ─── Habits Page ─────────────────────────────────────────
const Habits = () => {
  const { habits, loading, addHabit, editHabit, removeHabit, toggleHabit } = useHabits();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [habitIdToDelete, setHabitIdToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.isCompletedToday).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const activeStreaks = habits.filter((h) => (h.streak || 0) > 0).length;

  const openAddModal = () => { setEditingId(null); setName(''); setDescription(''); setModalError(''); setModalOpen(true); };
  const openEditModal = (habit) => { setEditingId(habit._id); setName(habit.name); setDescription(habit.description); setModalError(''); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!name.trim()) { setModalError('Habit name is required'); return; }
    setSubmitting(true);
    try {
      if (editingId) { await editHabit(editingId, name.trim(), description.trim()); }
      else { await addHabit(name.trim(), description.trim()); }
      setModalOpen(false);
    } catch (err) { setModalError(err.message || 'Failed to save habit'); }
    finally { setSubmitting(false); }
  };

  const openDeleteConfirm = (id) => { setHabitIdToDelete(id); setDeleteError(''); setDeleteConfirmOpen(true); };
  const confirmDelete = async () => {
    setDeleteError(''); setDeleting(true);
    try { await removeHabit(habitIdToDelete); setDeleteConfirmOpen(false); }
    catch (err) { setDeleteError(err.message || 'Failed to delete habit'); }
    finally { setDeleting(false); }
  };

  const handleToggle = async (id) => {
    try { await toggleHabit(id); } catch (err) { console.error('Failed to toggle habit:', err); }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Habits</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Track daily routines and build consistency over time.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all btn-primary-gradient focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Habit
        </button>
      </div>

      {/* ─── Stats Row ─── */}
      {totalHabits > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Today</p>
            <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {completionPercentage}<span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>%</span>
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{completedToday} of {totalHabits} done</p>
          </div>

          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Active Streaks</p>
            <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{activeStreaks}</p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>ongoing habits</p>
          </div>

          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Best Streak</p>
            <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {bestStreak}<span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}> d</span>
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>your peak</p>
          </div>
        </div>
      )}

      {/* ─── Main List ─── */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : totalHabits === 0 ? (
        <div className="rounded-xl border p-12 text-center flex flex-col items-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No habits yet</h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Daily habits build long-term consistency. Start with something small — hydration, stretching, or sleep.
          </p>
          <button
            onClick={openAddModal}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer btn-primary-gradient"
          >
            Create your first habit
          </button>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {habits.map((habit) => {
              const done = habit.isCompletedToday;
              const streak = habit.streak || 0;
              return (
                <div
                  key={habit._id}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{ backgroundColor: done ? 'rgba(52,211,153,0.04)' : 'transparent' }}
                >
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(habit._id)}
                    aria-label={`Toggle ${habit.name}`}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                    style={{
                      borderColor: done ? 'var(--status-success)' : 'var(--text-muted)',
                      backgroundColor: done ? 'var(--status-success)' : 'transparent',
                    }}
                  >
                    {done && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>

                  {/* Category Icon */}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: done ? 'rgba(52,211,153,0.10)' : 'var(--bg-card-hover)',
                      color: done ? 'var(--status-success)' : 'var(--text-muted)',
                    }}
                  >
                    {getHabitIcon(habit.name)}
                  </span>

                  {/* Name + Description */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{
                        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}
                    >
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {habit.description}
                      </p>
                    )}
                  </div>

                  {/* Streak */}
                  {streak > 0 && (
                    <span
                      className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'rgba(251,146,60,0.12)', color: 'var(--status-warning)' }}
                    >
                      {streak}d
                    </span>
                  )}

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEditModal(habit)}
                      className="rounded-md p-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(habit._id)}
                      className="rounded-md p-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--status-danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full rounded-xl border shadow-2xl overflow-hidden animate-fadeIn" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Edit Habit' : 'Add Habit'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1.5 transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = ''; }}
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {modalError && (
                <div role="alert" className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.08)', color: 'var(--status-danger)' }}>
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {modalError}
                </div>
              )}

              <div>
                <label htmlFor="habit-name-input" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Habit name <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <input
                  id="habit-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Drink 3L of water"
                  required
                  className="w-full h-10 rounded-lg border px-3 text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                />
              </div>

              <div>
                <label htmlFor="habit-desc-input" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Description <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  id="habit-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any notes or reminders..."
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm transition-all resize-none focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer btn-primary-gradient disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border p-6 shadow-2xl animate-fadeIn" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="h-4.5 w-4.5 shrink-0" style={{ color: 'var(--status-danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Delete habit?
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              This will permanently remove the habit and all its history. This cannot be undone.
            </p>

            {deleteError && (
              <div role="alert" className="mb-4 text-xs rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(248,113,113,0.08)', color: 'var(--status-danger)', border: '1px solid rgba(248,113,113,0.3)' }}>
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white cursor-pointer transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--status-danger)' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
