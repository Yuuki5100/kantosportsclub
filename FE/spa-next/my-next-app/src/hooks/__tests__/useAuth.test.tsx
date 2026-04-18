import { expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../../store';
import { useAuth } from '../useAuth';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => mockRouter);

const AuthDisplay = () => {
  const { isAuthenticated } = useAuth();
  return <div data-testid="auth-state">{String(isAuthenticated)}</div>;
};

describe('useAuth hook via component', () => {
  it('should return initial authentication state as "null"', () => {
    render(
      <Provider store={store}>
        <AuthDisplay />
      </Provider>
    );
    expect(screen.getByTestId('auth-state')).toHaveTextContent('null');
  });
});
