export const formatDateShortDayMonth = (dateString: string) => {
  const date = new Date(dateString);
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  } as any;
  return date.toLocaleDateString("es-ES", options);
};
