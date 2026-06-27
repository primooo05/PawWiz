import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/NotFound.js';

describe('NotFound Page', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the NotFound component when navigating to an undefined route', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', { name: /page not found/i });
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('Page not found');

    const description = screen.getByText(
      /sorry, the page you're looking for doesn't exist or has been moved/i
    );
    expect(description).not.toBeNull();
  });

  it('renders a "Back to Home" link that navigates to /', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /back to home/i });
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/');
  });
});
