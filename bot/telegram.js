const TelegramBot = require("node-telegram-bot-api");

const TOKEN = "ТВОЙ_ТОКЕН_БОТА";
const ADMIN_CHAT_ID = "ТВОЙ_CHAT_ID";

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, "Бот работает. Ожидаю бронирования.");
});

function formatBooking(b) {
    return `
📌 *НОВАЯ БРОНЬ*

👤 Имя: ${b.name}
📞 Телефон: ${b.phone}
📅 Дата: ${b.date}
⏰ Время: ${b.time}
👥 Гостей: ${b.guests}
💬 Комментарий: ${b.comment || "—"}
    `;
}

async function sendBookingToTelegram(booking) {
    console.log("Отправляю бронь админу...");
    await bot.sendMessage(ADMIN_CHAT_ID, formatBooking(booking), {
        parse_mode: "Markdown"
    });
}

module.exports = { sendBookingToTelegram };
