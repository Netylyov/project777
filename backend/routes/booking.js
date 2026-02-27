import express from "express";
import { sendTelegramMessage } from "../telegram.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, phone, date, time, comment } = req.body;

  if (!name || !phone || !date || !time) {
    return res.json({ ok: false, error: "Некорректные данные" });
  }

  const text = `
📅 <b>Новое бронирование</b>

👤 Имя: ${name}
📞 Телефон: ${phone}
📆 Дата: ${date}
⏰ Время: ${time}
💬 Комментарий: ${comment || "—"}
`;

  try {
    await sendTelegramMessage(text);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
});

export default router;
