import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabits } from '../context/HabitContext.jsx';
import { useWorkouts } from '../context/WorkoutContext.jsx';

// ─── Static activity log (placeholder) ──────────────────
const recentActivity = [
  { action: 'Completed Upper Body workout', time: '2 hours ago', type: 'workout' },
  { action: 'Updated habit tracking logs', time: '5 hours ago', type: 'habit' },
  { action: 'Logged calorie target goals', time: 'Yesterday', type: 'nutrition' },
  { action: 'Checked off all daily goals', time: 'Yesterday', type: 'goals' },
  { action: 'Completed full flexibility routine', time: '2 days ago', type: 'workout' },
];

// ─── Activity log icons (SVG, consistent stroke) ─────────
const ActivityIcon = ({ type }) => {
  const configs = {
    workout: {
      bg: 'rgba(99,102,241,0.12)',
      color: 'var(--primary)',
      path: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    },
    habit: {
      bg: 'rgba(251,146,60,0.12)',
      color: 'var(--status-warning)',
      path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    nutrition: {
      bg: 'rgba(52,211,153,0.12)',
      color: 'var(--status-success)',
      path: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    },
    goals: {
      bg: 'rgba(250,204,21,0.12)',
      color: '#FACC15',
      path: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.178-1.768-.767-1.768-1.768 0-1.002.77-1.768 1.768-1.768h13.5c.996 0 1.768.766 1.768 1.768 0 1.001-.772 1.946-1.768 1.768m-13.5 0A44.676 44.676 0 0112 4.5c2.291 0 4.545.16 6.75.468M5.25 4.236V2.721',
    },
  };
  const c = configs[type] || configs.workout;
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={c.path} />
      </svg>
    </div>
  );
};

// ─── Stat card icon SVGs ─────────────────────────────────
const FlameIcon = () => (
  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
  </svg>
);

