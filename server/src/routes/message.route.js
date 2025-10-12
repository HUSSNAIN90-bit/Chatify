import express from 'express';

const router = express.Router();

router.post("/send", (req, res) => {
    res.send("Send Message Route");
});

export default router;