import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import Home from '../pages/Home';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  test('renders main heading', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('La Belle Vie')).toBeInTheDocument();
  });

  test('renders CTA button', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Agende Agora')).toBeInTheDocument();
  });

  test('renders services section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Nossos Serviços')).toBeInTheDocument();
  });
});