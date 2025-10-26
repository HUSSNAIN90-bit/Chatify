import express from "express";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { addContact, getAllContacts } from "../controllers/contact.controller.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/add",addContact);
router.get("/get",getAllContacts);


export default router;