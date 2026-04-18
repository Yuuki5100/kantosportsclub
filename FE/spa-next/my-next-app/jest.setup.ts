/* eslint-disable */
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// jest.setup.ts
import fetch, { Request, Response, Headers } from 'cross-fetch';
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

class BroadcastChannelMock {
  name: string;
  onmessage: ((event: { data: any }) => void) | null;

  constructor(name: string) {
    this.name = name;
    this.onmessage = null;
  }

  postMessage(message: any): void {
    if (this.onmessage) {
      this.onmessage({ data: message });
    }
  }

  close(): void {}

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    // no-op
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    // no-op
  }
}

jest.mock('@/utils/sentry', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
  },
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// グローバルに型付きで代入
(globalThis as any).BroadcastChannel = BroadcastChannelMock;
