import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NewsHub } from './NewsHub';

describe('NewsHub component', () => {
  it('renders intelligence feed header and filters', () => {
    render(<NewsHub />);
    expect(screen.getAllByText(/ALL FEEDS/i).length).toBeGreaterThan(0);
  });
});

