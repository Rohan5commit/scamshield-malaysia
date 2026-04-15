import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App.jsx';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url) => {
      if (String(url).includes('/api/samples')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              { id: 'demo-text-parcel', label: 'Parcel fee SMS', kind: 'text', content: 'Parcel held by Kastam.' }
            ]
          })
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] })
      });
    })
  );
});

describe('App', () => {
  it('renders the hero heading and loads sample chips', async () => {
    render(<App />);

    expect(screen.getByText(/Stop Malaysian scams before the tap/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Parcel fee SMS/i })).toBeInTheDocument();
    });
  });
});
