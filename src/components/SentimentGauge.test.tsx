import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SentimentGauge } from './SentimentGauge';

const mockStock = { symbol: 'AAPL', name: 'Apple Inc.', price: 150 };

describe('SentimentGauge', () => {
  it('renders correctly with stock', async () => {
    await act(async () => {
      render(<SentimentGauge stock={mockStock as any} compact={true} />);
    });
    
    // Check if the component renders the stock symbol or gauge
    // In compact mode, it might render NEUTRAL initially if cache is empty
    expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
  });
});
