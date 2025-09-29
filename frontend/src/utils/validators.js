// Funções utilitárias para validação de formulários

// Valida formato de email
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Valida formato de telefone brasileiro (XX) XXXXX-XXXX
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const re = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return re.test(phone);
};

// Valida se senha tem pelo menos 6 caracteres
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};