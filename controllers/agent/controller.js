const Agent = require('../../models/Agent');

// Get Agent Data
const getAgent = async (req, res) => {
    try {
        let agent = await Agent.findOne();

        // If no agent exists, create one with default values
        if (!agent) {
            agent = await Agent.create({});
        }

        res.status(200).json({
            success: true,
            data: agent
        });
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agent data',
            error: error.message
        });
    }
};

// Update Agent Data
const updateAgent = async (req, res) => {
    try {
        const data = req.body;

        let agent = await Agent.findOne();

        if (!agent) {
            // Create new agent if doesn't exist
            agent = await Agent.create(data);
        } else {
            // Update existing agent by assigning all fields
            Object.assign(agent, data);
            await agent.save();
        }

        res.status(200).json({
            success: true,
            message: 'Agent updated successfully',
            data: agent
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update agent',
            error: error.message
        });
    }
};

// Upload Agent Image
const uploadAgentImage = async (req, res) => {
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
        const uploadDir = path.join(__dirname, '../../uploads/agent');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(imageFile.name);
        const filename = `agent-image-${timestamp}${ext}`;
        const uploadPath = path.join(uploadDir, filename);

        // Move file to uploads directory
        await imageFile.mv(uploadPath);

        // Return the URL path
        const url = `/uploads/agent/${filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: { url }
        });
    } catch (error) {
        console.error('Error uploading agent image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

module.exports = {
    getAgent,
    updateAgent,
    uploadAgentImage
};
