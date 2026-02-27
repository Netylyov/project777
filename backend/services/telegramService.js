import fetch from "node-fetch";
import fs from "fs";

const TOKEN = "8574415229:AAFn2aTiuSAtWNY91lnbIHF1DbaB9G3HCFg"; // ← сюда вставь токен в кавычках
const API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
const file = "./data/telegramUsers.json";

// Нормализация номера телефона
function normalizePhone(phone) {
  if (!phone) return null;

  // Убираем всё, кроме цифр
  let digits = String(phone).replace(/\D/g, "");

  // Если начинается с 375 — добавляем +
  if (digits.startsWith("375")) {
    return "+" + digits;
  }

  // Если начинается с 80 — превращаем в +375
  if (digits.startsWith("80")) {
    return "+375" + digits.slice(2);
  }

  // Если начинается с 0 — превращаем в +375
  if (digits.startsWith("0")) {
    return "+375" + digits.slice(1);
  }

  // Если уже есть плюс
  if (String(phone).startsWith("+")) {
    return "+" + digits;
  }

  // fallback
  return "+" + digits;
}

export async function sendTelegram(phone, text) {
  try {
    if (!phone) {
      console.log("sendTelegram: телефон не передан");
      return;
    }

    // Нормализуем номер
    const normalized = normalizePhone(phone);

    console.log("Ищу chat_id по номеру:", normalized);

    // Проверяем файл
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({}, null, 2));
    }

    const users = JSON.parse(fs.readFileSync(file, "utf8"));
    const chat_id = users[normalized];

    if (!chat_id) {
      console.log("❌ Нет chat_id для телефона:", normalized);
      return;
    }

    // Отправляем сообщение
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: "HTML"
      })
    });

    const data = await response.json();
    console.log("Ответ Telegram:", data);

    if (!data.ok) {
      console.log("❌ Ошибка Telegram API:", data.description);
    }

  } catch (err) {
    console.error("🔥 Ошибка отправки Telegram:", err);
  }
}
