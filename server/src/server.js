import express from "express";
import dotenv from "dotenv";
const PORT = process.env.PORT || 5000;
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const app = express();

app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});