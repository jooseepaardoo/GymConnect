import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : date.toDate();

  if (isToday(dateObj)) {
    return format(dateObj, "'Hoy a las' HH:mm", { locale: es });
  }

  if (isYesterday(dateObj)) {
    return format(dateObj, "'Ayer a las' HH:mm", { locale: es });
  }

  return format(dateObj, "d 'de' MMMM 'a las' HH:mm", { locale: es });
};

export const formatTimeAgo = (date) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : date.toDate();
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
};

export const getTimeSlots = () => {
  return {
    mañana: {
      start: '06:00',
      end: '12:00',
    },
    tarde: {
      start: '12:00',
      end: '18:00',
    },
    noche: {
      start: '18:00',
      end: '23:00',
    },
  };
};

export const isWithinTimeSlot = (timeSlot, currentTime = new Date()) => {
  const slots = getTimeSlots();
  const slot = slots[timeSlot];
  
  if (!slot) return false;

  const [startHour, startMinute] = slot.start.split(':').map(Number);
  const [endHour, endMinute] = slot.end.split(':').map(Number);
  
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  
  const current = currentHour * 60 + currentMinute;
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  
  return current >= start && current <= end;
};

export const getAvailabilityStatus = (lastActive) => {
  if (!lastActive) return 'offline';

  const lastActiveDate = lastActive instanceof Date ? lastActive : lastActive.toDate();
  const now = new Date();
  const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));

  if (diffInMinutes < 5) {
    return 'online';
  } else if (diffInMinutes < 30) {
    return 'away';
  } else {
    return 'offline';
  }
};

export const formatSchedule = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) return '';

  const timeSlots = schedule.map(slot => {
    const { start, end } = getTimeSlots()[slot];
    return `${slot} (${start} - ${end})`;
  });

  return timeSlots.join(', ');
};