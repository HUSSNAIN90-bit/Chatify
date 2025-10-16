import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use(express.json({limit: "5mb" }));
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(cookieParser());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//make ready for deployment
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../client/dist")));

    // Use a regex route to catch all remaining requests.
    // Using a string like '/*' can be parsed by path-to-regexp as a param with a
    // missing name (e.g. '/:name*' without the name). A regex avoids that parser
    // quirk and reliably matches any path for client-side routing.
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../client","dist","index.html"));
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
