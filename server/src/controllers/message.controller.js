import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Contact from "../models/Contact.js"

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
    if (senderId.equals(reciverId)) {
      return res
        .status(400)
        .json({ message: "You cannot send message to yourself" });
    }
    const reciverExists = await User.exists({ _id: reciverId });
    if (!reciverExists) {
      return res.status(404).json({ message: "Reciver not found" });
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

    const receiverSocketId = getReceiverSocketId(reciverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {}
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { reciverId: loggedInUserId }],
    });

    // Extract unique chat partner IDs
    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.reciverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    // Get all chat partners (users)
    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    // Get all contacts of the logged-in user
    const userContacts = await Contact.find({ userId: loggedInUserId });

    // Combine contacts and users
    const result = chatPartners.map((partner) => {
      const contact = userContacts.find(
        (c) => c.contactId.toString() === partner._id.toString()
      );

      return {
        _id: partner._id,
        phoneNumber: partner.phoneNumber,
        profilePic: partner.profilePic || "",
        region: partner.region,
        // 👇 use saved contact name if exists, else fall back to fullName
        fullName: partner.fullName,
        displayName: contact ? contact.name : undefined,
        isContact: !!contact, // helpful for frontend
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getChatPartners controller:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
