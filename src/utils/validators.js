// Funções utilitárias para validação de formulários

// Valida formato de email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Valida formato de telefone brasileiro (XX) XXXXX-XXXX
export const validatePhone = (phone) => {
  const re = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return re.test(phone);
};

// Valida se senha tem pelo menos 6 caracteres
export const validatePassword = (password) => {
  return password.length >= 6;
};