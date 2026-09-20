import { useState, useCallback, useMemo } from 'react';
import { useWorkouts } from '../context/WorkoutContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ActiveWorkoutSession from '../components/ActiveWorkoutSession.jsx';

const Workouts = () => {
  const { user } = useAuth();
  const { workouts, loading, sort, setSort, addWorkout, editWorkout, removeWorkout } = useWorkouts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [totalReps, setTotalReps] = useState('');
  const [calories, setCalories] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [workoutIdToDelete, setWorkoutIdToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [autoCompleteOnSave, setAutoCompleteOnSave] = useState(false);

  // Drag and drop state
  const [draggedWorkoutId, setDraggedWorkoutId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  const getMonday = (d, offset = 0) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getWeekDays = (offset = 0) => {
    const monday = getMonday(new Date(), offset);
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      days.push({ name: dayNames[i], date: dayDate });
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const startOfWeekDate = useMemo(() => weekDays[0].date, [weekDays]);
  const endOfWeekDate = useMemo(() => weekDays[6].date, [weekDays]);

  const formatWeekRange = useCallback(() => {
    const startStr = startOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endOfWeekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }, [startOfWeekDate, endOfWeekDate]);

  const isWorkoutCompletedInDisplayedWeek = useCallback((w) => {
    if (!w.completedDates || w.completedDates.length === 0) return false;
    const start = new Date(startOfWeekDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endOfWeekDate);
    end.setHours(23, 59, 59, 999);
    return w.completedDates.some((dateStr) => {
      const compDate = new Date(dateStr);
      return compDate >= start && compDate <= end;
    });
  }, [startOfWeekDate, endOfWeekDate]);

  const currentWeekWorkouts = useMemo(() => {
    const start = new Date(startOfWeekDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endOfWeekDate);
    end.setHours(23, 59, 59, 999);
    
    return workouts.filter((w) => {
      if (w.isSpontaneous) {
        const wDate = new Date(w.date);
        return wDate >= start && wDate <= end;
      }
      return true;
    });
  }, [workouts, startOfWeekDate, endOfWeekDate]);

  const groupedWorkouts = useMemo(() => {
    const groups = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    currentWeekWorkouts.forEach((w) => {
      const dayName = w.dayOfWeek || 'Monday';
      if (groups[dayName]) groups[dayName].push(w);
    });
    return groups;
  }, [currentWeekWorkouts]);

  const totalSessions = currentWeekWorkouts.length;
  const completedSessions = currentWeekWorkouts.filter((w) => isWorkoutCompletedInDisplayedWeek(w)).length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const handleToggleCompleted = async (workout) => {
    const currentlyCompleted = isWorkoutCompletedInDisplayedWeek(workout);
    const dayInfo = weekDays.find((wd) => wd.name === (workout.dayOfWeek || 'Monday')) || weekDays[0];
    const targetDate = new Date(dayInfo.date);
    targetDate.setHours(9, 0, 0, 0);

    let updatedDates = workout.completedDates ? [...workout.completedDates] : [];
    if (currentlyCompleted) {
      updatedDates = updatedDates.filter((dateStr) => {
        const d = new Date(dateStr);
        return d < startOfWeekDate || d > endOfWeekDate;
      });
    } else {
      updatedDates.push(targetDate.toISOString());
    }

    try {
      await editWorkout(workout._id, {
        ...workout,
        completedDates: updatedDates,
        completed: !currentlyCompleted,
      });
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const openAddModal = (defaultDay = 'Monday') => {
    setEditingId(null);
    setExerciseName('');
    setSelectedDay(defaultDay);
    setDuration('');
    setTotalReps('');
    setCalories('');
    setModalError('');
    setAutoCompleteOnSave(false);
    setModalOpen(true);
  };

  const openEditModal = (workout) => {
    setEditingId(workout._id);
    setExerciseName(workout.exerciseName);
    setSelectedDay(workout.dayOfWeek || 'Monday');
    setDuration(workout.duration);
    setTotalReps(workout.totalReps);
    setCalories(workout.calories || 0);
    setModalError('');
    setAutoCompleteOnSave(false);
    setModalOpen(true);
  };

  const handleDragStart = (e, workout) => {
    e.dataTransfer.setData('workoutId', workout._id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => setDraggedWorkoutId(workout._id), 0);
  };

  const handleDragEnd = () => {
    setDraggedWorkoutId(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e, dayName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDay !== dayName) setDragOverDay(dayName);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = async (e, dayName) => {
    e.preventDefault();
    setDragOverDay(null);
    
    const workoutId = e.dataTransfer.getData('workoutId');
    if (!workoutId) return;

    const workout = workouts.find((w) => w._id === workoutId);
    if (workout && workout.dayOfWeek !== dayName) {
      const payload = {
        exerciseName: workout.exerciseName,
        date: workout.date,
        duration: workout.duration,
        totalReps: workout.totalReps,
        calories: workout.calories,
        completed: workout.completed,
        isSpontaneous: workout.isSpontaneous,
        completedDates: workout.completedDates,
        dayOfWeek: dayName,
      };
      
      try {
         await editWorkout(workoutId, payload);
      } catch (err) {
         setModalError(err.message || 'Failed to move workout');
      }
    }
    setDraggedWorkoutId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!exerciseName.trim()) return setModalError('Exercise name is required');
    if (!duration || Number(duration) <= 0) return setModalError('Valid duration is required');
    if (totalReps === '' || Number(totalReps) < 0) return setModalError('Valid reps are required');

    setSubmitting(true);

    const dayInfo = weekDays.find((wd) => wd.name === selectedDay) || weekDays[0];
    const targetDate = new Date(dayInfo.date);
    targetDate.setHours(9, 0, 0, 0);

    const origWorkout = editingId ? workouts.find(w => w._id === editingId) : null;
    let updatedCompletedDates = origWorkout && origWorkout.completedDates ? [...origWorkout.completedDates] : [];

    if (autoCompleteOnSave) {
      updatedCompletedDates.push(targetDate.toISOString());
    }

    const workoutData = {
      exerciseName: exerciseName.trim(),
      date: targetDate.toISOString(),
      duration: Number(duration),
      totalReps: Number(totalReps),
      calories: calories ? Number(calories) : (Number(totalReps) * 4 || Number(duration) * 5),
      dayOfWeek: selectedDay,
      completedDates: updatedCompletedDates,
      completed: autoCompleteOnSave ? true : (origWorkout && origWorkout.completed) || false,
      isSpontaneous: autoCompleteOnSave ? true : (origWorkout && origWorkout.isSpontaneous) || false,
    };

    try {
      if (editingId) {
        await editWorkout(editingId, workoutData);
      } else {
        await addWorkout(workoutData);
      }
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message || 'Failed to save workout');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await removeWorkout(workoutIdToDelete);
      setDeleteConfirmOpen(false);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSessionFinish = ({ activeExerciseName, sessionDuration, trackedReps }) => {
    setIsSessionActive(false);
    setEditingId(null);
    setExerciseName(activeExerciseName);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[new Date().getDay()];
    setSelectedDay(currentDayName);
    
    const dayInfo = weekDays.find((wd) => wd.name === currentDayName) || weekDays[0];
    const targetDate = new Date(dayInfo.date);
    targetDate.setHours(9, 0, 0, 0);
    targetDate.setMinutes(targetDate.getMinutes() - targetDate.getTimezoneOffset());
    setDate(targetDate.toISOString().slice(0, 16));
    
    const computedMins = Math.max(1, Math.ceil(sessionDuration / 60));
    setDuration(computedMins);
    setTotalReps(trackedReps);
    setCalories(trackedReps * 4 || Math.round(sessionDuration * 0.12));
    
    setModalError('');
    setAutoCompleteOnSave(true);
    setModalOpen(true);
  };

  if (isSessionActive) {
    return (
      <ActiveWorkoutSession 
        onExit={() => setIsSessionActive(false)} 
        onFinish={handleSessionFinish} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Workouts</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Schedule workouts, track completion, and analyze reps.</p>
        </div>
        <div className="flex items-center gap-3">
          
          {/* Week offset navigation */}
          <div className="flex items-center gap-2 rounded-lg border p-1" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="rounded p-1.5 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-xs font-semibold px-1" style={{ color: 'var(--text-primary)' }}>{formatWeekRange()}</span>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="rounded p-1.5 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setIsSessionActive(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
            style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)', border: '1px solid var(--border-default)' }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Track Pose
          </button>
          
          <button
            onClick={() => openAddModal()}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer btn-primary-gradient focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
          >
            Log Workout
          </button>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Completion Rate</p>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {completionRate}<span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>%</span>
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>planned sessions hit</p>
        </div>

        <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Completed Workouts</p>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {completedSessions}<span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/{totalSessions}</span>
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>total active this week</p>
        </div>
      </div>

      {/* ─── Weekly Planner Board ─── */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((dayInfo) => {
          const dayWorkouts = groupedWorkouts[dayInfo.name] || [];
          const isDragOver = dragOverDay === dayInfo.name;
          return (
            <div 
              key={dayInfo.name} 
              className="flex flex-col rounded-xl border transition-colors overflow-hidden min-h-[340px]"
              style={{
                backgroundColor: isDragOver ? 'var(--primary-light)' : 'var(--bg-card)',
                borderColor: isDragOver ? 'var(--primary)' : 'var(--border-default)',
              }}
              onDragOver={(e) => handleDragOver(e, dayInfo.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dayInfo.name)}
            >
              <div className="px-3 py-2.5 text-center border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card-hover)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{dayInfo.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {dayInfo.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </p>
              </div>

              <div className="flex-1 p-2 flex flex-col gap-2">
                {dayWorkouts.map((w) => {
                  const done = isWorkoutCompletedInDisplayedWeek(w);
                  const isBeingDragged = draggedWorkoutId === w._id;
                  return (
                    <div 
                      key={w._id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, w)}
                      onDragEnd={handleDragEnd}
                      className="group rounded-lg border p-2.5 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-opacity"
                      style={{
                        backgroundColor: done ? 'rgba(52,211,153,0.04)' : 'var(--bg-app)',
                        borderColor: done ? 'var(--status-success)' : 'var(--border-default)',
                        opacity: isBeingDragged ? 0.4 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p
                          className="text-xs font-medium truncate pointer-events-none"
                          style={{
                            color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          {w.exerciseName}
                        </p>
                        <button
                          onClick={() => handleToggleCompleted(w)}
                          aria-label={`Mark ${w.exerciseName} as ${done ? 'incomplete' : 'complete'}`}
                          className="h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
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
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <p className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {w.duration}m · {w.totalReps}r
                        </p>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEditModal(w)}
                            className="rounded p-1 cursor-pointer transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = ''; }}
                            title="Edit"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setWorkoutIdToDelete(w._id); setDeleteConfirmOpen(true); }}
                            className="rounded p-1 cursor-pointer transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--status-danger)'; e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = ''; }}
                            title="Delete"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <button
                  onClick={() => openAddModal(dayInfo.name)}
                  className="mt-auto rounded-lg border border-dashed py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Log/Edit Workout Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden animate-fadeIn" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Edit Workout' : 'Log Workout'}
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Exercise Name</label>
                <input
                  required
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g. Squats, Pushups"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Duration (min)</label>
                  <input
                    required
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="15"
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Total Reps</label>
                  <input
                    required
                    type="number"
                    value={totalReps}
                    onChange={(e) => setTotalReps(e.target.value)}
                    placeholder="30"
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Day of Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full h-10 rounded-lg border px-3 text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  {submitting ? 'Saving…' : 'Save Workout'}
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
              Delete workout?
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete this workout? This action cannot be undone.
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

export default Workouts;
