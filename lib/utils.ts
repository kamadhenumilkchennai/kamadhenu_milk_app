export const formatPhone = (phone?: string) => {
  if (!phone) return "";
  return phone
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d{5})/, "$1 $2");
};
