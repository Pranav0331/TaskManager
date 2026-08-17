import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Mail, ArrowLeft, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/taskService';
import Button from '../components/ui/Button';

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email from navigation state or session storage
  const [email, setEmail] = useState(() => {
    return location.state?.email || sessionStorage.getItem('pending_otp_email') || '';
  });

  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRefs = useRef([]);

  // If no email is available, redirect back to register
  useEffect(() => {
    if (!email) {
      toast.error('Please enter your details to register first.');
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Focus the first input box on initial mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    setErrorMessage('');
    // Allow only single numerical digit
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous box if current box is already empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const pasteData = e.clipboardData.getData('text').trim();
    const digitsOnly = pasteData.replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (digitsOnly.length > 0) {
      const newOtp = new Array(OTP_LENGTH).fill('');
      for (let i = 0; i < digitsOnly.length; i++) {
        newOtp[i] = digitsOnly[i];
      }
      setOtp(newOtp);

      const focusIdx = Math.min(digitsOnly.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length < OTP_LENGTH) {
      setErrorMessage('Please enter the complete 4-digit code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await authService.verifyOtp({
        email,
        otp: enteredOtp,
      });

      if (response.success) {
        toast.success('Account created successfully! Please sign in.');
        sessionStorage.removeItem('pending_otp_email');
        navigate('/login', { state: { email }, replace: true });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Verification failed';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || resending) return;

    setResending(true);
    setErrorMessage('');

    try {
      const response = await authService.resendOtp({ email });
      if (response.success) {
        toast.success('A new verification code has been sent to your email!');
        setTimeLeft(RESEND_COOLDOWN_SECONDS);
        setOtp(new Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend verification code';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit.trim() !== '');

  return (
    <div className="min-h-screen flex">
      {/* Left hero banner */}
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

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-brand-100 text-xs font-medium mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Two-Step Secure Registration
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Protecting your<br />workspace security
            </h2>
            <p className="text-brand-200 text-lg max-w-md">
              We verify your email address to ensure your tasks, team data, and projects stay completely secure.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right form container */}
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

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white mb-2">
              Verify your email
            </h2>
            <p className="text-nimbus-600 dark:text-nimbus-400 text-sm leading-relaxed">
              We've sent a 4-digit verification code to{' '}
              <strong className="text-nimbus-900 dark:text-white font-semibold">{email}</strong>.
            </p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 mb-6 text-sm text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* 4-digit OTP Inputs */}
            <div>
              <label className="block text-xs font-semibold text-nimbus-600 dark:text-nimbus-400 uppercase tracking-wider mb-3">
                4-Digit Verification Code
              </label>
              <div className="flex items-center justify-between gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-16 text-center text-2xl font-bold font-mono bg-white dark:bg-nimbus-900 border-2 border-nimbus-200 dark:border-nimbus-700 rounded-xl text-nimbus-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all duration-200"
                  />
                ))}
              </div>
            </div>

            {/* Timer and Resend section */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-nimbus-50 dark:bg-nimbus-900/60 border border-nimbus-200 dark:border-nimbus-800 text-xs">
              <div className="flex items-center gap-1.5 text-nimbus-600 dark:text-nimbus-400">
                <span>Code expires in:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || resending}
                className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={!isOtpComplete || loading}
              className="w-full py-3"
            >
              Verify OTP
            </Button>
          </form>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between text-sm text-nimbus-500 mt-8 pt-6 border-t border-nimbus-200 dark:border-nimbus-800">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-nimbus-600 dark:text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Change email
            </Link>

            <Link
              to="/login"
              className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
            >
              Back to Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
