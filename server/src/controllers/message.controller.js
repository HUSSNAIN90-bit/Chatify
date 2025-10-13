import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const fiteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -email -createdAt -updatedAt -__v");

    res.status(200).json(fiteredUsers);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error in getAllContacts controller:", err);
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, reciverId: otherUserId },
        { senderId: otherUserId, reciverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error in getMessagesByUserId controller:", err);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: reciverId } = req.params;
    const { text, image } = req.body;
    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message text or image is required" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      reciverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {}
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { reciverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.reciverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];
    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error in getChatPartners controller:", err);
  }
};
