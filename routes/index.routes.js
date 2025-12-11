const express = require('express');
const upload = require("../config/multer");     
const fileModel = require('../models/file.model');
const authMiddleware = require('../middlewares/auth');
const cloudinary = require('../config/cloudinary'); 

const router = express.Router();


router.get('/home', authMiddleware, async (req, res) => {
    try {
        // console.log("Current user:", req.user);

        const userFiles = await fileModel.find({
            user: req.user.user_Id
        });

        // console.log("User files:", userFiles);

        res.render('home', { files: userFiles });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});



router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        // Upload to Cloudinary (if you’re using Cloudinary)
        const uploadResult = await cloudinary.uploader.upload(req.file.path);

        // Save file info to MongoDB
        await fileModel.create({
            path: uploadResult.secure_url,      // Cloudinary URL
            public_id: uploadResult.public_id,  // Needed for deletion
            originalname: req.file.originalname,
            user: req.user.user_Id
        });

        // Redirect to home page after successful upload
        return res.redirect("/home");

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).send("Server Error");
    }
});


router.get('/download/:_id', authMiddleware, async (req, res) => {
    try {
        const loggedInUserId = req.user.user_Id;
        const fileId = req.params._id;

        // find file user
        const file = await fileModel.findOne({
            _id: fileId,
            user: loggedInUserId
        });

        if (!file) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.redirect(file.path);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// delete route not working
router.post('/delete/:_id', authMiddleware, async (req, res) => {
    try {
        const fileId = req.params._id;
        const userId = req.user.user_Id;

        const file = await fileModel.findOne({ _id: fileId, user: userId });
        if (!file) return res.status(401).json({ message: "Unauthorized" });

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.public_id);

        // Delete from MongoDB
        await fileModel.findByIdAndDelete(fileId);

        res.redirect('/home');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
