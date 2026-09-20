import { useState, useEffect, useMemo } from 'react';
import { useWorkouts } from '../context/WorkoutContext.jsx';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Progress = () => {
  const { workouts, loading, fetchWorkouts, report, reportLoading, fetchReport } = useWorkouts();
  const [activeTab, setActiveTab] = useState('charts');
  
  // Track theme state for chart styling
  const [currentTheme, setCurrentTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    fetchWorkouts();
    fetchReport();

    // Listen to theme changes in DOM
    const observer = new MutationObserver(() => {
      const themeVal = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setCurrentTheme(themeVal);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [fetchWorkouts, fetchReport]);

  // ─── Stats aggregation ───
  const totalSessions = useMemo(() => {
    return workouts ? workouts.reduce((sum, w) => sum + (w.completedDates ? w.completedDates.length : 0), 0) : 0;
  }, [workouts]);

  const totalReps = useMemo(() => {
    return (workouts || []).reduce((sum, w) => sum + (w.totalReps || 0) * (w.completedDates ? w.completedDates.length : 0), 0);
  }, [workouts]);

  const totalCalories = useMemo(() => {
    return (workouts || []).reduce((sum, w) => sum + (w.calories || 0) * (w.completedDates ? w.completedDates.length : 0), 0);
  }, [workouts]);

  const totalDuration = useMemo(() => {
    return (workouts || []).reduce((sum, w) => sum + (w.duration || 0) * (w.completedDates ? w.completedDates.length : 0), 0);
  }, [workouts]);

  const avgAccuracy = useMemo(() => {
    const totalAccPoints = (workouts || []).reduce((sum, w) => sum + (w.accuracy || 0) * (w.completedDates ? w.completedDates.length : 0), 0);
    return totalSessions > 0 ? Math.round(totalAccPoints / totalSessions) : 100;
  }, [workouts, totalSessions]);

  // ─── 1. Weekly Workouts (Last 7 Days sliding window) ───
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
  }, []);

  const weeklyData = useMemo(() => {
    return last7Days.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      let count = 0;
      (workouts || []).forEach((w) => {
        if (w.completedDates) {
          w.completedDates.forEach((dateStr) => {
            const d = new Date(dateStr);
            if (d >= dayStart && d <= dayEnd) {
              count++;
            }
          });
        }
      });
      return count;
    });
  }, [last7Days, workouts]);

  const weeklyLabels = useMemo(() => {
    return last7Days.map((day) =>
      day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
    );
  }, [last7Days]);

  // ─── 2. Monthly Workouts (Last 4 Weeks sliding window) ───
  const weeklyTotals = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const start = new Date();
      start.setDate(start.getDate() - ((3 - i) * 7 + 6));
      start.setHours(0, 0, 0, 0);
      
      const end = new Date();
      end.setDate(end.getDate() - (3 - i) * 7);
      end.setHours(23, 59, 59, 999);

      let count = 0;
      (workouts || []).forEach((w) => {
        if (w.completedDates) {
          w.completedDates.forEach((dateStr) => {
            const d = new Date(dateStr);
            if (d >= start && d <= end) {
              count++;
            }
          });
        }
      });
      return count;
    });
  }, [workouts]);

  const monthlyLabels = useMemo(() => ['3 Wks Ago', '2 Wks Ago', '1 Wk Ago', 'Current Wk'], []);

  // ─── 3. Exercise Accuracy & Calories by type ───
  const exerciseGroups = useMemo(() => {
    return (workouts || []).reduce((groups, w) => {
      const name = w.exerciseName;
      const completionsCount = w.completedDates ? w.completedDates.length : 0;
      if (completionsCount > 0) {
        if (!groups[name]) {
          groups[name] = { totalAcc: 0, count: 0, totalCal: 0 };
        }
        groups[name].totalAcc += (w.accuracy || 0) * completionsCount;
        groups[name].count += completionsCount;
        groups[name].totalCal += (w.calories || 0) * completionsCount;
      }
      return groups;
    }, {});
  }, [workouts]);

  const exerciseNames = useMemo(() => Object.keys(exerciseGroups), [exerciseGroups]);
  const avgAccuracies = useMemo(() => {
    return exerciseNames.map(
      (name) => Math.round(exerciseGroups[name].totalAcc / exerciseGroups[name].count)
    );
  }, [exerciseNames, exerciseGroups]);
  
  const calorieValues = useMemo(() => {
    return exerciseNames.map((name) => exerciseGroups[name].totalCal);
  }, [exerciseNames, exerciseGroups]);

  // ─── Theme Aware Chart Config ───
  const chartStyles = useMemo(() => {
    const isLight = currentTheme === 'light';
    return {
      gridColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
      textColor: isLight ? '#475569' : '#94A3B8',
      primaryColor: isLight ? '#4F46E5' : '#6366F1',
      primaryHover: isLight ? '#4338CA' : '#4F46E5',
      successColor: isLight ? '#10B981' : '#34D399',
      successHover: isLight ? '#059669' : '#10B981',
      successBg: isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(52, 211, 153, 0.1)',
      doughnutBorder: isLight ? '#ffffff' : '#14141E',
    };
  }, [currentTheme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartStyles.textColor, font: { size: 10, family: 'Plus Jakarta Sans', weight: '500' } },
      },
    },
    scales: {
      x: {
        grid: { color: chartStyles.gridColor },
        ticks: { color: chartStyles.textColor, font: { size: 9, family: 'Plus Jakarta Sans' } },
      },
      y: {
        grid: { color: chartStyles.gridColor },
        ticks: { color: chartStyles.textColor, font: { size: 9, family: 'Plus Jakarta Sans' }, stepSize: 1 },
      },
    },
  }), [chartStyles]);

  // Weekly Workouts Chart
  const weeklyChartData = useMemo(() => ({
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Sessions Completed',
        data: weeklyData,
        backgroundColor: chartStyles.primaryColor,
        borderRadius: 6,
        hoverBackgroundColor: chartStyles.primaryHover,
      },
    ],
  }), [weeklyLabels, weeklyData, chartStyles]);

  // Monthly Workouts Chart
  const monthlyChartData = useMemo(() => ({
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Sessions Completed',
        data: weeklyTotals,
        borderColor: chartStyles.successColor,
        backgroundColor: chartStyles.successBg,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartStyles.successColor,
      },
    ],
  }), [monthlyLabels, weeklyTotals, chartStyles]);

  // Exercise Accuracy Chart
  const accuracyChartData = useMemo(() => ({
    labels: exerciseNames,
    datasets: [
      {
        label: 'Average Accuracy (%)',
        data: avgAccuracies,
        backgroundColor: chartStyles.successColor,
        borderRadius: 6,
        hoverBackgroundColor: chartStyles.successHover,
      },
    ],
  }), [exerciseNames, avgAccuracies, chartStyles]);

  const accuracyChartOptions = useMemo(() => ({
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: 0,
        max: 100,
        ticks: { color: chartStyles.textColor, stepSize: 20, font: { size: 9, family: 'Plus Jakarta Sans' } },
      },
    },
  }), [chartOptions, chartStyles]);

  // Calorie Burn Distribution Chart
  const calorieChartData = useMemo(() => ({
    labels: exerciseNames,
    datasets: [
      {
        data: calorieValues,
        backgroundColor: ['#6366F1', '#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#EC4899'],
        borderWidth: 1.5,
        borderColor: chartStyles.doughnutBorder,
      },
    ],
  }), [exerciseNames, calorieValues, chartStyles]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Performance Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Loading analytics reports...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 rounded-xl border skeleton-shimmer" style={{ borderColor: 'var(--border-default)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-[300px] rounded-xl border skeleton-shimmer" style={{ borderColor: 'var(--border-default)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0 || totalSessions === 0) {
    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Performance Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Analyze your workout metrics, accuracy levels, and training volume.</p>
        </div>
        <div className="rounded-xl border p-12 text-center flex flex-col items-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No analytics data yet</h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Check off and complete workout sessions in your weekly planner to compile your performance reports.
          </p>
          <Link to="/workouts" className="rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer btn-primary-gradient">
            Go to Workouts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fadeIn">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Performance Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Analyze your training volume, execution quality, and history.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-lg border p-1 self-start sm:self-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <button
            onClick={() => setActiveTab('charts')}
            className="rounded px-4.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: activeTab === 'charts' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'charts' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            Charts & Metrics
          </button>
          <button
            onClick={() => {
              setActiveTab('report');
              fetchReport();
            }}
            className="rounded px-4.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: activeTab === 'report' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'report' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            AI Performance Report
          </button>
        </div>
      </div>

      {activeTab === 'charts' ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Reps</p>
              <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>{totalReps}</p>
            </div>
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Calories Burned</p>
              <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>{totalCalories} kcal</p>
            </div>
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Active Duration</p>
              <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>{totalDuration}m</p>
            </div>
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg Accuracy</p>
              <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--status-success)' }}>{avgAccuracy}%</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5 flex flex-col h-[300px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Weekly Completed Workouts</h3>
              <div className="flex-1 min-h-0 relative">
                <Bar data={weeklyChartData} options={chartOptions} />
              </div>
            </div>

            <div className="rounded-xl border p-5 flex flex-col h-[300px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Weekly Completions Trend</h3>
              <div className="flex-1 min-h-0 relative">
                <Line data={monthlyChartData} options={chartOptions} />
              </div>
            </div>

            <div className="rounded-xl border p-5 flex flex-col h-[300px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Exercise Accuracy Comparison</h3>
              <div className="flex-1 min-h-0 relative">
                <Bar data={accuracyChartData} options={accuracyChartOptions} />
              </div>
            </div>

            <div className="rounded-xl border p-5 flex flex-col h-[300px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Calorie Burn Distribution</h3>
              <div className="flex-1 min-h-0 relative flex items-center justify-center">
                <div className="h-full w-full max-w-[280px]">
                  <Doughnut
                    data={calorieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: { color: chartStyles.textColor, font: { size: 9, family: 'Plus Jakarta Sans' } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Performance Report View */
        <div className="space-y-6">
          {reportLoading || !report ? (
            <div className="flex h-[320px] flex-col items-center justify-center gap-3 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card-hover)' }}>
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Analyzing training volumes and compiling report...</p>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-6">
              
              {/* Detailed Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Overview Card */}
                <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider pb-2 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>Training Volume</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Workouts</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{report.totalWorkouts}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Reps</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{report.totalReps}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Calories</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--status-success)' }}>{report.caloriesBurned} kcal</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Time</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--primary)' }}>{report.workoutTime}m</p>
                    </div>
                  </div>
                </div>

                {/* Accuracy Metrics */}
                <div className="rounded-xl border p-5 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider pb-2 border-b mb-4" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>Alignment Accuracy</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="30" fill="none" strokeWidth="5.5" style={{ stroke: 'var(--border-default)' }} />
                          <circle
                            cx="36" cy="36" r="30" fill="none" strokeWidth="5.5"
                            strokeLinecap="round"
                            style={{
                              stroke: 'var(--status-success)',
                              strokeDasharray: `${2 * Math.PI * 30}`,
                              strokeDashoffset: `${2 * Math.PI * 30 * (1 - report.averageAccuracy / 100)}`
                            }}
                            className="transition-all duration-700"
                          />
                        </svg>
                        <span className="absolute text-sm font-bold" style={{ color: 'var(--status-success)' }}>{report.averageAccuracy}%</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Joint Alignment</p>
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          Measures form calibration compliance inside skeletal bounds.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Standings */}
                <div className="rounded-xl border p-5 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <div className="space-y-3.5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider pb-2 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>Exercise Standing</h3>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Highest Accuracy</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--status-success)' }}>{report.bestExercise}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Lowest Accuracy</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--status-danger)' }}>{report.weakestExercise}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Suggestions */}
              <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'var(--border-default)' }}>
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <svg className="h-4.5 w-4.5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.008v.008H12V18zm0-4.5h.008v.008H12v-.008zM12 9h.008v.008H12V9zm0-4.5h.008v.008H12v-.008z" />
                    </svg>
                    Personalized Suggestions
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!report) return;
                        const reportText = `AI GYM TRAINER — POSTURE & PERFORMANCE REPORT\nDate: ${new Date().toLocaleDateString()}\n---------------------------------------------\nTotal Workouts: ${report.totalWorkouts}\nTotal Reps: ${report.totalReps}\nCalories Burned: ${report.caloriesBurned} kcal\nWorkout Time: ${report.workoutTime} mins\nAverage Posture Accuracy: ${report.averageAccuracy}%\nHighest Accuracy Exercise: ${report.bestExercise}\nLowest Accuracy Exercise: ${report.weakestExercise}\n\nPERSONALIZED IMPROVEMENT SUGGESTIONS:\n${report.improvementSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
                        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `GymCompanion_Report_${new Date().toISOString().slice(0,10)}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      style={{ color: 'var(--status-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.18)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Export Report
                    </button>
                    
                    <button
                      onClick={fetchReport}
                      className="rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                      style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-default)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {report.improvementSuggestions.map((suggestion, index) => {
                    let svgIcon = (
                      <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                    let styles = {
                      bgColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderColor: 'var(--border-subtle)',
                    };

                    if (suggestion.includes('under 80%') || suggestion.includes('accuracy for')) {
                      svgIcon = (
                        <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      );
                      styles = {
                        bgColor: 'rgba(251,146,60,0.06)',
                        color: 'var(--status-warning)',
                        borderColor: 'rgba(251,146,60,0.18)',
                      };
                    } else if (suggestion.includes('Great job') || suggestion.includes('exceptional')) {
                      svgIcon = (
                        <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                      styles = {
                        bgColor: 'rgba(52,211,153,0.06)',
                        color: 'var(--status-success)',
                        borderColor: 'rgba(52,211,153,0.18)',
                      };
                    }

                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 border rounded-lg p-3.5 transition-colors"
                        style={{
                          backgroundColor: styles.bgColor,
                          color: styles.color,
                          borderColor: styles.borderColor,
                        }}
                      >
                        {svgIcon}
                        <p className="text-xs leading-relaxed font-semibold">{suggestion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Progress;
