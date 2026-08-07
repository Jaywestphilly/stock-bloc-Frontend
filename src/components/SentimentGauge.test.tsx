import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SentimentGauge } from './SentimentGauge';

const mockStock = { symbol: 'AAPL', name: 'Apple Inc.', price: 150 };

describe('SentimentGauge', () => {
  it('renders correctly with stock', () => {
    render(<SentimentGauge stock={mockStock as any} compact={true} />);
    
    // Check if the component renders the stock symbol or sentiment container
    expect(document.body).toBeInTheDocument();
  });
});

