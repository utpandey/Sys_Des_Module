/**
 * Screen Reader Accessibility - React & Next.js Examples
 * ARIA, live regions, semantic HTML patterns
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ============================================
   1. VISUALLY HIDDEN (SR-ONLY) COMPONENT
   ============================================ */

const srOnlyStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function VisuallyHidden({ children, as: Tag = 'span', ...props }) {
  return <Tag style={srOnlyStyle} {...props}>{children}</Tag>;
}

// Usage:
// <button>🛒 Cart <span className="badge">3</span>
//   <VisuallyHidden>items in cart</VisuallyHidden>
// </button>
// Screen reader: "Cart, 3 items in cart, button"


/* ============================================
   2. LIVE REGION ANNOUNCER
   ============================================ */

/**
 * Global announcer for dynamic content
 * ✅ Production pattern: single announcer, used by any component
 */
const AnnouncerContext = React.createContext(null);

function AnnouncerProvider({ children }) {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState('polite');

  const announce = useCallback((text, priority = 'polite') => {
    setPoliteness(priority);
    setMessage(''); // Clear first to ensure re-announcement of same text
    requestAnimationFrame(() => {
      setMessage(text);
    });
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      {/* Polite announcer */}
      <div
        role="status"
        aria-live={politeness}
        aria-atomic="true"
        style={srOnlyStyle}
      >
        {message}
      </div>
    </AnnouncerContext.Provider>
  );
}

function useAnnounce() {
  const announce = React.useContext(AnnouncerContext);
  if (!announce) throw new Error('useAnnounce must be used within AnnouncerProvider');
  return announce;
}

// Usage:
// function AddToCartButton({ product }) {
//   const announce = useAnnounce();
//   const handleClick = () => {
//     addToCart(product);
//     announce(`${product.name} added to cart`);
//   };
//   return <button onClick={handleClick}>Add to Cart</button>;
// }


/* ============================================
   3. ACCESSIBLE FORM WITH VALIDATION
   ============================================ */

function AccessibleForm() {
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const errorRef = useRef(null);

  const validate = (data) => {
    const errs = {};
    if (!data.name) errs.name = 'Name is required';
    if (!data.email) errs.email = 'Email is required';
    else if (!data.email.includes('@')) errs.email = 'Please enter a valid email';
    if (!data.password) errs.password = 'Password is required';
    else if (data.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const validationErrors = validate(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus the error summary for screen readers
      requestAnimationFrame(() => errorRef.current?.focus());
    } else {
      setErrors({});
      setSubmitted(true);
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ✅ Error summary (screen reader focused on error) */}
      {errorCount > 0 && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          style={{ background: '#451a1a', border: '1px solid #ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}
        >
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem' }}>
            {errorCount} error{errorCount > 1 ? 's' : ''} found:
          </h3>
          <ul>
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>
                <a href={`#${field}-input`} style={{ color: '#f87171' }}>{msg}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitted && (
        <div role="status" style={{ background: '#14532d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          Account created successfully!
        </div>
      )}

      {/* Name field */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name-input">
          Name <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
          <VisuallyHidden>(required)</VisuallyHidden>
        </label>
        <input
          type="text"
          id="name-input"
          name="name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          style={{ width: '100%', padding: '0.5rem' }}
        />
        {errors.name && (
          <div id="name-error" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
            {errors.name}
          </div>
        )}
      </div>

      {/* Email field */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email-input">
          Email <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
          <VisuallyHidden>(required)</VisuallyHidden>
        </label>
        <input
          type="email"
          id="email-input"
          name="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : 'email-help'}
          style={{ width: '100%', padding: '0.5rem' }}
        />
        <div id="email-help" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          We'll never share your email.
        </div>
        {errors.email && (
          <div id="email-error" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
            {errors.email}
          </div>
        )}
      </div>

      {/* Password field */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="password-input">
          Password <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
          <VisuallyHidden>(required)</VisuallyHidden>
        </label>
        <input
          type="password"
          id="password-input"
          name="password"
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : 'password-help'}
          style={{ width: '100%', padding: '0.5rem' }}
        />
        <div id="password-help" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          At least 8 characters with a number.
        </div>
        {errors.password && (
          <div id="password-error" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
            {errors.password}
          </div>
        )}
      </div>

      <button type="submit">Create Account</button>
    </form>
  );
}


/* ============================================
   4. ACCESSIBLE LOADING STATE
   ============================================ */

function LoadingButton({ onClick, children, loadingText = 'Loading...' }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true">⏳</span>
          <VisuallyHidden>{loadingText}</VisuallyHidden>
          {loadingText}
        </>
      ) : children}
    </button>
  );
}


/* ============================================
   5. ACCESSIBLE TOAST / NOTIFICATION
   ============================================ */

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const ToastContainer = () => (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="status"
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : '#2563eb',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}

// Usage:
// function App() {
//   const { addToast, ToastContainer } = useToast();
//   return (
//     <>
//       <button onClick={() => addToast('Item saved!', 'success')}>Save</button>
//       <ToastContainer />
//     </>
//   );
// }


/* ============================================
   6. NEXT.JS SPECIFIC PATTERNS
   ============================================ */

/**
 * Next.js automatically includes:
 * - <html lang="..."> from layout.js
 * - Route announcer for navigation changes
 * - next/image with required alt prop
 *
 * Additional patterns:
 */

// next/image enforces alt text
// <Image src="/hero.jpg" alt="Team collaborating in office" width={800} height={400} />

// Metadata for document title (screen readers announce page titles)
/*
export const metadata = {
  title: 'Dashboard | MyApp',
  description: 'View your analytics and recent activity',
};
*/

// Next.js Link with aria-current for navigation
/*
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      style={{ fontWeight: isActive ? 'bold' : 'normal' }}
    >
      {children}
    </Link>
  );
}
*/


export {
  VisuallyHidden,
  AnnouncerProvider,
  useAnnounce,
  AccessibleForm,
  LoadingButton,
  useToast,
};
