const Favorite = require('../models/Favorite');
const CreateProperty = require('../models/CreateProperty');
const User = require('../models/User');
const NotificationSetting = require('../models/NotificationSetting');
const sendEmail = require('../utils/sendEmail');


exports.addFavorite = async (req, res) => {
    try {
        const { propertyIds, message } = req.body; // Expecting an array of Ids and optional message
        const user = req.user;
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const userId = user.id;
        const userName = user.name || (user.firstName?.en ? `${user.firstName.en} ${user.lastName?.en || ''}`.trim() : 'Unknown');
        const userEmail = user.email;

        // Handle phone (User has 'phone', Staff has 'staffsNumbers')
        let userPhone = user.phone;
        if (!userPhone && user.staffsNumbers && user.staffsNumbers.length > 0) {
            userPhone = user.staffsNumbers[0];
        }

        // We could look up staff names from properties, but if it's a mixed bag, it's ambiguous.
        // We'll leave staffName empty or generic for now, or pick the first one.

        let staffName = 'System';
        if (propertyIds && propertyIds.length > 0) {
            // Optional: Fetch first property to get representative staff?
            // Skipping for performance unless needed.
        }

        // Create a single Enquiry record for these properties
        const favorite = await Favorite.create({
            user: userId,
            properties: propertyIds, // Storing array
            userName,
            userEmail,
            userPhone,
            staffName,
            message,
            isRead: false
        });

        // Populate the properties for the socket event
        const populatedFavorite = await Favorite.findById(favorite._id)
            .populate({
                path: 'properties',
                select: 'imagesVideos.propertyImages listingInformation.listingInformationPropertyTitle listingInformation.listingInformationPropertyId listingInformation.listingInformationDateListed financialDetails.financialDetailsPrice financialDetails.financialDetailsLeasePrice financialDetails.financialDetailsPricePerNight financialDetails.financialDetailsCurrency listingInformation.listingInformationTransactionType listingInformation.listingInformationProjectCommunity listingInformation.listingInformationZoneSubArea propertyInformation.informationBedrooms propertyInformation.informationBathrooms propertyInformation.informationUnitSize whatNearby.whatNearbyDescription'
            });

        // Emit Socket.IO event for real-time notification
        const io = req.app.get('io');
        if (io) {
            io.emit('newEnquiry', {
                enquiry: populatedFavorite,
                message: `New enquiry from ${userName}`,
                timestamp: new Date()
            });
            console.log(`🔔 New enquiry notification sent via Socket.IO`.green);
        }

        // Send Email Notification
        const settings = await NotificationSetting.findOne();
        
        // Determine type of enquiry and recipient
        const isFavoritesEnquiry = Array.isArray(propertyIds) && propertyIds.length > 1;
        const recipientEmail = settings 
            ? (isFavoritesEnquiry ? settings.favoritesEnquiryEmail : settings.propertyEnquiryEmail) 
            : process.env.SMTP_EMAIL;

        if (recipientEmail) {
            try {
                const propertyListHtml = populatedFavorite.properties.map(p => `
                    <li>
                        <strong>Title:</strong> ${p.listingInformation?.listingInformationPropertyTitle?.en || 'N/A'}<br>
                        <strong>ID:</strong> ${p.listingInformation?.listingInformationPropertyId || 'N/A'}<br>
                        <strong>Type:</strong> ${p.listingInformation?.listingInformationTransactionType?.en || 'N/A'}
                    </li>
                `).join('<hr>');

                await sendEmail({
                    email: recipientEmail,
                    subject: isFavoritesEnquiry ? `New Favorites Enquiry from ${userName}` : `New Property Inquiry from ${userName}`,
                    message: `
                        <h2>New Enquiry Received</h2>
                        <p><strong>From:</strong> ${userName}</p>
                        <p><strong>Email:</strong> ${userEmail}</p>
                        <p><strong>Phone:</strong> ${userPhone || 'N/A'}</p>
                        <p><strong>Type:</strong> ${isFavoritesEnquiry ? 'Favorites List Inquiry' : 'Single Property Inquiry'}</p>
                        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
                        <br>
                        <h3>Inquired Properties:</h3>
                        <ul>
                            ${propertyListHtml}
                        </ul>
                    `
                });
                console.log(`📧 Notification email sent to ${recipientEmail} for ${isFavoritesEnquiry ? 'Favorites' : 'Property'} enquiry`);
            } catch (emailError) {
                console.error(`❌ Failed to send notification email: ${emailError.message}`);
            }
        }

        res.status(201).json({ success: true, data: favorite });

    } catch (error) {
        console.error('Error adding enquiry:', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};

exports.removeFavorite = async (req, res) => {
    // This function might be deprecated if we are only doing "Send Enquiry"
    // But keeping it valid just in case.
    res.status(200).json({ success: true, message: "Use local removal" });
};

exports.getFavorites = async (req, res) => {
    // User side: now mostly ignores this, but we can return the list of all ENQUIRIES user made
    try {
        const userId = req.user.id;
        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'properties',
                select: 'imagesVideos.propertyImages listingInformation.listingInformationPropertyTitle listingInformation.listingInformationPropertyId listingInformation.listingInformationDateListed financialDetails.financialDetailsPrice financialDetails.financialDetailsLeasePrice financialDetails.financialDetailsPricePerNight financialDetails.financialDetailsCurrency listingInformation.listingInformationTransactionType listingInformation.listingInformationProjectCommunity listingInformation.listingInformationZoneSubArea whatNearby.whatNearbyDescription'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        console.error('Error fetching user enquiries:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Admin: Get All Enquiries (Favorites from all users)
exports.getAllEnquiries = async (req, res) => {
    try {
        const favorites = await Favorite.find({})
            .populate({
                path: 'properties',
                select: 'imagesVideos.propertyImages listingInformation.listingInformationPropertyTitle listingInformation.listingInformationPropertyId listingInformation.listingInformationDateListed financialDetails.financialDetailsPrice financialDetails.financialDetailsLeasePrice financialDetails.financialDetailsPricePerNight financialDetails.financialDetailsCurrency listingInformation.listingInformationTransactionType listingInformation.listingInformationProjectCommunity listingInformation.listingInformationZoneSubArea propertyInformation.informationBedrooms propertyInformation.informationBathrooms propertyInformation.informationUnitSize whatNearby.whatNearbyDescription'
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

// Admin: Delete Enquiry
exports.deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const favorite = await Favorite.findByIdAndDelete(id);

        if (!favorite) {
            return res.status(404).json({ success: false, error: 'Enquiry not found' });
        }

        res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting enquiry:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Admin: Bulk Delete Enquiries
exports.bulkDeleteEnquiries = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: 'Please provide an array of IDs to delete' });
        }

        const result = await Favorite.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} enquiries deleted successfully`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Error bulk deleting enquiries:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
