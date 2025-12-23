import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import App from './App';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders a health overview', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
        uptimeSeconds: 123,
        region: 'test-region',
        timestamp: new Date().toISOString(),
        dbStatus: 'ok',
      }),
    } as unknown as Response);

    render(<App />);

    const heading = await screen.findByRole('heading', { name: /customer health/i });
    expect(heading).toBeInTheDocument();
  });
});
