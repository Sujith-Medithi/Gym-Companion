import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, user, error, clearError } = useAuth();
  const [localError, setLocalError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Sync context error
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async (credentialResponse) => {
    setLocalError('');
    clearError();
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Failed to authenticate with Google');
    }
  };

  const handleError = () => {
    setLocalError('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-16 overflow-hidden">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Welcome Back
          </h1>
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Sign in to resume your active workout planner
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-default bg-card p-8 shadow-2xl flex flex-col items-center">
          {/* Error message */}
          {localError && (
            <div 
              role="alert" 
              className="mb-6 w-full flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 font-medium"
            >
              <svg className="h-5 w-5 shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-default rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative w-full flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-default rounded-lg px-4 py-2 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 z-10 flex items-center justify-center p-1"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center btn-primary-gradient"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative w-full flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-default"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-slate-500 uppercase font-medium">Or continue with</span>
            <div className="flex-grow border-t border-default"></div>
          </div>

          <div className="w-full flex justify-center py-2">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              size="large"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
