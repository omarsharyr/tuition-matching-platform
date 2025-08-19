// backend/controllers/chatController.js
import Chat from "../models/Chat.js";

export const myChats = async (req, res) => {
  const chats = await Chat.find({ members: req.user._id }).sort("-updatedAt");
  res.json(chats);
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.members.some(m => String(m) === String(req.user._id)))
    return res.status(404).json({ message: "Chat not found" });
  res.json(chat.messages || []);
};

export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { body } = req.body;
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.members.some(m => String(m) === String(req.user._id)))
    return res.status(404).json({ message: "Chat not found" });
  if (chat.locked) return res.status(403).json({ message: "Chat locked" });

  chat.messages.push({ from: req.user._id, body });
  await chat.save();
  res.status(201).json({ message: "Sent" });
};
