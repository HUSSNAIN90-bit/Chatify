import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      minLength: 11,
      maxLength: 15,
      unique: true,
    },
    region: {
      type: String,
      required: true,
      default: "Pakistan",
    },
    password: {
      required: true,
      type: String,
      minLength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
