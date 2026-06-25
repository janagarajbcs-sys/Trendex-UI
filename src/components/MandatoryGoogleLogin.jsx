import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function MandatoryGoogleLogin({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined') return;

    const scriptId = 'google-gsi-script-mandatory';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
        initializeGoogle();
      };
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
      initializeGoogle();
    }

    function initializeGoogle() {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            setIsLoading(true);
            setGoogleError('');

            // Call backend API to save user
            const result = await api.post('/auth/google', {
              credential: response.credential,
            });

            // Save to localStorage as well
            localStorage.setItem('user_logged_in', 'true');
            localStorage.setItem('google_credential', response.credential);
            if (result.user) {
              localStorage.setItem('current_user', JSON.stringify(result.user));
            }

            onLoginSuccess && onLoginSuccess();
          } catch (err) {
            console.error('Google login failed:', err);
            setGoogleError('Google sign-in failed. Please try again.');
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false,
        context: 'signin',
      });

      // Render Google button
      const renderButton = () => {
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv && window.google?.accounts?.id) {
          buttonDiv.innerHTML = ''; // Clear any existing content
          window.google.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            logo_alignment: 'left',
            width: '100%',
          });
        }
      };

      // Try to render immediately and then a little later in case DOM isn't ready
      renderButton();
      setTimeout(renderButton, 100);
    }
  }, [onLoginSuccess, scriptLoaded]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔐</div>
        <h1
          style={{
            color: '#1e3a8a',
            fontSize: '2rem',
            marginBottom: '8px',
            fontWeight: 800,
          }}
        >
          Welcome to Trendex AI!
        </h1>
        <p
          style={{
            color: '#475569',
            fontSize: '1rem',
            marginBottom: '28px',
            lineHeight: '1.6',
          }}
        >
          To continue using our website, you must sign in with Google. This
          helps us provide you with a personalized experience and access to
          premium features.
        </p>

        {/* Google Sign-in Button Container */}
        <div
          id="google-signin-button"
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        ></div>

        {googleError && (
          <div
            style={{
              marginTop: '16px',
              color: '#dc2626',
              fontSize: '0.9rem',
            }}
          >
            {googleError}
          </div>
        )}

        <div
          style={{
            marginTop: '28px',
            color: '#94a3b8',
            fontSize: '0.8rem',
            lineHeight: '1.5',
          }}
        >
          By signing in with Google, you agree to our{' '}
          <a
            href="/terms"
            style={{ color: '#2563eb', textDecoration: 'underline' }}
          >
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            style={{ color: '#2563eb', textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
