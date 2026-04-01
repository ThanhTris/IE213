import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('renders home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const heading = screen.getByText(/BlockWarranty/i);
  expect(heading).toBeInTheDocument();
});
