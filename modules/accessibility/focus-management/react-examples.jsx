/**
 * Focus Management - React & Next.js Examples
 * Focus traps, restoration, route change handling
 */

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';

/* ============================================
   1. useFocusTrap HOOK
   ============================================ */

function useFocusTrap(isActive) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableEls = container.querySelectorAll(focusableSelector);
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}


/* ============================================
   2. useFocusRestore HOOK
   ============================================ */

function useFocusRestore() {
  const previousFocusRef = useRef(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, []);

  return { saveFocus, restoreFocus };
}


/* ============================================
   3. ACCESSIBLE MODAL (Complete Implementation)
   ============================================ */

function Modal({ isOpen, onClose, title, children }) {
  const trapRef = useFocusTrap(isOpen);
  const { saveFocus, restoreFocus } = useFocusRestore();
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;

  // Save focus when opening
  useEffect(() => {
    if (isOpen) {
      saveFocus();

      // Focus the modal container (with tabIndex -1 for programmatic focus)
      requestAnimationFrame(() => {
        trapRef.current?.focus();
      });

      // Make background inert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, saveFocus]);

  // Restore focus when closing
  useEffect(() => {
    if (!isOpen) {
      restoreFocus();
    }
  }, [isOpen, restoreFocus]);

  // Handle Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '1rem', padding: '2rem',
          maxWidth: '500px', width: '90%',
          outline: 'none',
        }}
      >
        <h2 id={titleId} style={{ margin: '0 0 1rem', color: '#818cf8' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

// Usage:
// function App() {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>Open Modal</button>
//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Profile">
//         <input type="text" placeholder="Name" />
//         <button onClick={() => setIsOpen(false)}>Save</button>
//         <button onClick={() => setIsOpen(false)}>Cancel</button>
//       </Modal>
//     </>
//   );
// }


/* ============================================
   4. NATIVE <dialog> IN REACT (Best Practice)
   ============================================ */

function NativeDialog({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); // Built-in: focus trap, Escape, backdrop
    } else {
      dialog.close();     // Built-in: focus restoration
    }
  }, [isOpen]);

  // Handle native close event
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      style={{
        background: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '500px',
      }}
    >
      <h2 id="dialog-title" style={{ color: '#818cf8', margin: '0 0 1rem' }}>{title}</h2>
      {children}
    </dialog>
  );
}

// ✅ Simplest approach — use <dialog> when possible!
// function App() {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <button onClick={() => setOpen(true)}>Open</button>
//       <NativeDialog isOpen={open} onClose={() => setOpen(false)} title="Confirm">
//         <p>Are you sure?</p>
//         <button onClick={() => setOpen(false)}>Yes</button>
//         <button onClick={() => setOpen(false)}>No</button>
//       </NativeDialog>
//     </>
//   );
// }


/* ============================================
   5. FOCUS ON LIST ITEM DELETION
   ============================================ */

function DeletableList({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const itemRefs = useRef({});
  const statusRef = useRef(null);

  const deleteItem = useCallback((id) => {
    setItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      const next = prev.filter(item => item.id !== id);

      // Focus next item, or previous if deleting last
      requestAnimationFrame(() => {
        const focusIndex = Math.min(index, next.length - 1);
        if (focusIndex >= 0) {
          const nextId = next[focusIndex].id;
          itemRefs.current[nextId]?.focus();
        }

        // Announce
        if (statusRef.current) {
          statusRef.current.textContent = `Item deleted. ${next.length} items remaining.`;
        }
      });

      return next;
    });
  }, []);

  return (
    <div>
      <ul role="list" aria-label="Editable items">
        {items.map(item => (
          <li key={item.id} style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0', alignItems: 'center' }}>
            <span>{item.name}</span>
            <button
              ref={(el) => (itemRefs.current[item.id] = el)}
              onClick={() => deleteItem(item.id)}
              aria-label={`Delete ${item.name}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div ref={statusRef} role="status" aria-live="polite" style={{ fontSize: '0.85rem' }} />
    </div>
  );
}


/* ============================================
   6. NEXT.JS ROUTE CHANGE FOCUS
   ============================================ */

/*
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Focus main heading on route change
function FocusOnRouteChange() {
  const pathname = usePathname();
  const headingRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Don't focus on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Focus the main heading after route change
    const h1 = document.querySelector('main h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus();
      // Clean up tabindex after blur
      h1.addEventListener('blur', () => h1.removeAttribute('tabindex'), { once: true });
    }
  }, [pathname]);

  return null;
}

// Usage in layout.js:
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <FocusOnRouteChange />
//         <Header />
//         <main>{children}</main>
//       </body>
//     </html>
//   );
// }
*/


export {
  useFocusTrap,
  useFocusRestore,
  Modal,
  NativeDialog,
  DeletableList,
};
