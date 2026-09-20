import { useState, useEffect, useRef } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection.js';

const ActiveWorkoutSession = ({ onExit, onFinish, voiceEnabledProp = true }) => {
  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const [sessionExercises, setSessionExercises] = useState([
    { name: 'Squats', joint: 'knees', startState: 'UP' },
    { name: 'Push-ups', joint: 'elbows', startState: 'UP' },
    { name: 'Lunges', joint: 'knees', startState: 'UP' },
    { name: 'Bicep Curls', joint: 'elbows', startState: 'DOWN' },
    { name: 'Plank', joint: 'static', startState: 'HOLD' },
  ]);
  const [activeExerciseName, setActiveExerciseName] = useState('Squats');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customJoint, setCustomJoint] = useState('elbows');
  const [customStartState, setCustomStartState] = useState('UP');
  const [customError, setCustomError] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(voiceEnabledProp);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const currentExConfig =
    sessionExercises.find((e) => e.name === activeExerciseName) ||
    sessionExercises[0];

  const {
    fps: poseFps,
    error: poseError,
    reps: trackedReps,
    currentState: trackedState,
    currentRep: trackedRepProgress,
    formWarnings,
  } = usePoseDetection(
    videoRef,
    canvasRef,
    sessionStarted,
    activeExerciseName,
    currentExConfig.joint,
    currentExConfig.startState,
    voiceEnabled
  );

  const displayError = cameraError || poseError;

  useEffect(() => {
    if (!sessionStarted) return;
    
    let activeStream = null;
    const startCamera = async () => {
      setCameraLoading(true);
      setCameraError('');
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission denied.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera device found.');
        } else {
          setCameraError('Failed to access camera: ' + err.message);
        }
      } finally {
        setCameraLoading(false);
      }
    };
    startCamera();
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
    };
  }, [sessionStarted]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    let interval = null;
    if (stream) {
      interval = setInterval(() => setSessionDuration(prev => prev + 1), 1000);
    } else {
      setSessionDuration(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [stream]);

  const formatSessionTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExit = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    onExit();
  };

  const handleFinish = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    onFinish({
      activeExerciseName,
      sessionDuration,
      trackedReps
    });
  };

  const handleAddCustomExercise = (e) => {
    e.preventDefault();
    setCustomError('');
    const trimmedName = customName.trim();
    if (!trimmedName) return setCustomError('Exercise name is required');
    if (sessionExercises.some((ex) => ex.name.toLowerCase() === trimmedName.toLowerCase())) {
      return setCustomError('An exercise with this name already exists');
    }
    setSessionExercises((prev) => [...prev, { name: trimmedName, joint: customJoint, startState: customStartState }]);
    setActiveExerciseName(trimmedName);
    setCustomName('');
    setShowAddCustom(false);
  };

  if (!sessionStarted) {
    return (
      <div className="space-y-6 animate-fadeIn pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-default pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Setup Workout Session</h1>
            <p className="mt-1 text-sm text-slate-300 font-medium">Select your exercise and start tracking.</p>
          </div>
          <button onClick={onExit} className="rounded-xl border border-default px-5 py-3 text-sm font-bold text-slate-200 transition-all hover:bg-white/5 cursor-pointer">
            Cancel
          </button>
        </div>

        <div className="max-w-md mx-auto mt-10 rounded-2xl border border-default bg-card p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Choose Exercise</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Exercise Tracker</label>
              <select value={activeExerciseName} onChange={(e) => setActiveExerciseName(e.target.value)} className="w-full h-12 rounded-xl border border-default bg-input px-4 text-sm text-white outline-none focus:border-focus focus:ring-1 focus:ring-primary">
                {sessionExercises.map((ex) => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
              </select>
              <button type="button" onClick={() => { setShowAddCustom(!showAddCustom); setCustomError(''); }} className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
                {showAddCustom ? '✕ Close Form' : '+ Add Custom Exercise'}
              </button>
            </div>

            {showAddCustom && (
              <form onSubmit={handleAddCustomExercise} className="mt-4 space-y-4 border-t border-default pt-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Exercise Name</label>
                  <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Tricep Pushdowns" className="w-full h-11 rounded-lg border border-default bg-input px-3 text-sm text-white outline-none focus:border-focus" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Joint to Track</label>
                    <select value={customJoint} onChange={(e) => setCustomJoint(e.target.value)} className="w-full h-11 rounded-lg border border-default bg-input px-3 text-sm text-white outline-none focus:border-focus">
                      <option value="elbows">Elbows (Arms)</option>
                      <option value="knees">Knees (Legs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Start Position</label>
                    <select value={customStartState} onChange={(e) => setCustomStartState(e.target.value)} className="w-full h-11 rounded-lg border border-default bg-input px-3 text-sm text-white outline-none focus:border-focus">
                      <option value="UP">Extended / UP</option>
                      <option value="DOWN">Flexed / DOWN</option>
                    </select>
                  </div>
                </div>
                {customError && <p className="text-xs text-red-400 font-semibold">{customError}</p>}
                <button type="submit" className="w-full h-11 rounded-lg bg-primary/10 border border-primary/20 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors">Add & Select</button>
              </form>
            )}

            <div className="flex items-center justify-between border-t border-default mt-6 pt-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Voice Feedback</span>
                <span>{voiceEnabled ? '🔊' : '🔇'}</span>
              </div>
              <button type="button" onClick={() => setVoiceEnabled(!voiceEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${voiceEnabled ? 'bg-primary' : 'bg-surface'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <button onClick={() => setSessionStarted(true)} className="w-full mt-6 rounded-xl bg-primary hover:bg-primary-hover py-4 text-base font-bold text-white shadow-lg active:scale-[0.98] cursor-pointer transition-all">
              Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-default pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Active Workout Session</h1>
          <p className="mt-1 text-sm text-slate-300 font-medium">Align yourself in front of the camera and begin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExit} className="rounded-xl border border-default px-5 py-3 text-sm font-bold text-slate-200 transition-all hover:bg-white/5 cursor-pointer">
            Exit Session
          </button>
          <button onClick={handleFinish} disabled={cameraLoading || !!displayError} className="rounded-xl bg-success px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-success-hover active:scale-[0.98] disabled:opacity-50 cursor-pointer">
            Finish & Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-default bg-[#0B0B14] flex items-center justify-center shadow-2xl">
            {cameraLoading && (
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-primary"></div>
                <p className="text-sm text-slate-300 font-semibold">Accessing webcam feed...</p>
              </div>
            )}
            {displayError ? (
              <div className="flex flex-col items-center max-w-md p-6 text-center gap-4 z-10">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-500/10 text-red-400">⚠️</div>
                <h3 className="text-lg font-semibold text-white">Webcam Failed</h3>
                <p className="text-sm text-slate-400">{displayError}</p>
                <button onClick={() => window.location.reload()} className="mt-2 rounded-lg bg-surface px-5 py-2 text-xs font-semibold text-white hover:bg-card">Reload</button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full object-cover scale-x-[-1] ${stream ? 'block' : 'hidden'}`} />
                <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${stream ? 'block' : 'hidden'}`} />
                {stream && (
                  <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none select-none bg-gradient-to-t from-black/40 via-transparent to-black/25">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                          </span>
                          <span className="text-xs font-mono uppercase tracking-wider text-red-400">Live</span>
                        </div>
                        <span className="text-xs font-mono text-success border-l border-white/10 pl-2">{poseFps} FPS</span>
                      </div>
                      <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10">
                        <span className="text-xs font-mono text-success">{formatSessionTime(sessionDuration)}</span>
                      </div>
                    </div>
                    {formWarnings && formWarnings.length > 0 && (
                      <div className="flex flex-col gap-2 items-start px-1">
                        {formWarnings.map((w, i) => (
                          <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 backdrop-blur-md border text-xs font-semibold ${w.severity === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-amber-500/20 border-amber-500/40 text-amber-300'}`}>
                            <span className="text-base">{w.severity === 'error' ? '🚫' : '⚠️'}</span>
                            <span>{w.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-black/60 p-3 backdrop-blur-md border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">{activeExerciseName === 'Plank' ? 'Hold Time' : 'Total Reps'}</p>
                        <p className="text-lg font-mono font-bold text-white mt-0.5">{activeExerciseName === 'Plank' ? `${trackedReps}s` : trackedReps}</p>
                      </div>
                      <div className="rounded-xl bg-black/60 p-3 backdrop-blur-md border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">State</p>
                        <p className={`text-lg font-mono font-bold mt-0.5 ${trackedState === 'UP' ? 'text-green-400' : 'text-orange-400'}`}>{trackedState}</p>
                      </div>
                      <div className="rounded-xl bg-black/60 p-3 backdrop-blur-md border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Current Rep</p>
                        <p className="text-lg font-mono font-bold text-success mt-0.5">{trackedRepProgress}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-default bg-card p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Session Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Exercise Tracker</label>
                <div className="w-full rounded-lg border border-default bg-input px-3.5 py-2.5 text-sm text-white opacity-70 cursor-not-allowed">
                  {activeExerciseName}
                </div>
                <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider">Exercise cannot be changed during active session</p>
                <div className="flex items-center justify-between border-t border-default mt-4 pt-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Voice Feedback</span>
                    <span className="text-xs">{voiceEnabled ? '🔊' : '🔇'}</span>
                  </div>
                  <button type="button" onClick={() => setVoiceEnabled(!voiceEnabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${voiceEnabled ? 'bg-primary' : 'bg-surface'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              <div className="border-t border-default pt-4">
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-xs leading-relaxed text-slate-400">
                  <span className="font-semibold text-primary uppercase block mb-1">Interactive Guidance</span>
                  Align your body within the camera frame. The tracker counts repetitions and form deviations in real time.
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-default bg-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Form Tips for {activeExerciseName}</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Maintain neutral spine and neck alignment.</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Engage core muscles during the full range of motion.</li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span> Move under control without bouncing.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutSession;
