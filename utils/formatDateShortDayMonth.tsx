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
