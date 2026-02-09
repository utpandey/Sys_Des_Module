import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateEmail,
  formatCurrency,
  debounce,
  fetchUserData,
  calculateTotalWithTax
} from './utils.js';

describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('user123@test-domain.com')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(123)).toBe(false);
    expect(validateEmail({})).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
    expect(formatCurrency(100, 'GBP')).toBe('£100.00');
  });

  it('should throw error for invalid amount', () => {
    expect(() => formatCurrency('invalid')).toThrow('Amount must be a valid number');
    expect(() => formatCurrency(NaN)).toThrow('Amount must be a valid number');
    expect(() => formatCurrency(null)).toThrow('Amount must be a valid number');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay function execution', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous calls', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    vi.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments correctly', () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should throw error for invalid function', () => {
    expect(() => debounce(null, 100)).toThrow('First argument must be a function');
    expect(() => debounce('not a function', 100)).toThrow('First argument must be a function');
  });

  it('should throw error for invalid wait time', () => {
    const func = vi.fn();
    expect(() => debounce(func, -1)).toThrow('Wait must be a non-negative number');
    expect(() => debounce(func, 'invalid')).toThrow('Wait must be a non-negative number');
  });
});

describe('fetchUserData', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch user data successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    const result = await fetchUserData(1);
    expect(result).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('should throw error for invalid user ID', async () => {
    await expect(fetchUserData(0)).rejects.toThrow('Invalid user ID');
    await expect(fetchUserData(-1)).rejects.toThrow('Invalid user ID');
    await expect(fetchUserData('invalid')).rejects.toThrow('Invalid user ID');
  });

  it('should throw error when API request fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    });

    await expect(fetchUserData(999)).rejects.toThrow('Failed to fetch user: Not Found');
  });
});

describe('calculateTotalWithTax', () => {
  it('should calculate total with default tax rate', () => {
    expect(calculateTotalWithTax(100)).toBe(110); // 10% tax
    expect(calculateTotalWithTax(50)).toBe(55);
  });

  it('should calculate total with custom tax rate', () => {
    expect(calculateTotalWithTax(100, 0.2)).toBe(120); // 20% tax
    expect(calculateTotalWithTax(100, 0)).toBe(100); // 0% tax
  });

  it('should throw error for invalid price', () => {
    expect(() => calculateTotalWithTax(-100)).toThrow('Price must be a non-negative number');
    expect(() => calculateTotalWithTax('invalid')).toThrow('Price must be a non-negative number');
  });

  it('should throw error for invalid tax rate', () => {
    expect(() => calculateTotalWithTax(100, -0.1)).toThrow('Tax rate must be between 0 and 1');
    expect(() => calculateTotalWithTax(100, 1.5)).toThrow('Tax rate must be between 0 and 1');
    expect(() => calculateTotalWithTax(100, 'invalid')).toThrow('Tax rate must be between 0 and 1');
  });
});
