
export const formatTo12Hour = (time: string) => {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);

  const period = hour >= 12 ? "PM" : "AM";

  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
};