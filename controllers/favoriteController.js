const Favorite = require('../models/Favorite');
const CreateProperty = require('../models/CreateProperty');
const User = require('../models/User');

exports.addFavorite = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.user.id; // Assuming auth middleware adds user to req

        // 1. Fetch User Details
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const userName = user.name || (user.firstName?.en ? `${user.firstName.en} ${user.lastName?.en || ''}` : 'Unknown');
        const userEmail = user.email;
        const userPhone = user.phone;

        // 2. Fetch Property and Staff Details
        let property = await CreateProperty.findOne({ "listingInformation.listingInformationPropertyId": propertyId }).populate('createdBy');
        let propRefId = property ? property._id : propertyId;

        if (!property) {
            // Fallback: try by _id if propertyId is not the custom ID
            property = await CreateProperty.findById(propertyId).populate('createdBy');
            propRefId = propertyId;
            if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
        }

        // Determine Staff Name
        // Priority: contactManagementConsultant (en) -> createdBy.name
        let staffName = property.contactManagement?.contactManagementConsultant?.en || property.contactManagement?.contactManagementConsultant?.vi;

        if (!staffName && property.createdBy) {
            const creator = property.createdBy;
            staffName = creator.name || (creator.firstName?.en ? `${creator.firstName.en} ${creator.lastName?.en || ''}` : 'Unknown');
        }

        const existingFavorite = await Favorite.findOne({ user: userId, property: propRefId });
        if (existingFavorite) {
            return res.status(400).json({ success: false, error: 'Property already in favorites' });
        }

        const favorite = await Favorite.create({
            user: userId,
            property: propRefId,
            userName,
            userEmail,
            userPhone,
            staffName: staffName || 'Admin',
            isRead: false
        });

        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.id;

        // propertyId in params might be the _id of the Property OR the Favorite ID. 
        // Usually, removing from a list by Property ID is easier for the 'Heart' toggle.

        // Let's resolve the Property _id first if the frontend sends the custom ID or _id
        let propRefId = propertyId;
        const property = await CreateProperty.findOne({ "listingInformation.listingInformationPropertyId": propertyId });
        if (property) {
            propRefId = property._id;
        }

        const deleted = await Favorite.findOneAndDelete({ user: userId, property: propRefId });

        if (!deleted) {
            // Maybe the user sent the FAVORITE _id? (From the Favorites list page)
            const deletedByFavId = await Favorite.findOneAndDelete({ _id: propertyId, user: userId });
            if (!deletedByFavId) return res.status(404).json({ success: false, error: 'Favorite not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'property',
                select: 'imagesVideos.propertyImages listingInformation.listingInformationPropertyTitle listingInformation.listingInformationPropertyId listingInformation.listingInformationDateListed financialDetails.financialDetailsPrice financialDetails.financialDetailsLeasePrice financialDetails.financialDetailsPricePerNight listingInformation.listingInformationTransactionType listingInformation.listingInformationProjectCommunity listingInformation.listingInformationZoneSubArea'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Admin: Get All Enquiries (Favorites from all users)
exports.getAllEnquiries = async (req, res) => {
    try {
        // Optional: Check if req.user is admin
        // if (req.user.role !== 'admin') ...

        const favorites = await Favorite.find({})
            .populate({
                path: 'property',
                select: 'imagesVideos.propertyImages listingInformation.listingInformationPropertyTitle listingInformation.listingInformationPropertyId listingInformation.listingInformationDateListed financialDetails.financialDetailsPrice financialDetails.financialDetailsLeasePrice financialDetails.financialDetailsPricePerNight listingInformation.listingInformationTransactionType listingInformation.listingInformationProjectCommunity listingInformation.listingInformationZoneSubArea propertyInformation.informationBedrooms propertyInformation.informationBathrooms propertyInformation.informationUnitSize'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        console.error('Error fetching all enquiries:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Admin: Mark as Read/Unread
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead } = req.body; // Expect boolean

        const favorite = await Favorite.findByIdAndUpdate(id, { isRead }, { new: true });
        if (!favorite) {
            return res.status(404).json({ success: false, error: 'Enquiry not found' });
        }

        res.status(200).json({ success: true, data: favorite });
    } catch (error) {
        console.error('Error marking enquiry as read:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
