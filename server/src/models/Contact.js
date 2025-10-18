import mongoose from "mongoose";

const contactShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 50,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phoneNumber: {
    type: Number,
    minLength: 11,
    maxLength: 15
  }
},{timestamps: true});

const Contact = mongoose.model("Contact",contactShema);

export default Contact;
