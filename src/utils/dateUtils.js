import dayjs from 'dayjs';

export const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatTime = (time) => {
  return dayjs(time, 'HH:mm').format('HH:mm');
};

export const isDateAvailable = (date) => {
  const today = dayjs();
  const selectedDate = dayjs(date);
  return selectedDate.isAfter(today) || selectedDate.isSame(today, 'day');
};