const DumbbellIcon = () => (
  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

// ─── Helper ──────────────────────────────────────────────
const getMondayOfCurrentWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// ─── Dashboard ───────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const { habits, toggleHabit, loading: habitsLoading } = useHabits();
  const { workouts, editWorkout } = useWorkouts();

  const todayDayName = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);

  const currentWeekStart = useMemo(() => getMondayOfCurrentWeek(), []);
  const currentWeekEnd = useMemo(() => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [currentWeekStart]);

  const isWorkoutCompletedThisWeek = useCallback((w) => {
    if (!w.completedDates || w.completedDates.length === 0) return false;
    return w.completedDates.some((dateStr) => {
      const compDate = new Date(dateStr);
      return compDate >= currentWeekStart && compDate <= currentWeekEnd;
    });
  }, [currentWeekStart, currentWeekEnd]);

  const todaysPlannedWorkouts = useMemo(() =>
    workouts.filter((w) => (w.dayOfWeek || 'Monday') === todayDayName),
    [workouts, todayDayName]
  );

  const totalTodaysWorkouts = todaysPlannedWorkouts.length;
  const completedTodaysWorkouts = useMemo(() =>
    todaysPlannedWorkouts.filter((w) => isWorkoutCompletedThisWeek(w)).length,
    [todaysPlannedWorkouts, isWorkoutCompletedThisWeek]
  );

  const todaysProgress = useMemo(() =>
    totalTodaysWorkouts > 0 ? Math.round((completedTodaysWorkouts / totalTodaysWorkouts) * 100) : 0,
    [completedTodaysWorkouts, totalTodaysWorkouts]
  );

  const todaysCaloriesBurned = useMemo(() =>
    todaysPlannedWorkouts
      .filter((w) => isWorkoutCompletedThisWeek(w))
      .reduce((sum, w) => sum + (w.calories || 0), 0),
    [todaysPlannedWorkouts, isWorkoutCompletedThisWeek]
  );

  const todaysTotalDuration = useMemo(() =>
    todaysPlannedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    [todaysPlannedWorkouts]
  );

  const totalHabits = habits.length;
  const completedHabitsToday = habits.filter((h) => h.isCompletedToday).length;
  const habitCompletionPercentage = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  const handleHabitToggle = useCallback(async (id) => {
    try { await toggleHabit(id); } catch (err) { console.error('Failed to toggle habit:', err); }
  }, [toggleHabit]);

  const handleWorkoutToggle = useCallback(async (id) => {
    const workout = workouts.find((w) => w._id === id);
    if (!workout) return;
    const currentlyCompleted = isWorkoutCompletedThisWeek(workout);
    let updatedDates = workout.completedDates ? [...workout.completedDates] : [];
    if (currentlyCompleted) {
      updatedDates = updatedDates.filter((dateStr) => {
        const d = new Date(dateStr);
        return d < currentWeekStart || d > currentWeekEnd;
      });
    } else {
      updatedDates.push(new Date().toISOString());
    }
    try {
      await editWorkout(id, { ...workout, completedDates: updatedDates, completed: !currentlyCompleted });
    } catch (err) { console.error('Failed to toggle workout completion:', err); }
  }, [workouts, isWorkoutCompletedThisWeek, editWorkout, currentWeekStart, currentWeekEnd]);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">

      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Good {getGreeting()},{' '}
          <span style={{ color: 'var(--primary)' }}>{user?.name || 'Athlete'}</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {todayDayName} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

        {/* Best Streak */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Best Streak</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(251,146,60,0.12)', color: 'var(--status-warning)' }}>
              <FlameIcon />
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{bestStreak}</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {bestStreak === 1 ? 'day' : 'days'} without breaking
          </p>
        </div>

        {/* Today's Workouts */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Workouts</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <DumbbellIcon />
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{completedTodaysWorkouts}<span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>/{totalTodaysWorkouts}</span></p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>completed today</p>
        </div>

        {/* Habit Completion */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Habits</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(52,211,153,0.12)', color: 'var(--status-success)' }}>
              <CheckCircleIcon />
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{habitCompletionPercentage}<span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>%</span></p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{completedHabitsToday} of {totalHabits} done</p>
        </div>

        {/* Calories */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Calories</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(251,146,60,0.12)', color: 'var(--status-warning)' }}>
              <BoltIcon />
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{todaysCaloriesBurned}</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>kcal burned today</p>
        </div>

      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Today's Schedule */}
        <div className="rounded-xl border lg:col-span-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Today&apos;s Schedule</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {totalTodaysWorkouts > 0
                  ? `${totalTodaysWorkouts} planned · ${todaysTotalDuration} min`
                  : 'No workouts planned'
                }
              </p>
            </div>
            {/* Compact progress ring */}
            <div className="relative flex h-12 w-12 items-center justify-center">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3.5" style={{ stroke: 'var(--border-default)' }} />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="var(--primary)" strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - todaysProgress / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[10px] font-bold" style={{ color: 'var(--primary)' }}>{todaysProgress}%</span>
            </div>
          </div>

          <div className="p-5 space-y-2">
            {totalTodaysWorkouts === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
                  <svg className="h-5 w-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No workouts scheduled</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>A rest day or plan your next session.</p>
                <Link to="/workouts" className="rounded-lg px-4 py-2 text-xs font-semibold btn-primary-gradient">
                  Plan a Workout
                </Link>
              </div>
            ) : (
              todaysPlannedWorkouts.map((w) => {
                const done = isWorkoutCompletedThisWeek(w);
                return (
                  <div
                    key={w._id}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                    style={{
                      backgroundColor: done ? 'rgba(52,211,153,0.06)' : 'var(--bg-card-hover)',
                      borderLeft: done ? '2px solid var(--status-success)' : '2px solid transparent',
                    }}
                  >
                    <button
                      onClick={() => handleWorkoutToggle(w._id)}
                      aria-label={`Mark ${w.exerciseName} as ${done ? 'incomplete' : 'complete'}`}
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
                    <span
                      className="flex-1 text-sm font-medium"
                      style={{ color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}
                    >
                      {w.exerciseName}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {w.duration}m · {w.totalReps} reps
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Daily Habits */}
        <div className="rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Habits</h2>
            {totalHabits > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(52,211,153,0.12)', color: 'var(--status-success)' }}>
                {completedHabitsToday}/{totalHabits}
              </span>
            )}
          </div>

          <div className="flex-1 p-4">
            {habitsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => <div key={n} className="h-10 rounded-lg skeleton-shimmer" />)}
              </div>
            ) : totalHabits === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
                  <svg className="h-5 w-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No habits tracked</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Build consistency with daily habits.</p>
                <Link to="/habits" className="rounded-lg px-4 py-2 text-xs font-semibold btn-primary-gradient">
                  Add a Habit
                </Link>
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto max-h-[300px]">
                {habits.map((habit) => {
                  const done = habit.isCompletedToday;
                  return (
                    <button
                      key={habit._id}
                      onClick={() => handleHabitToggle(habit._id)}
                      aria-label={`Toggle habit ${habit.name}`}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                      style={{ backgroundColor: done ? 'rgba(52,211,153,0.06)' : 'transparent' }}
                      onMouseEnter={e => { if (!done) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = done ? 'rgba(52,211,153,0.06)' : 'transparent'; }}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
                        style={{
                          borderColor: done ? 'var(--status-success)' : 'var(--text-muted)',
                          backgroundColor: done ? 'var(--status-success)' : 'transparent',
                        }}
                      >
                        {done && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                      <span
                        className="flex-1 text-sm"
                        style={{
                          color: done ? 'var(--text-muted)' : 'var(--text-secondary)',
                          fontWeight: done ? 400 : 500,
                          textDecoration: done ? 'line-through' : 'none',
                        }}
                      >
                        {habit.name}
                      </span>
                      {(habit.streak || 0) > 0 && (
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--status-warning)' }}>
                          {habit.streak}d
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Activity Log ─── */}
      <div className="rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <ActivityIcon type={item.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default Dashboard;
