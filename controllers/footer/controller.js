const Footer = require('../../models/Footer');

// Get Footer Data
const getFooter = async (req, res) => {
    try {
        let footer = await Footer.findOne();

        // If no footer exists, create one with default values
        if (!footer) {
            footer = await Footer.create({});
        }

        res.status(200).json({
            success: true,
            data: footer
        });
    } catch (error) {
        console.error('Error fetching footer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch footer data',
            error: error.message
        });
    }
};

// Update Footer Data
const updateFooter = async (req, res) => {
    try {
        const data = req.body;

        let footer = await Footer.findOne();

        if (!footer) {
            // Create new footer if doesn't exist
            footer = await Footer.create(data);
        } else {
            // Update existing footer by assigning all fields
            Object.assign(footer, data);
            await footer.save();
        }

        res.status(200).json({
            success: true,
            message: 'Footer updated successfully',
            data: footer
        });
    } catch (error) {
        console.error('Error updating footer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update footer',
            error: error.message
        });
    }
};

// Upload Footer Image
const uploadFooterImage = async (req, res) => {
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
        const uploadDir = path.join(__dirname, '../../uploads/footer');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(imageFile.name);
        const filename = `footer-image-${timestamp}${ext}`;
        const uploadPath = path.join(uploadDir, filename);

        // Move file to uploads directory
        await imageFile.mv(uploadPath);

        // Return the URL path
        const url = `/uploads/footer/${filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: { url }
        });
    } catch (error) {
        console.error('Error uploading footer image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

module.exports = {
    getFooter,
    updateFooter,
    uploadFooterImage
};
