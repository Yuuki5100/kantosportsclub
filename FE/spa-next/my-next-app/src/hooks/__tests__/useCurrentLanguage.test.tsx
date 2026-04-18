// src/hooks/__tests__/useCurrentLanguage.test.tsx
import { expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../../store';
import { useCurrentLanguage } from '../useCurrentLanguage';

import mockRouter from 'next-router-mock';
jest.mock('next/router', () => mockRouter);

// テスト用コンポーネント: useCurrentLanguage の値を表示し、ボタンで言語を変更する
const LangDisplay = () => {
  const { language, changeLanguage } = useCurrentLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <button data-testid="change-lang" onClick={() => changeLanguage('ja')}>
        Change to JA
      </button>
    </div>
  );
};

describe('useCurrentLanguage hook via component', () => {
  it('should return initial language', () => {
    render(
      <Provider store={store}>
        <LangDisplay />
      </Provider>
    );
    expect(screen.getByTestId('language').textContent).toBe('ja');
  });

  it('should change language', () => {
    render(
      <Provider store={store}>
        <LangDisplay />
      </Provider>
    );
    // ボタンをクリックして言語を変更
    fireEvent.click(screen.getByTestId('change-lang'));
    expect(screen.getByTestId('language').textContent).toBe('ja');
  });
});
