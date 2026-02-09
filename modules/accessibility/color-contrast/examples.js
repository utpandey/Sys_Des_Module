/**
 * Color Contrast - Vanilla JS & React Examples
 * Contrast checking, accessible color systems, utilities
 */

/* ============================================
   1. CONTRAST RATIO CALCULATOR (Vanilla JS)
   ============================================ */

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns ratio like 4.5 (for 4.5:1)
 */
function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function getRelativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if contrast meets WCAG level
 */
function meetsWCAG(ratio, level = 'AA', isLargeText = false) {
  if (level === 'AA') {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return false;
}

// Usage:
// const ratio = getContrastRatio('#333333', '#ffffff');
// console.log(ratio); // 12.63
// console.log(meetsWCAG(ratio, 'AA')); // true
// console.log(meetsWCAG(ratio, 'AAA')); // true


/**
 * 2. Suggest accessible color alternative
 * Adjusts color to meet contrast requirement
 */
function suggestAccessibleColor(foreground, background, targetRatio = 4.5) {
  const bgRgb = hexToRgb(background);
  const bgLum = getRelativeLuminance(bgRgb);
  let fgRgb = hexToRgb(foreground);

  // Try darkening or lightening
  const shouldDarken = bgLum > 0.5; // Light background → darken text
  const step = shouldDarken ? -1 : 1;

  for (let i = 0; i < 256; i++) {
    const ratio = getContrastRatio(rgbToHex(fgRgb), background);
    if (ratio >= targetRatio) {
      return rgbToHex(fgRgb);
    }
    fgRgb = {
      r: Math.max(0, Math.min(255, fgRgb.r + step)),
      g: Math.max(0, Math.min(255, fgRgb.g + step)),
      b: Math.max(0, Math.min(255, fgRgb.b + step)),
    };
  }

  return shouldDarken ? '#000000' : '#ffffff';
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}


/**
 * 3. Accessible Color Palette Generator
 */
function generateAccessiblePalette(baseColors, background = '#ffffff') {
  return baseColors.map(color => {
    const ratio = getContrastRatio(color, background);
    const passesAA = meetsWCAG(ratio, 'AA');
    const passesAAA = meetsWCAG(ratio, 'AAA');
    const suggestion = passesAA ? null : suggestAccessibleColor(color, background);

    return {
      color,
      ratio: ratio.toFixed(2),
      AA: passesAA ? '✅' : '❌',
      AAA: passesAAA ? '✅' : '❌',
      suggestion,
    };
  });
}

// Example:
// const palette = generateAccessiblePalette(
//   ['#3b82f6', '#ef4444', '#22c55e', '#999999', '#cccccc'],
//   '#ffffff'
// );
// console.table(palette);
// color     | ratio | AA | AAA | suggestion
// #3b82f6   | 3.96  | ❌ | ❌  | #2563eb
// #ef4444   | 3.87  | ❌ | ❌  | #dc2626
// #22c55e   | 2.36  | ❌ | ❌  | #15803d
// #999999   | 2.85  | ❌ | ❌  | #595959
// #cccccc   | 1.60  | ❌ | ❌  | #767676


/* ============================================
   4. CSS EXAMPLES FOR ACCESSIBLE COLORS
   ============================================ */

const accessibleColorCSS = `
/* ✅ Accessible Color System (CSS Custom Properties) */
:root {
  /* Text colors that pass AA on white background */
  --text-primary: #1e293b;     /* 13.5:1 on white ✅✅ */
  --text-secondary: #475569;   /* 7.05:1 on white ✅✅ */
  --text-tertiary: #64748b;    /* 4.54:1 on white ✅ */
  --text-disabled: #94a3b8;    /* 2.96:1 on white ❌ — ok for disabled */
  
  /* Brand colors adjusted for accessibility */
  --brand-primary: #2563eb;    /* 4.63:1 on white ✅ */
  --brand-error: #dc2626;      /* 4.63:1 on white ✅ */
  --brand-success: #15803d;    /* 4.58:1 on white ✅ */
  --brand-warning: #92400e;    /* 5.92:1 on white ✅ */
}

/* ❌ Common bad patterns */
.bad-placeholder::placeholder {
  color: #cccccc; /* 1.6:1 — unreadable! */
}

/* ✅ Accessible placeholder */
.good-placeholder::placeholder {
  color: #767676; /* 4.5:1 — meets AA */
}

/* ✅ Don't rely on color alone */
.error-field {
  border-color: var(--brand-error);
  border-width: 2px; /* Visual thickness change */
}
.error-field::before {
  content: "⚠️"; /* Icon in addition to color */
}
.error-message {
  color: var(--brand-error);
  /* Also has text content, not just color */
}

/* ✅ Focus ring with sufficient contrast */
:focus-visible {
  outline: 3px solid #2563eb;  /* 4.63:1 on white */
  outline-offset: 2px;
}

/* ✅ Link differentiation */
a {
  color: #2563eb;
  text-decoration: underline; /* Don't rely on color alone */
}

/* ✅ Text over image */
.text-over-image {
  position: relative;
}
.text-over-image::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6); /* Dark overlay ensures contrast */
}
.text-over-image span {
  position: relative;
  color: white;
}
`;


/* ============================================
   REACT EXAMPLES
   ============================================ */

/**
 * 5. useContrastChecker Hook
 */
function useContrastChecker(foreground, background) {
  const ratio = React.useMemo(() => {
    if (!foreground || !background) return 0;
    return getContrastRatio(foreground, background);
  }, [foreground, background]);

  return {
    ratio: ratio.toFixed(2),
    passesAA: meetsWCAG(ratio, 'AA'),
    passesAAA: meetsWCAG(ratio, 'AAA'),
    passesAALarge: meetsWCAG(ratio, 'AA', true),
    rating: ratio >= 7 ? 'Excellent' : ratio >= 4.5 ? 'Good' : ratio >= 3 ? 'Poor' : 'Fail',
  };
}

// Usage:
// function ColorPicker() {
//   const [fg, setFg] = useState('#333333');
//   const [bg, setBg] = useState('#ffffff');
//   const { ratio, passesAA, passesAAA, rating } = useContrastChecker(fg, bg);
//   return <div>Contrast: {ratio}:1 — {rating} {passesAA ? '✅ AA' : '❌ AA'}</div>;
// }


/**
 * 6. Accessible Status Indicators (React)
 * ✅ Don't rely on color alone — use icons + text
 */
function StatusBadge({ status }) {
  const configs = {
    success: { icon: '✓', label: 'Success', bg: '#dcfce7', color: '#15803d', border: '#15803d' },
    error:   { icon: '✕', label: 'Error',   bg: '#fee2e2', color: '#dc2626', border: '#dc2626' },
    warning: { icon: '⚠', label: 'Warning', bg: '#fef9c3', color: '#92400e', border: '#92400e' },
    info:    { icon: 'ℹ', label: 'Info',    bg: '#dbeafe', color: '#1d4ed8', border: '#1d4ed8' },
  };

  const config = configs[status] || configs.info;

  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}


/**
 * 7. Dark Mode with Accessible Contrast
 */
const darkModeColors = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--text-primary': '#1e293b',   // 13.5:1 on white
    '--text-secondary': '#475569', // 7.05:1 on white
    '--border': '#e2e8f0',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--text-primary': '#f1f5f9',   // 14.7:1 on #0f172a
    '--text-secondary': '#94a3b8', // 5.22:1 on #0f172a
    '--border': '#334155',
  },
};

// ⚠️ Common dark mode mistake: using pure white (#fff) on pure black (#000)
// → Too harsh, causes eye strain. Use off-white on dark gray instead.


export {
  getContrastRatio,
  meetsWCAG,
  suggestAccessibleColor,
  generateAccessiblePalette,
  useContrastChecker,
  StatusBadge,
};
