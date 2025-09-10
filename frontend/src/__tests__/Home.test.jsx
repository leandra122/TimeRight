// Testes unitários para o componente Home
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import Home from '../pages/Home';

// Função helper para renderizar componente com providers necessários
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Suíte de testes para o componente Home
describe('Home Component', () => {
  // Testa se o título principal é renderizado
  test('renders main heading', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('La Belle Vie')).toBeInTheDocument();
  });

  // Testa se o botão CTA é renderizado
  test('renders CTA button', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Agende Agora')).toBeInTheDocument();
  });

  // Testa se a seção de serviços é renderizada
  test('renders services section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Nossos Serviços')).toBeInTheDocument();
  });
});