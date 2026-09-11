import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/taskService';
import Button from '../components/ui/Button';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('No password reset token provided. Please request a new reset link.');
      setValidatingToken(false);
      return;
    }

    const checkToken = async () => {
      try {
        await authService.verifyResetToken(token);
        setTokenError('');
      } catch (err) {
        setTokenError(
          err.response?.data?.message || 'This password reset link is invalid or has expired. Please request a new one.'
        );
      } finally {
        setValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      toast.error('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword({ token, password });
      toast.success(response.message || 'Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(msg);
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setTokenError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isLengthValid = password.length >= 6;
  const doPasswordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
                <p className="text-brand-200 text-sm">Powered by Nimbus UI</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Set New<br />Password
            </h2>
            <p className="text-brand-200 text-lg max-w-md">
              Create a new secure password for your TaskFlow account to regain access to your workspace.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-nimbus-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>

          {validatingToken ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-nimbus-500">Verifying password reset link...</p>
            </div>
          ) : tokenError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white">
                Invalid Reset Link
              </h2>

              <p className="text-sm text-nimbus-600 dark:text-nimbus-400 leading-relaxed max-w-sm mx-auto">
                {tokenError}
              </p>

              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="nimbus-btn-primary w-full text-center inline-flex items-center justify-center"
                >
                  <KeyRound className="w-4 h-4 mr-2" /> Request a new reset link
                </Link>
              </div>

              <div className="pt-4 border-t border-nimbus-100 dark:border-nimbus-800">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-nimbus-600 dark:text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white mb-2">
                Create new password
              </h2>
              <p className="text-nimbus-500 mb-8 text-sm leading-relaxed">
                Choose a strong password with at least 6 characters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nimbus-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter new password (min. 6 chars)"
                      className="nimbus-input pl-10 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-nimbus-400 hover:text-nimbus-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nimbus-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter your new password"
                      className="nimbus-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-nimbus-400 hover:text-nimbus-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live validation feedback */}
                <div className="p-3 rounded-lg bg-nimbus-50 dark:bg-nimbus-900 border border-nimbus-200/70 dark:border-nimbus-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 transition-colors ${
                        isLengthValid ? 'text-emerald-500' : 'text-nimbus-400'
                      }`}
                    />
                    <span className={isLengthValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-nimbus-500'}>
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 transition-colors ${
                        doPasswordsMatch ? 'text-emerald-500' : 'text-nimbus-400'
                      }`}
                    />
                    <span className={doPasswordsMatch ? 'text-emerald-700 dark:text-emerald-400' : 'text-nimbus-500'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full">
                  Reset Password
                </Button>
              </form>

              <div className="text-center mt-8 pt-6 border-t border-nimbus-100 dark:border-nimbus-800">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-nimbus-600 dark:text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
