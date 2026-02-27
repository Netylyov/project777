import express from "express";
import { sendTelegramMessage } from "../telegram.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, phone, comment, items } = req.body;

  if (!name || !phone || !items || items.length === 0) {
    return res.json({ ok: false, error: "Некорректные данные" });
  }

  const itemsText = items
    .map(i => `• ${i.title} — ${i.qty} шт. (${i.price} BYN)`)
    .join("\n");

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const text = `
🛒 <b>Новый заказ</b>

👤 Имя: ${name}
📞 Телефон: ${phone}
💬 Комментарий: ${comment || "—"}

<b>Состав заказа:</b>
${itemsText}

<b>Итого:</b> ${total} BYN
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
