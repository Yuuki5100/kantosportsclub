// components/input/__tests__/SelectBox.test.tsx
import { expect, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectBox from '../SelectBox';

// モックデータ
const mockOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('SelectBox', () => {
  it('renders options and checkboxes', () => {
    render(<SelectBox name="test" options={mockOptions} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('toggles checkbox when clicked', () => {
    render(<SelectBox name="test" options={mockOptions} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const checkboxA = checkboxes[0];

    expect(checkboxA).not.toBeChecked();
    fireEvent.click(screen.getByText('Option A'));
    expect(checkboxA).toBeChecked();
    fireEvent.click(screen.getByText('Option A'));
    expect(checkboxA).not.toBeChecked();
  });

  it('respects selectedValues prop', () => {
    render(<SelectBox name="test" options={mockOptions} selectedValues={['b']} />);
    const checkboxes = screen.getAllByRole('checkbox');
    const checkboxB = checkboxes[1];
    expect(checkboxB).toBeChecked();
  });

  it('calls onChange when option is toggled', () => {
    const handleChange = jest.fn();
    render(<SelectBox name="test" options={mockOptions} onChange={handleChange} />);

    fireEvent.click(screen.getByText('Option A'));
    expect(handleChange).toHaveBeenCalledWith(['a']);

    fireEvent.click(screen.getByText('Option B'));
    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('does not toggle disabled option', () => {
    const handleChange = jest.fn();
    render(<SelectBox name="test" options={mockOptions} onChange={handleChange} />);
    fireEvent.click(screen.getByText('Option C'));
    expect(handleChange).not.toHaveBeenCalledWith(['c']);
  });

  it('shows helper text when provided', () => {
    render(<SelectBox name="test" options={mockOptions} helperText="This is help" />);
    expect(screen.getByText('This is help')).toBeInTheDocument();
  });

  it('disables entire SelectBox when disabled=true', () => {
    render(<SelectBox name="test" options={mockOptions} disabled />);
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });
});
