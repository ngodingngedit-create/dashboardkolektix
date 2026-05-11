export const formatPrice = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";
  const number = typeof value === "string" ? parseInt(value.replace(/\D/g, ""), 10) : value;
  if (isNaN(number)) return "";
  return number.toLocaleString("id-ID");
};

export const parsePrice = (value: string): number => {
  return parseInt(value.replace(/\D/g, ""), 10) || 0;
};
