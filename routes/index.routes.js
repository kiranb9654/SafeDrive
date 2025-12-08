const express = require('express');
const upload = require("../config/multer");     
const fileModel = require('../models/file.model');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();


router.get('/home', authMiddleware, (req, res) => {
    res.render('home');
});


router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

           
            const cloudinaryUrl =
                req.file.path ||
                req.file.secure_url ||
                req.file.url;

            // save file info to mongoDB
            const newFile = await fileModel.create({
                path: cloudinaryUrl,                 // Store file URL in mongo
                originalname: req.file.originalname,
                user: req.user.user_Id

            });

            return res.status(201).json({
                success: true,
                message: "File uploaded successfully",
                file: newFile,
            });

        } catch (error) {
            console.error("Upload error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error",
                error: error.message,
            });
        }
    }
);

module.exports = router;
