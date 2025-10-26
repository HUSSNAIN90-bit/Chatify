import Contact from "../models/Contact.js";
import User from "../models/User.js";

export const addContact = async (req, res) => {
  try {
    const userId = req.user._id; // Current logged-in user
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ message: "Name and phone number are required" });
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent user from adding themselves
    if (user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    // Check if the contact already exists for this user
    const isContactExists = await Contact.findOne({
      userId,
      contactId: user._id,
    });

    if (isContactExists) {
      return res.status(400).json({ message: "Contact already exists" });
    }

    // Create new contact
    const newContact = new Contact({
      name,
      userId,
      contactId: user._id,
      phoneNumber: user.phoneNumber
    });

    await newContact.save();

    res.status(201).json({
      message: "Contact added successfully",
      contact: newContact,
    });
  } catch (err) {
    console.error("Error in addContact Controller:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    const contacts = await Contact.find({ userId })
      .populate("contactId", "fullName profilePic");

    res.status(200).json(contacts);
  } catch (err) {
    console.error("Error in getAllContacts Controller:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
