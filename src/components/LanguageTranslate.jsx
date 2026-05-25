import { useEffect, useState } from 'react';

export default function LanguageTranslate({ inMenu = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Define the global init function
    window.googleTranslateElementInit = () => {
      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'ta,te,ml,kn,hi',
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsLoaded(true);
      }
    };

    // 2. Dynamically load the Google Translate script
    const addScript = () => {
      if (document.querySelector('#google-translate-script')) return;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src =
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    addScript();
  }, []);

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Tamil (தமிழ்)', code: 'ta' },
    { name: 'Telugu (తెలుగు)', code: 'te' },
    { name: 'Malayalam (മലയാളം)', code: 'ml' },
    { name: 'Kannada (ಕನ್ನಡ)', code: 'kn' },
    { name: 'Hindi (हिन्दी)', code: 'hi' },
  ];

  const changeLanguage = (langCode) => {
    // 1. Determine the domain for the cookie
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const baseDomain = parts.length > 2 ? '.' + parts.slice(-2).join('.') : '';

    // 2. Function to set cookie
    const setCookie = (name, value, domain) => {
      let cookieStr = `${name}=${value}; path=/;`;
      if (domain) cookieStr += ` domain=${domain};`;
      // For production (HTTPS), add Secure and SameSite if possible
      if (window.location.protocol === 'https:') {
        cookieStr += ' Secure; SameSite=None;';
      }
      document.cookie = cookieStr;
    };

    // 3. Clear existing cookies and set new one
    // We set it on both the exact hostname and the base domain to be safe
    const cookieValue = langCode === 'en' ? '' : `/en/${langCode}`;
    
    // Set for current session
    setCookie('googtrans', cookieValue, '');
    setCookie('googtrans', cookieValue, hostname);
    if (baseDomain) {
      setCookie('googtrans', cookieValue, baseDomain);
    }

    // 4. Try to trigger the Google Translate dropdown directly
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      
      // Close menu
      setIsOpen(false);
      
      // If it's English, we might need a reload to fully clear the Google UI
      if (langCode === 'en') {
        setTimeout(() => window.location.reload(), 300);
      }
    } else {
      // If the dropdown isn't found, reload is the only way to apply the cookie
      setIsOpen(false);
      window.location.reload();
    }
  };

  const toggleTranslate = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="language-translate-container"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Translate Button */}
      <button
        onClick={toggleTranslate}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--brand-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '50%',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
        title="Translate Page"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
      </button>

      {/* Language Selection Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            padding: '8px',
            minWidth: '180px',
            zIndex: 200001,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            border: '1px solid #e2e8f0',
            marginTop: '12px',
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1e293b',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#1e293b';
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt, .goog-te-banner {
          display: none !important;
        }
        body { top: 0 !important; }
        .skiptranslate iframe { display: none !important; }
      `}</style>
    </div>
  );
}
