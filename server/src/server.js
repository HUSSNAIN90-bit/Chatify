import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
