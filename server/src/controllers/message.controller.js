import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Contact from "../models/Contact.js";
import mongoose from "mongoose";

// Get all messages between two users
export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, reciverId: otherUserId },
        { senderId: otherUserId, reciverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Ensure chronological order
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error("Error in getMessagesByUserId controller:", err);
  }
};

// Send a message (with optional image)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: reciverId } = req.params;
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ message: "Message text or image is required" });
    }
    if (senderId.equals(reciverId)) {
      return res.status(400).json({ message: "You cannot send message to yourself" });
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
      isReaded: false, // Always ensure this field exists for consistency
    });
    await newMessage.save();

    // Notify receiver immediately over socket
    const receiverSocketId = getReceiverSocketId(reciverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get all chat partners for current user (with contact integration)
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { reciverId: loggedInUserId }],
    }).sort({ createdAt: 1 });

    const myIdStr = loggedInUserId.toString();
    // Get unique chat partner IDs (excluding myself)
    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === myIdStr
            ? msg.reciverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    // Fetch those user details
    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    // Fetch all contacts for this user
    const userContacts = await Contact.find({ userId: loggedInUserId });

    // Prepare result: for each chat partner, gather required data
    const result = await Promise.all(
      chatPartners.map(async (partner) => {
        const partnerId = partner._id.toString();

        // All messages between the current user and this partner
        const partnerMessages = messages.filter(
          m =>
            (m.senderId.toString() === myIdStr && m.reciverId.toString() === partnerId) ||
            (m.senderId.toString() === partnerId && m.reciverId.toString() === myIdStr)
        );

        // Unread messages where user is receiver and "isReaded" false
        const unreadMessages = partnerMessages.filter(
          m => m.reciverId.toString() === myIdStr && m.isReaded === false
        );

        let previewMessage = null;
        if (unreadMessages.length > 0) {
          // Get the latest unread message (by createdAt desc)
          previewMessage = unreadMessages.sort(
            (a, b) => b.createdAt - a.createdAt
          )[0];
        } else if (partnerMessages.length > 0) {
          // No unread: show the latest message in conversation
          previewMessage = partnerMessages.sort(
            (a, b) => b.createdAt - a.createdAt
          )[0];
        }

        // Find contact for display name integration etc
        const contact = userContacts.find(
          c => c.contactId.toString() === partnerId
        );

        return {
          _id: partner._id,
          phoneNumber: partner.phoneNumber,
          profilePic: partner.profilePic || "",
          region: partner.region,
          fullName: partner.fullName,
          displayName: contact ? contact.name : "",
          isContact: !!contact,
          unreadCount: unreadMessages.length,
          lastMessage: previewMessage
            ? {
                _id: previewMessage._id,
                senderId: previewMessage.senderId,
                reciverId: previewMessage.reciverId,
                text: previewMessage.text,
                image: previewMessage.image,
                createdAt: previewMessage.createdAt,
                isReaded: previewMessage.isReaded,
              }
            : null,
        };
      })
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getChatPartners controller:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark all unread messages from a given sender as read for logged-in user
export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    const senderObjectId = mongoose.Types.ObjectId.isValid(senderId)
      ? new mongoose.Types.ObjectId(senderId)
      : null;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!senderObjectId || !userObjectId) {
      return res.status(400).json({ message: "Invalid senderId or userId" });
    }

    // Update all unread messages from sender to receiver
    const result = await Message.updateMany(
      {
        senderId: senderObjectId,
        reciverId: userObjectId,
        isReaded: false,
      },
      { isReaded: true }
    );

    // Always send the "messagesRead" event for real-time UI sync, even if 0 updated
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { senderId, readerId: userId });
    }

    // Always respond successfully, showing how many were updated
    res.status(200).json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};