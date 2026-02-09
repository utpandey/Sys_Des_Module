/**
 * Keyboard Accessibility - React & Next.js Examples
 * Tab navigation, roving tabindex, keyboard shortcuts
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

/* ============================================
   1. ACCESSIBLE BUTTON (vs div)
   ============================================ */

// ❌ BAD: div as button
function BadButton({ onClick, children }) {
    return (
        <div onClick={onClick} style={{ cursor: 'pointer' }}>
            {children}
        </div>
        // Problems: Not focusable, no Enter/Space, screen reader says "text"
    );
}

// ✅ GOOD: Just use <button>
function GoodButton({ onClick, children, ...props }) {
    return (
        <button onClick={onClick} {...props}>
            {children}
        </button>
        // Free: Focus, Enter/Space, "button" role, disabled support
    );
}

// ✅ If you MUST use a div (rare cases)
function AccessibleDiv({ onClick, children }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(e);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            style={{ cursor: 'pointer' }}
        >
            {children}
        </div>
    );
}


/* ============================================
   2. SKIP NAVIGATION (Next.js)
   ============================================ */

function SkipNav() {
    return (
        <a
            href="#main-content"
            style={{
                position: 'absolute',
                top: '-100px',
                left: 0,
                background: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                zIndex: 1000,
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'top 0.2s',
            }}
            // Show on focus
            onFocus={(e) => { e.target.style.top = '0'; }}
            onBlur={(e) => { e.target.style.top = '-100px'; }}
        >
            Skip to main content
        </a>
    );
}

// Usage in Next.js layout:
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <SkipNav />
//         <Header />
//         <main id="main-content">{children}</main>
//         <Footer />
//       </body>
//     </html>
//   );
// }


/* ============================================
   3. ACCESSIBLE TABS (Roving Tabindex)
   ============================================ */

function Tabs({ tabs }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const tabRefs = useRef([]);

    const handleKeyDown = (e) => {
        let newIndex = activeIndex;

        switch (e.key) {
            case 'ArrowRight':
                newIndex = (activeIndex + 1) % tabs.length;
                break;
            case 'ArrowLeft':
                newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = tabs.length - 1;
                break;
            default:
                return;
        }

        e.preventDefault();
        setActiveIndex(newIndex);
        tabRefs.current[newIndex]?.focus();
    };

    return (
        <div>
            {/* Tab List */}
            <div role="tablist" aria-label="Content tabs" onKeyDown={handleKeyDown}>
                {tabs.map((tab, i) => (
                    <button
                        key={tab.id}
                        ref={(el) => (tabRefs.current[i] = el)}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={i === activeIndex}
                        aria-controls={`panel-${tab.id}`}
                        tabIndex={i === activeIndex ? 0 : -1}
                        onClick={() => setActiveIndex(i)}
                        style={{
                            background: 'transparent',
                            color: i === activeIndex ? '#38bdf8' : '#94a3b8',
                            border: 'none',
                            borderBottom: `2px solid ${i === activeIndex ? '#38bdf8' : 'transparent'}`,
                            padding: '0.75rem 1.25rem',
                            cursor: 'pointer',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            {tabs.map((tab, i) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`panel-${tab.id}`}
                    aria-labelledby={`tab-${tab.id}`}
                    hidden={i !== activeIndex}
                    tabIndex={0}
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}

// Usage:
// <Tabs tabs={[
//   { id: 'info', label: 'Info', content: <InfoPanel /> },
//   { id: 'settings', label: 'Settings', content: <SettingsPanel /> },
// ]} />


/* ============================================
   4. ACCESSIBLE DROPDOWN MENU
   ============================================ */

function DropdownMenu({ trigger, items }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const triggerRef = useRef(null);
    const itemRefs = useRef([]);

    const open = useCallback(() => {
        setIsOpen(true);
        setActiveIndex(0);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
    }, []);

    // Focus active item when index changes
    useEffect(() => {
        if (isOpen && activeIndex >= 0) {
            itemRefs.current[activeIndex]?.focus();
        }
    }, [activeIndex, isOpen]);

    const handleTriggerKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
        }
    };

    const handleMenuKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % items.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
                break;
            case 'Home':
                e.preventDefault();
                setActiveIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setActiveIndex(items.length - 1);
                break;
            case 'Escape':
            case 'Tab':
                close();
                break;
            default:
                break;
        }
    };

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e) => {
            if (!triggerRef.current?.parentElement?.contains(e.target)) {
                close();
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isOpen, close]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                ref={triggerRef}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => (isOpen ? close() : open())}
                onKeyDown={handleTriggerKeyDown}
            >
                {trigger}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    onKeyDown={handleMenuKeyDown}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        minWidth: '200px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        zIndex: 100,
                    }}
                >
                    {items.map((item, i) => (
                        <button
                            key={i}
                            ref={(el) => (itemRefs.current[i] = el)}
                            role="menuitem"
                            tabIndex={i === activeIndex ? 0 : -1}
                            onClick={() => {
                                item.onClick?.();
                                close();
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '0.5rem 1rem',
                                background: 'none',
                                border: 'none',
                                color: '#e2e8f0',
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Usage:
// <DropdownMenu
//   trigger="Options ▾"
//   items={[
//     { label: 'Edit', onClick: () => console.log('Edit') },
//     { label: 'Duplicate', onClick: () => console.log('Duplicate') },
//     { label: 'Delete', onClick: () => console.log('Delete') },
//   ]}
// />


/* ============================================
   5. KEYBOARD SHORTCUT HOOK
   ============================================ */

function useKeyboardShortcut(key, callback, modifiers = {}) {
    useEffect(() => {
        const handler = (e) => {
            const { ctrl, shift, alt, meta } = modifiers;
            if (ctrl && !e.ctrlKey) return;
            if (shift && !e.shiftKey) return;
            if (alt && !e.altKey) return;
            if (meta && !e.metaKey) return;

            if (e.key.toLowerCase() === key.toLowerCase()) {
                // Don't trigger in input fields
                const target = e.target;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }

                e.preventDefault();
                callback(e);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, callback, modifiers]);
}

// Usage:
// useKeyboardShortcut('k', () => openSearch(), { ctrl: true }); // Ctrl+K → open search
// useKeyboardShortcut('Escape', () => closeModal());
// useKeyboardShortcut('/', () => focusSearch());


/* ============================================
   6. NEXT.JS FOCUS MANAGEMENT ON ROUTE CHANGE
   ============================================ */

// In Next.js App Router, focus management on route change
// is handled automatically. But for custom behavior:

/*
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

function RouteAnnouncer() {
  const pathname = usePathname();
  const ref = useRef(null);

  useEffect(() => {
    // Announce page change to screen readers
    if (ref.current) {
      ref.current.textContent = `Navigated to ${document.title}`;
    }
  }, [pathname]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
      }}
    />
  );
}
*/


export {
    GoodButton,
    AccessibleDiv,
    SkipNav,
    Tabs,
    DropdownMenu,
    useKeyboardShortcut,
};
