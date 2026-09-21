import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Mail, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/taskService';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      setSubmitted(true);
      toast.success(response.message || 'Password reset link sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

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
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Secure Account<br />Recovery
            </h2>
            <p className="text-brand-200 text-lg max-w-md">
              Forgot your credentials? We will send you a temporary, secure password reset link to get back to your workspace.
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

          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white mb-2">
                Forgot password?
              </h2>
              <p className="text-nimbus-500 mb-8 text-sm leading-relaxed">
                Enter the email associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nimbus-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      className="nimbus-input pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white">
                Check your inbox
              </h2>

              <p className="text-sm text-nimbus-600 dark:text-nimbus-300 leading-relaxed max-w-sm mx-auto">
                If an account exists for <span className="font-semibold text-nimbus-900 dark:text-white">{email}</span>, a password reset link has been sent.
              </p>

              <div className="p-3.5 rounded-xl bg-nimbus-50 dark:bg-nimbus-900 border border-nimbus-200 dark:border-nimbus-800 text-xs text-nimbus-500 text-left space-y-1">
                <p className="font-medium text-nimbus-700 dark:text-nimbus-300">Didn&apos;t receive the email?</p>
                <p>• Check your spam or junk folder.</p>
                <p>• Verify you entered the correct email address.</p>
                <p>• The reset link remains valid for 1 hour.</p>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="nimbus-btn-secondary w-full text-xs font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Try another email
              </button>
            </motion.div>
          )}

          <div className="text-center mt-8 pt-6 border-t border-nimbus-100 dark:border-nimbus-800">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-nimbus-600 dark:text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
