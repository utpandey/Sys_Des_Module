/**
 * Session Storage - Vanilla JS & React Examples
 */

/* ============================================
   VANILLA JS EXAMPLES
   ============================================ */

/**
 * 1. Multi-step form state preservation
 * 
 * ✅ Perfect use case: Survives refresh, clears on tab close
 */
class FormWizard {
  constructor(formId) {
    this.storageKey = `wizard_${formId}`;
  }

  saveStep(stepNumber, data) {
    try {
      const current = this.getAllData();
      current[`step_${stepNumber}`] = data;
      current.__lastStep = stepNumber;
      current.__lastUpdated = Date.now();
      sessionStorage.setItem(this.storageKey, JSON.stringify(current));
    } catch (error) {
      console.error('Failed to save form step:', error);
    }
  }

  getStep(stepNumber) {
    const data = this.getAllData();
    return data[`step_${stepNumber}`] || null;
  }

  getAllData() {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  getLastStep() {
    return this.getAllData().__lastStep || 0;
  }

  clear() {
    sessionStorage.removeItem(this.storageKey);
  }
}

// Usage:
// const wizard = new FormWizard('checkout');
// wizard.saveStep(1, { name: 'John', email: 'john@example.com' });
// wizard.saveStep(2, { address: '123 Main St' });
// wizard.getLastStep(); // 2 (resume from here after refresh)


/**
 * 2. One-time notification/banner per session
 */
function showOncePerSession(bannerId, showCallback) {
  const key = `banner_dismissed_${bannerId}`;
  
  if (!sessionStorage.getItem(key)) {
    showCallback();
    return {
      dismiss: () => sessionStorage.setItem(key, 'true')
    };
  }
  
  return { dismiss: () => {} };
}

// Usage:
// showOncePerSession('promo-2024', () => {
//   document.getElementById('promo').style.display = 'block';
// }).dismiss(); // Call when user clicks X


/**
 * 3. Scroll position restoration
 */
function saveScrollPosition(pageId) {
  const key = `scroll_${pageId}`;
  
  // Save on scroll (debounced)
  let timer;
  window.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      sessionStorage.setItem(key, JSON.stringify({
        x: window.scrollX,
        y: window.scrollY
      }));
    }, 100);
  }, { passive: true });

  // Restore on load
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved) {
      requestAnimationFrame(() => {
        window.scrollTo(saved.x, saved.y);
      });
    }
  } catch {}
}


/**
 * 4. Tab-specific filters/view state
 */
const tabState = {
  save(key, state) {
    try {
      sessionStorage.setItem(`tab_${key}`, JSON.stringify(state));
    } catch {}
  },
  
  load(key, defaultState = {}) {
    try {
      const raw = sessionStorage.getItem(`tab_${key}`);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  }
};

// Different tabs can have different filter states:
// Tab 1: tabState.save('filters', { category: 'electronics', sort: 'price' });
// Tab 2: tabState.save('filters', { category: 'books', sort: 'rating' });


/* ============================================
   REACT EXAMPLES
   ============================================ */

/**
 * 5. useSessionStorage Hook
 */
function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = React.useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }, [key, storedValue]);

  const remove = React.useCallback(() => {
    window.sessionStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}


/**
 * 6. Multi-step Form Hook (React)
 */
function useFormWizard(formId, totalSteps) {
  const storageKey = `wizard_${formId}`;

  const [formData, setFormData] = React.useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [currentStep, setCurrentStep] = React.useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = sessionStorage.getItem(storageKey);
      const data = raw ? JSON.parse(raw) : {};
      return data.__currentStep || 0;
    } catch {
      return 0;
    }
  });

  // Persist to sessionStorage on every change
  React.useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        ...formData,
        __currentStep: currentStep
      }));
    } catch {}
  }, [formData, currentStep, storageKey]);

  const updateStep = React.useCallback((stepData) => {
    setFormData(prev => ({
      ...prev,
      [`step_${currentStep}`]: stepData
    }));
  }, [currentStep]);

  const nextStep = React.useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = React.useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = React.useCallback(() => {
    setFormData({});
    setCurrentStep(0);
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    formData,
    currentStep,
    updateStep,
    nextStep,
    prevStep,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1
  };
}

// Usage:
// function CheckoutForm() {
//   const { formData, currentStep, updateStep, nextStep, prevStep, reset } = useFormWizard('checkout', 3);
//   // Render step based on currentStep
//   // User refreshes → resumes where they left off
//   // User closes tab → starts fresh
// }


console.log('See README.md for documentation');
