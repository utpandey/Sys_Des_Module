import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button.jsx';

describe('Button Component', () => {
  describe('rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render with different variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByTestId('button')).toHaveClass('bg-blue-500');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByTestId('button')).toHaveClass('bg-gray-500');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByTestId('button')).toHaveClass('bg-red-500');
    });

    it('should show loading state', () => {
      render(<Button loading>Click me</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>);
      expect(screen.getByTestId('button')).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByTestId('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);
      
      fireEvent.click(screen.getByTestId('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Click me</Button>);
      
      fireEvent.click(screen.getByTestId('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
