// Funções utilitárias para manipulação de datas
import dayjs from 'dayjs';

// Formata data para padrão brasileiro DD/MM/YYYY
export const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

// Formata horário para HH:mm
export const formatTime = (time) => {
  return dayjs(time, 'HH:mm').format('HH:mm');
};

// Verifica se uma data está disponível (hoje ou no futuro)
export const isDateAvailable = (date) => {
  const today = dayjs();
  const selectedDate = dayjs(date);
  return selectedDate.isAfter(today) || selectedDate.isSame(today, 'day');
};