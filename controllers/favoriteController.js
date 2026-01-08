const Favorite = require('../models/Favorite');
const CreateProperty = require('../models/CreateProperty');

exports.addFavorite = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.user.id; // Assuming auth middleware adds user to req

        // Check if property exists
        const property = await CreateProperty.findOne({ "listingInformation.listingInformationPropertyId": propertyId });
        if (!property) {
            // Fallback: try by _id if propertyId is not the custom ID
            const propById = await CreateProperty.findById(propertyId);
            if (!propById) return res.status(404).json({ success: false, error: 'Property not found' });
        }

        // We need the _id for the ref
        const propRefId = property ? property._id : propertyId;

        const existingFavorite = await Favorite.findOne({ user: userId, property: propRefId });
        if (existingFavorite) {
            return res.status(400).json({ success: false, error: 'Property already in favorites' });
        }

        const favorite = await Favorite.create({
            user: userId,
            property: propRefId
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
            .populate('property')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
