export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};