export const normalizeIndianPhone = (phone: string) => {
  const digits = String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);

  return digits;
};

export const isValidIndianPhone = (phone: string) =>
  /^[6-9]\d{9}$/.test(normalizeIndianPhone(phone));

export const formatIndianPhone = (
  phone: string,
  countryCode = "+91",
) => {
  const digits = normalizeIndianPhone(phone);
  const normalizedCountryCode = countryCode.startsWith("+")
    ? countryCode
    : `+${countryCode.replace(/\D/g, "")}`;

  if (!digits) return normalizedCountryCode;

  return `${normalizedCountryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
};
