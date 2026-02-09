import React from 'react';

/**
 * Button component for integration testing examples
 */
export function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  loading = false 
}) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-testid="button"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
