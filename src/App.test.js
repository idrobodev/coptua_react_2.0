import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app navigation', () => {
  render(<App />);
  const navElements = screen.getAllByText(/Inicio/i);
  expect(navElements.length).toBeGreaterThan(0);
});