export function validateBooking({ name, phone, date, time, guests, zone }) {
  if (!name || name.trim().length < 2) return "Некорректное имя";

  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 12) return "Некорректный телефон";

  if (!date || date.trim().length < 3) return "Некорректная дата";

  if (!time || time.trim().length < 3) return "Некорректное время";

  if (!guests || Number(guests) < 1) return "Некорректное количество гостей";

  if (!zone) return "Не выбрана зона";

  return null;
}
