import express from "express";
import { sendTelegramMessage } from "../telegram.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await sendTelegramMessage("Тестовое сообщение от сервера");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
});

export default router;
