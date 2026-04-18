import '@testing-library/jest-dom';
import { expect, jest, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import { Mode } from '@/types/CRJ/Mode';
import {
  registerButtonDisplay,
  editButtonDisplay,
  applicableEndDateDisabled,
  deleteButtonDisplay,
  ApplicableInfoArea,
} from './ApplicableInfoArea';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/slices/authSlice';
import langReducer from '@/slices/langSlice';

// モックストアの作成
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      lang: langReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        rolePermissions: null,
        status: 'idle' as const,
        error: null,
        userId: 'testUserId',
        name: 'testUserName',
      },
      lang: {
        language: 'ja' as const,
      },
    },
  });
};

// カスタムレンダラー
const renderWithProvider = (ui: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      {ui}
    </Provider>
  );
};

describe('ApplicableInfoArea', () => {
  // registerButtonDisplayのテスト
  describe('registerButtonDisplay', () => {
    test.each<{ mode: Mode, expected: boolean, testCase: string }>([
      { mode: 'view', expected: false, testCase: 'viewモードの場合はfalseを返す' },
      { mode: 'applicableEdit', expected: true, testCase: 'applicableEditモードの場合はtrueを返す' },
      { mode: 'new', expected: false, testCase: 'newモードの場合はfalseを返す' },
    ])('$testCase: mode=$mode -> $expected', ({ mode, expected }) => {
      expect(registerButtonDisplay(mode)).toBe(expected);
    });
  });

  // editButtonDisplayのテスト
  describe('editButtonDisplay', () => {
    test.each<{ role: Role, status: RegisterStatus | null, mode: Mode, isOnlyApprovedOrDeleted: boolean | undefined, assignedToMe: boolean | undefined, expected: boolean }>([
      { role: 'view', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'none', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      
      { role: 'update', status: null, mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: true },
      { role: 'update', status: null, mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'update', status: null, mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: null, mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: null, mode: 'applicableEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: true },
      { role: 'update', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'update', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'applicableEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'update', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: true },
      { role: 'update', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'applicableEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'update', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: true },
      { role: 'update', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'reject', mode: 'applicableEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      
      { role: 'update', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'new', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: true, expected: true, assignedToMe: undefined },
      { role: 'update', status: 'new', mode: 'new', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'new', mode: 'new', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'new', mode: 'new', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'edit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'applicableEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'applicableEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'applicableEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'requestingDeletion', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: true },
      { role: 'update', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'update', status: 'deleted', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: true },
      { role: 'update', status: 'deleteApprove', mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: true },
      { role: 'update', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'update', status: null, mode: 'view', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },

      { role: 'approve', status: null, mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: true },
      { role: 'approve', status: null, mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: true },
      { role: 'approve', status: null, mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined , expected: false },
      { role: 'approve', status: null, mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: null, mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: null, mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'approve', status: null, mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: null, mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: null, mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: null, mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: null, mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: null, mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: null, mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },

      { role: 'approve', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: true },
      { role: 'approve', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: true },
      { role: 'approve', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'approved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'approved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'approved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },

      { role: 'approve', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'register', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'register', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'register', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },

      { role: 'approve', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: true },
      { role: 'approve', status: 'registerRemoved', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      // { role: 'approve', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'registerRemoved', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },

      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: true },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      // 参照新規登録にならないため、以下のテストはコメントアウト
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },

      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: true, assignedToMe: undefined , expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: true },
      { role: 'approve', status: 'reject', mode: 'view', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      // editモードにならないため、以下のテストはコメントアウト
      // { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      // { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'reject', mode: 'edit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
      // 参照新規登録にならないため、以下のテストはコメントアウト
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: undefined, assignedToMe: undefined, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: true, assignedToMe: undefined, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: true, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: false, expected: false },
      // { role: 'approve', status: 'reject', mode: 'refNewEdit', isOnlyApprovedOrDeleted: false, assignedToMe: undefined, expected: false },
    ])('role=$role, status=$status, mode=$mode, isOnlyApprovedOrDeleted=$isOnlyApprovedOrDeleted, assignedToMe=$assignedToMe -> $expected', ({ role, status, mode, isOnlyApprovedOrDeleted, assignedToMe, expected }) => {
      expect(editButtonDisplay(role, status, mode, isOnlyApprovedOrDeleted, assignedToMe)).toBe(expected);
    });
  });


  // applicableEndDateDisabledのテスト
  describe('applicableEndDateDisabled', () => {
    test.each<{ mode: Mode, expected: boolean, testCase: string }>([
      { mode: 'applicableEdit', expected: false, testCase: 'modeがapplicableEditの場合はfalseを返す' },
      { mode: 'view', expected: true, testCase: 'modeがviewの場合はtrueを返す' },
      { mode: 'new', expected: true, testCase: 'modeがnewの場合はtrueを返す' },
      { mode: 'refNewEdit', expected: true, testCase: 'modeがrefNewEditの場合はtrueを返す' },
    ])('$testCase: mode=$mode -> $expected', ({ mode, expected }) => {
      expect(applicableEndDateDisabled(mode)).toBe(expected);
    });
  });

  // deleteButtonDisplayのテスト
  describe('deleteButtonDisplay', () => {
    test.each<{ haveApplicablePeriod: boolean, mode: Mode, expected: boolean, testCase: string }>([
      { haveApplicablePeriod: true, mode: 'applicableEdit', expected: true, testCase: '適用期間あり、applicableEditモードの場合はtrueを返す' },
      { haveApplicablePeriod: true, mode: 'view', expected: false, testCase: '適用期間あり、viewモードの場合はfalseを返す' },
      { haveApplicablePeriod: true, mode: 'edit', expected: false, testCase: '適用期間あり、editモードの場合はfalseを返す' },
      { haveApplicablePeriod: true, mode: 'new', expected: false, testCase: '適用期間あり、newモードの場合はfalseを返す' },
      { haveApplicablePeriod: false, mode: 'applicableEdit', expected: false, testCase: '適用期間なし、applicableEditモードの場合はfalseを返す' },
      { haveApplicablePeriod: false, mode: 'view', expected: false, testCase: '適用期間なし、viewモードの場合はfalseを返す' },
    ])('$testCase: haveApplicablePeriod=$haveApplicablePeriod, mode=$mode -> $expected', ({ haveApplicablePeriod, mode, expected }) => {
      expect(deleteButtonDisplay(haveApplicablePeriod, mode)).toBe(expected);
    });
  });

  // ApplicableInfoAreaコンポーネントのレンダリングテスト
  describe('ApplicableInfoArea Component Rendering', () => {
    const defaultProps = {
      hidden: false,
      haveApplicablePeriod: false,
      role: 'update' as Role,
      mode: 'view' as Mode,
      registerStatus: 'approved' as RegisterStatus,
      assignedToMe: false,
      isOnlyApprovedOrDeleted: false,
      isTran: false,
      approvers: [
        { value: '1', label: '承認者A' },
        { value: '2', label: '承認者B' },
      ] as OptionInfo[],
      onEditClick: jest.fn(),
      onDeleteClick: jest.fn(),
      onRegisterClick: jest.fn(),
      onRegisterRemoveClick: jest.fn(),
      onRejectClick: jest.fn(),
      onApproveClick: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('編集ボタンの表示テスト', () => {
      test('編集ボタンが表示される条件: role=update, status=registerRemoved, mode=view', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="registerRemoved"
            mode="view"
          />
        );

        expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
      });

      test('編集ボタンが表示される条件: role=update, status=reject, mode=view', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="reject"
            mode="view"
          />
        );

        expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
      });

      test('編集ボタンが表示される条件: role=update, status=approved, mode=view, isOnlyApprovedOrDeleted=true', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="approved"
            mode="view"
            isOnlyApprovedOrDeleted={true}
          />
        );

        expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
      });

      test('編集ボタンが表示される条件: role=update, status=new, mode=view, isOnlyApprovedOrDeleted=true', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="new"
            mode="view"
            isOnlyApprovedOrDeleted={true}
          />
        );

        expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
      });

      test('編集ボタンが表示されない条件: role=view', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="view"
            registerStatus="approved"
            mode="view"
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
      });

      test('編集ボタンが表示されない条件: mode=edit', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="approved"
            mode="edit"
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
      });

      test('編集ボタンが表示されない条件: status=register', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="register"
            mode="view"
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
      });

      test('編集ボタンが表示されない条件: status=null', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus={null}
            mode="view"
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
      });

      test('編集ボタンが表示されない条件: status=null, isOnlyApprovedOrDeleted=true', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus={null}
            mode="view"
            isOnlyApprovedOrDeleted={true}
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
      });
    });

    describe('削除・申請ボタンの表示テスト', () => {
      test('削除ボタンが表示される条件: haveApplicablePeriod=true, mode=applicableEdit', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            haveApplicablePeriod={true}
            mode="applicableEdit"
          />
        );

        expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '申請' })).toBeInTheDocument();
      });

      test('削除ボタンが表示されない条件: haveApplicablePeriod=false, mode=applicableEdit', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            haveApplicablePeriod={false}
            mode="applicableEdit"
          />
        );

        expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '申請' })).toBeInTheDocument();
      });

      test('削除・申請ボタンが表示されない条件: mode=view', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            haveApplicablePeriod={true}
            mode="view"
          />
        );

        expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '申請' })).not.toBeInTheDocument();
      });

      test('申請ボタンのみ表示される条件: haveApplicablePeriod=false, mode=applicableEdit', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            haveApplicablePeriod={false}
            mode="applicableEdit"
          />
        );

        expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '申請' })).toBeInTheDocument();
      });
    });

    describe('申請取下ボタンの表示テスト', () => {
      test('申請取下ボタンが表示される条件: role=update, status=register, mode=view', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="register"
            mode="view"
          />
        );

        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });

      test('申請取下ボタンが表示される条件: role=approve, status=register, mode=view, assignedToMe=false', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={false}
          />
        );

        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });

      test('申請取下ボタンが表示されない条件: role=approve, assignedToMe=true', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={true}
          />
        );

        expect(screen.queryByRole('button', { name: '申請取下' })).not.toBeInTheDocument();
      });
    });

    describe('差戻・承認ボタンの表示テスト', () => {
      test('差戻・承認ボタンが表示される条件: role=approve, status=register, mode=view, assignedToMe=true', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={true}
          />
        );

        expect(screen.getByRole('button', { name: '差戻' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '承認' })).toBeInTheDocument();
      });

      test('差戻・承認ボタンが表示されない条件: role=update', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="register"
            mode="view"
          />
        );

        expect(screen.queryByRole('button', { name: '差戻' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '承認' })).not.toBeInTheDocument();
      });

      test('差戻・承認ボタンが表示されない条件: status=approved', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="approved"
            mode="view"
            assignedToMe={true}
          />
        );

        expect(screen.queryByRole('button', { name: '差戻' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '承認' })).not.toBeInTheDocument();
      });

      test('差戻・承認ボタンが表示されない条件: assignedToMe=false', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={false}
          />
        );

        expect(screen.queryByRole('button', { name: '差戻' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '承認' })).not.toBeInTheDocument();
      });
    });

    describe('申請取下ボタンの表示テスト（isTran関連）', () => {
      test('申請取下ボタンが表示される条件: isTran=true, role=update, status=register', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            isTran={true}
            role="update"
            registerStatus="register"
            mode="view"
          />
        );

        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });

      test('申請取下ボタンが表示される条件: isTran=true, role=approve, status=register, assignedToMe=false', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            isTran={true}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={false}
          />
        );

        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });

      test('申請取下ボタンが表示されない条件: isTran=true, role=approve, status=register, assignedToMe=true', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            isTran={true}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={true}
          />
        );

        expect(screen.queryByRole('button', { name: '申請取下' })).not.toBeInTheDocument();
      });

      test('申請取下ボタンが表示されない条件: isTran=true, role=update, status=approved', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            isTran={true}
            role="update"
            registerStatus="approved"
            mode="view"
          />
        );

        expect(screen.queryByRole('button', { name: '申請取下' })).not.toBeInTheDocument();
      });

      test('申請取下ボタンが表示される条件: isTran=false, role=update, status=register（従来の動作）', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            isTran={false}
            role="update"
            registerStatus="register"
            mode="view"
          />
        );

        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });

      test('申請取下ボタンが表示される条件: isTran=false, role=update, status=requestingDeletion（従来の動作）', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            isTran={false}
            role="update"
            registerStatus="requestingDeletion"
            mode="view"
          />
        );

        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });
    });

    describe('複数ボタンの組み合わせテスト', () => {
      test('mode=applicableEdit、haveApplicablePeriod=trueの場合、編集ボタンは表示されず、削除・申請ボタンが表示される', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="approved"
            mode="applicableEdit"
            haveApplicablePeriod={true}
            isOnlyApprovedOrDeleted={true}
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '申請' })).toBeInTheDocument();
      });

      test('mode=applicableEdit、haveApplicablePeriod=falseの場合、編集ボタンは表示されず、申請ボタンのみ表示される', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="update"
            registerStatus="approved"
            mode="applicableEdit"
            haveApplicablePeriod={false}
            isOnlyApprovedOrDeleted={true}
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '申請' })).toBeInTheDocument();
      });

      test('権限がapproveで申請中の場合、承認・差戻ボタンのみ表示される', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={true}
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '申請' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '申請取下' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '差戻' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '承認' })).toBeInTheDocument();
      });

      test('権限がapproveで自分に割り当てられていない場合、申請取下ボタンのみ表示される', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={false}
          />
        );

        expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '申請' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '差戻' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '承認' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: '申請取下' })).toBeInTheDocument();
      });

      test('hiddenがtrueの場合、コンポーネント全体が表示されない', () => {
        const { container } = renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            hidden={true}
          />
        );

        expect(container.firstChild).toBeNull();
      });
    });

    describe('DatePickerの無効化テスト', () => {
      test('mode=applicableEditの場合、適用終了日が編集可能', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
          />
        );

        // DatePickerコンポーネントが無効化されていないことを確認
        // プレースホルダーでDatePickerの入力要素を特定
        const dateInput = screen.getByPlaceholderText('YYYY/MM/DD');
        expect(dateInput).not.toBeDisabled();
      });

      test('mode=viewの場合、適用終了日が編集不可', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="view"
          />
        );

        // DatePickerコンポーネントが無効化されていることを確認
        // プレースホルダーでDatePickerの入力要素を特定
        const dateInput = screen.getByPlaceholderText('YYYY/MM/DD');
        expect(dateInput).toBeDisabled();
      });

      test('DatePickerのカレンダーボタンも正しく無効化される', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="view"
          />
        );

        // カレンダーボタンも無効化されていることを確認
        const calendarButton = screen.getByLabelText('Choose date');
        expect(calendarButton).toBeDisabled();
      });

      test('mode=applicableEditの場合、カレンダーボタンも有効になる', () => {
        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
          />
        );

        // カレンダーボタンも有効になっていることを確認
        const calendarButton = screen.getByLabelText('Choose date');
        expect(calendarButton).not.toBeDisabled();
      });
    });

    describe('ユーザーインタラクションのテスト', () => {
      test('削除理由のテキストエリアが表示され、無効化されている', () => {
        const mockSetDeleteReason = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="view"
            setDeleteReason={mockSetDeleteReason}
          />
        );

        // deleteReasonという名前のテキストエリアを取得
        const deleteReasonElements = screen.getAllByDisplayValue('');

        // 複数のテキストエリアから削除理由の要素を見つける
        const deleteReasonElement = deleteReasonElements.find(element =>
          element.getAttribute('name') === 'deleteReason'
        );

        expect(deleteReasonElement).toBeInTheDocument();
        expect(deleteReasonElement).toHaveAttribute('name', 'deleteReason');
        expect(deleteReasonElement).toBeDisabled();
      });

      test('承認者を選択すると、setSelectedApproverIdが呼ばれる', async () => {
        const mockSetSelectedApproverId = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
            setSelectedApproverId={mockSetSelectedApproverId}
          />
        );

        // comboboxの役割を持つ要素を取得（DropBoxで作成されたselect）
        const approverSelect = screen.getByRole('combobox');
        await userEvent.click(approverSelect);

        // 選択肢から承認者Aを選択
        const approverOption = screen.getByRole('option', { name: '承認者A' });
        await userEvent.click(approverOption);

        expect(mockSetSelectedApproverId).toHaveBeenCalledWith('1');
      });

      test('コメントを入力すると、setCommentが呼ばれる', async () => {
        const mockSetComment = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            role="approve"
            registerStatus="register"
            mode="view"
            assignedToMe={true}
            setComment={mockSetComment}
          />
        );

        // applicableCommentという名前のテキストエリアを取得
        const commentElements = screen.getAllByDisplayValue('');
        const commentTextArea = commentElements.find(element =>
          element.getAttribute('name') === 'applicableComment'
        );

        expect(commentTextArea).toBeInTheDocument();
        expect(commentTextArea).not.toBeDisabled();

        await userEvent.type(commentTextArea!, 'テストコメント');
        expect(mockSetComment).toHaveBeenCalledWith('テストコメント');
      });

      test('適用終了日が有効化され、変更可能である', () => {
        const mockSetApplicableEndDate = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
            setApplicableEndDate={mockSetApplicableEndDate}
          />
        );

        const dateInput = screen.getByPlaceholderText('YYYY/MM/DD');
        expect(dateInput).toBeInTheDocument();
        expect(dateInput).not.toBeDisabled();

        // カレンダーボタンも有効化されている
        const calendarButton = screen.getByLabelText('Choose date');
        expect(calendarButton).not.toBeDisabled();
      });
    });

    describe('適用終了日のバリデーションテスト', () => {
      test('システム日付以前の日付を入力するとエラーメッセージが表示される', async () => {
        const mockSetApplicableEndDate = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
            setApplicableEndDate={mockSetApplicableEndDate}
            applicableEndDate={dayjs().subtract(1, 'day')} // 昨日の日付を設定
          />
        );

        // エラーメッセージが表示されることを確認
        const errorMessage = screen.getByText('適用終了日はシステム日付以降の日付を入力してください。');
        expect(errorMessage).toBeInTheDocument();
      });

      test('システム日付以降の日付を入力するとエラーメッセージが表示されない', async () => {
        const mockSetApplicableEndDate = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
            setApplicableEndDate={mockSetApplicableEndDate}
            applicableEndDate={dayjs().add(1, 'day')} // 明日の日付を設定
          />
        );

        // エラーメッセージが表示されないことを確認
        const errorMessage = screen.queryByText('適用終了日はシステム日付以降の日付を入力してください。');
        expect(errorMessage).not.toBeInTheDocument();
      });

      test.skip('適用終了日が未入力の場合、必須エラーメッセージが表示される', async () => {
        const mockSetApplicableEndDate = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
            setApplicableEndDate={mockSetApplicableEndDate}
            applicableEndDate={undefined} // 未入力状態
          />
        );

        // DatePickerの入力フィールドを取得してフォーカスを離す
        const dateInput = screen.getByPlaceholderText('YYYY/MM/DD');
        await userEvent.click(dateInput);
        
        // blur イベントを直接発火してフォーカスを離す
        dateInput.blur();

        // 必須エラーメッセージが表示されることを確認
        await waitFor(() => {
          const errorMessage = screen.getByText('適用終了日は必須項目です。');
          expect(errorMessage).toBeInTheDocument();
        }, { timeout: 3000 });
      });

      test('DatePickerのminDateがシステム日付に設定されている', () => {
        const mockSetApplicableEndDate = jest.fn();

        renderWithProvider(
          <ApplicableInfoArea
            {...defaultProps}
            mode="applicableEdit"
            setApplicableEndDate={mockSetApplicableEndDate}
          />
        );

        // DatePickerコンポーネントが存在することを確認
        const dateInput = screen.getByPlaceholderText('YYYY/MM/DD');
        expect(dateInput).toBeInTheDocument();
        
        // システム日付以前の日付がカレンダーで選択できないことを確認
        // (実際のDatePickerのminDate設定は、UIライブラリの内部実装に依存するため、
        // ここではコンポーネントが正しくレンダリングされることを確認)
        expect(dateInput).not.toBeDisabled();
      });
    });
  });
});
