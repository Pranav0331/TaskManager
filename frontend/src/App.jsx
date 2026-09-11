import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          containerStyle={{
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #1e293b)',
              color: 'var(--toast-color, #f1f5f9)',
              borderRadius: '10px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              duration: 3000,
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              duration: 3500,
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
