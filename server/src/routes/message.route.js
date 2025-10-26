import express from "express";
import {
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
  markMessagesAsRead,
} from "../controllers/message.controller.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/chats", getChatPartners);
router.post("/readed", markMessagesAsRead);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;
