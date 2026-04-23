import { describe, it, expect, vi } from 'vitest';

// Mock framer-motion to avoid JSX transform issues in test
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    p: 'p',
    span: 'span',
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Frontend Smoke Test', () => {
  it('should confirm vitest is configured for frontend workspace', () => {
    expect(true).toBe(true);
  });

  it('should be able to import React', async () => {
    const React = await import('react');
    expect(React).toBeDefined();
    expect(React.useState).toBeDefined();
  });
});
