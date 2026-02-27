const express = require("express");
const cors = require("cors");
const { sendBookingToTelegram } = require("./telegram");

const app = express();

// Разрешаем CORS
app.use(cors());

// Парсим JSON
app.use(express.json());

// ===============================
// API: БРОНИРОВАНИЕ
// ===============================
app.post("/api/booking", async (req, res) => {
    try {
        const booking = req.body;

        console.log("\n=== ПОЛУЧЕНА БРОНЬ ===");
        console.log(booking);

        // Проверка обязательных полей
        if (!booking.name || !booking.phone || !booking.date || !booking.time || !booking.guests) {
            return res.status(400).json({
                ok: false,
                message: "Не все обязательные поля заполнены"
            });
        }

        // Отправка в Telegram
        await sendBookingToTelegram(booking);

        return res.json({ ok: true, message: "Бронирование принято" });

    } catch (error) {
        console.error("Ошибка при обработке бронирования:", error);
        return res.status(500).json({
            ok: false,
            message: "Ошибка сервера при обработке бронирования"
        });
    }
});

// ===============================
// ЗАПУСК СЕРВЕРА
// ===============================
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`\nBackend запущен: http://localhost:${PORT}`);
});
