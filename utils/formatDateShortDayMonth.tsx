export const formatDateShortDayMonth = (dateString: string | number, options?: Intl.DateTimeFormatOptions) => {
  const date = new Date(dateString);
  const _options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  } as any;
  return date.toLocaleDateString('es-ES', options || _options);
};

/**
 * Formats a date for use as a note title
 * Output format: "Enero 8, 2026 - 2:30 PM"
 */
export const formatNoteTitleDate = (date = new Date()): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleDateString('es-ES', options).replace(',', ' -');
};