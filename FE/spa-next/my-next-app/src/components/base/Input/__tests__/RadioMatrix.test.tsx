import { expect, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import RadioMatrix from '@components/base/Input/RadioMatrix';

describe('RadioMatrix', () => {
  const mockOptions = [
    { label: 'Option A', value: 'A', disabled: false },
    { label: 'Option B', value: 'B', disabled: false },
    { label: 'Option C', value: 'C', disabled: true },
  ];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all options correctly', () => {
    render(<RadioMatrix options={mockOptions} selectedValue="A" />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('applies selected styles correctly', () => {
    render(<RadioMatrix options={mockOptions} selectedValue="B" />);
    const selectedRadio = screen.getByRole('radio', { name: 'Option B' });
    expect(selectedRadio).toBeChecked();
  });

  it('does not call onChange for disabled options', () => {
    const onChange = jest.fn();
    render(<RadioMatrix options={mockOptions} selectedValue="A" onChange={onChange} />);
    const disabledOption = screen.getByRole('radio', { name: 'Option C' });
    fireEvent.click(disabledOption);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange when an enabled option is clicked', () => {
    const onChange = jest.fn();
    render(<RadioMatrix options={mockOptions} selectedValue="A" onChange={onChange} />);
    const clickable = screen.getByRole('radio', { name: 'Option B' });
    fireEvent.click(clickable);
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('triggers onChange with keyboard (Enter)', () => {
    const onChange = jest.fn();
    render(<RadioMatrix options={mockOptions} selectedValue="A" onChange={onChange} />);
    const target = screen.getByRole('radio', { name: 'Option B' });
    target.focus();
    fireEvent.keyDown(target, { key: 'Enter', code: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('triggers onChange with keyboard (Space)', () => {
    const onChange = jest.fn();
    render(<RadioMatrix options={mockOptions} selectedValue="A" onChange={onChange} />);
    const target = screen.getByRole('radio', { name: 'Option B' });
    target.focus();
    fireEvent.keyDown(target, { key: ' ', code: 'Space' });
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('does not emit a DOM nesting warning on render', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RadioMatrix options={mockOptions} selectedValue="A" />);

    const hasDomNestingWarning = consoleErrorSpy.mock.calls.some((call) =>
      call.some((value) => String(value).includes('validateDOMNesting'))
    );
    expect(hasDomNestingWarning).toBe(false);
  });
});
