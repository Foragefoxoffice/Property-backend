const Header = require('../../models/Header');

// Get Header Data
const getHeader = async (req, res) => {
    try {
        let header = await Header.findOne();

        // If no header exists, create one with default values
        if (!header) {
            header = await Header.create({
                headerLogo: '/images/login/logo.png'
            });
        }

        res.status(200).json({
            success: true,
            data: header
        });
    } catch (error) {
        console.error('Error fetching header:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch header data',
            error: error.message
        });
    }
};

// Update Header Data
const updateHeader = async (req, res) => {
    try {
        const { headerLogo } = req.body;

        let header = await Header.findOne();

        if (!header) {
            // Create new header if doesn't exist
            header = await Header.create({
                headerLogo
            });
        } else {
            // Update existing header
            header.headerLogo = headerLogo;
            await header.save();
        }

        res.status(200).json({
            success: true,
            message: 'Header updated successfully',
            data: header
        });
    } catch (error) {
        console.error('Error updating header:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update header',
            error: error.message
        });
    }
};

// Upload Header Image
const uploadHeaderImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageFile = req.files.image;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(imageFile.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
            });
        }

        // Validate file size (5MB max)
        if (imageFile.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum 5MB allowed'
            });
        }

        const path = require('path');
        const fs = require('fs');

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/header');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(imageFile.name);
        const filename = `header-logo-${timestamp}${ext}`;
        const uploadPath = path.join(uploadDir, filename);

        // Move file to uploads directory
        await imageFile.mv(uploadPath);

        // Return the URL path
        const url = `/uploads/header/${filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: { url }
        });
    } catch (error) {
        console.error('Error uploading header image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

module.exports = {
    getHeader,
    updateHeader,
    uploadHeaderImage
};
