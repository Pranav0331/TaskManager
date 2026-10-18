import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27a7.18 7.18 0 0 1 0-4.54V6.58H1.25a11.98 11.98 0 0 0 0 10.84l4.03-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

const GoogleAuthButton = ({ mode = 'signin' }) => {
  const { loginWithGoogle } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const isConfigured = Boolean(
    clientId &&
    !clientId.includes('your_google_client_id') &&
    !clientId.includes('PASTE_YOUR_') &&
    clientId.length > 15
  );

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Failed to obtain Google credentials. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        toast.success(mode === 'signup' ? 'Account created with Google!' : 'Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        'Google authentication failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    toast.error('Google Sign-In was cancelled or failed.');
  };

  const handleFallbackClick = () => {
    toast.error(
      'Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your frontend .env file.'
    );
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-nimbus-200 dark:border-nimbus-700 bg-nimbus-50 dark:bg-nimbus-900 text-nimbus-700 dark:text-nimbus-200 text-sm font-medium">
          <svg className="animate-spin h-4 w-4 text-brand-600" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Authenticating with Google...</span>
        </div>
      ) : isConfigured ? (
        <GoogleOAuthProvider clientId={clientId}>
          <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:!w-full [&>div]:flex [&>div]:justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              text="continue_with"
              shape="rectangular"
              size="large"
              theme={darkMode ? 'filled_black' : 'outline'}
              width="100%"
            />
          </div>
        </GoogleOAuthProvider>
      ) : (
        <button
          type="button"
          onClick={handleFallbackClick}
          className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-nimbus-300 dark:border-nimbus-700 bg-white dark:bg-nimbus-900 text-nimbus-800 dark:text-nimbus-100 text-sm font-medium hover:bg-nimbus-50 dark:hover:bg-nimbus-800 transition-colors shadow-sm"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
};

export default GoogleAuthButton;
