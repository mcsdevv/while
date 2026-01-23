/// <reference types="bun-types" />

declare module "bun:test" {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;

  export interface MockFunction<T = any, R = any> {
    (...args: T[]): R;
    mock: {
      calls: T[][];
      results: R[];
    };
  }

  export function mock<T = any, R = any>(implementation: (...args: T[]) => R): MockFunction<T, R>;

  export const mock: {
    module: (name: string, factory: () => Record<string, any>) => void;
  };
}
