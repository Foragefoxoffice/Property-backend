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
            footer = new Footer({});
        }

        // Update footer by explicitly assigning all fields from data
        const { 
          footerLogo, 
          footerEmail, 
          footerNumber, 
          footerIcons,
          footerAddressLable_en,
          footerAddress_en,
          footerNumberLable_en,
          footerEmailLable_en,
          footerOurCompanyLable_en,
          footerQuickLinksLable_en,
          footerJoinOurNewsTitle_en,
          footerJoinOurNewsDescription_en,
          footerCopyRight_en,
          footerAddressLable_vn,
          footerAddress_vn,
          footerNumberLable_vn,
          footerEmailLable_vn,
          footerOurCompanyLable_vn,
          footerQuickLinksLable_vn,
          footerJoinOurNewsTitle_vn,
          footerJoinOurNewsDescription_vn,
          footerCopyRight_vn
        } = data;

        if (footerLogo !== undefined) footer.footerLogo = footerLogo;
        if (footerEmail !== undefined) footer.footerEmail = footerEmail;
        if (footerNumber !== undefined) footer.footerNumber = footerNumber;
        
        // For footerIcons, we map to clean objects to strip any weird binary _id from client
        if (footerIcons !== undefined && Array.isArray(footerIcons)) {
          footer.footerIcons = footerIcons.map(item => ({
            icon: item.icon,
            link: item.link
          }));
        }

        if (footerAddressLable_en !== undefined) footer.footerAddressLable_en = footerAddressLable_en;
        if (footerAddress_en !== undefined) footer.footerAddress_en = footerAddress_en;
        if (footerNumberLable_en !== undefined) footer.footerNumberLable_en = footerNumberLable_en;
        if (footerEmailLable_en !== undefined) footer.footerEmailLable_en = footerEmailLable_en;
        if (footerOurCompanyLable_en !== undefined) footer.footerOurCompanyLable_en = footerOurCompanyLable_en;
        if (footerQuickLinksLable_en !== undefined) footer.footerQuickLinksLable_en = footerQuickLinksLable_en;
        if (footerJoinOurNewsTitle_en !== undefined) footer.footerJoinOurNewsTitle_en = footerJoinOurNewsTitle_en;
        if (footerJoinOurNewsDescription_en !== undefined) footer.footerJoinOurNewsDescription_en = footerJoinOurNewsDescription_en;
        if (footerCopyRight_en !== undefined) footer.footerCopyRight_en = footerCopyRight_en;
        
        if (footerAddressLable_vn !== undefined) footer.footerAddressLable_vn = footerAddressLable_vn;
        if (footerAddress_vn !== undefined) footer.footerAddress_vn = footerAddress_vn;
        if (footerNumberLable_vn !== undefined) footer.footerNumberLable_vn = footerNumberLable_vn;
        if (footerEmailLable_vn !== undefined) footer.footerEmailLable_vn = footerEmailLable_vn;
        if (footerOurCompanyLable_vn !== undefined) footer.footerOurCompanyLable_vn = footerOurCompanyLable_vn;
        if (footerQuickLinksLable_vn !== undefined) footer.footerQuickLinksLable_vn = footerQuickLinksLable_vn;
        if (footerJoinOurNewsTitle_vn !== undefined) footer.footerJoinOurNewsTitle_vn = footerJoinOurNewsTitle_vn;
        if (footerJoinOurNewsDescription_vn !== undefined) footer.footerJoinOurNewsDescription_vn = footerJoinOurNewsDescription_vn;
        if (footerCopyRight_vn !== undefined) footer.footerCopyRight_vn = footerCopyRight_vn;

        await footer.save();

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
