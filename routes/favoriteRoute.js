const express = require('express');
const { addFavorite, removeFavorite, getFavorites, getAllEnquiries, markAsRead, deleteEnquiry } = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/add', protect, addFavorite);
router.delete('/remove/:propertyId', protect, removeFavorite);
router.get('/', protect, getFavorites);

// Admin / Staff Routes
router.get('/admin/all', protect, authorize('admin', 'staff'), getAllEnquiries);
router.put('/admin/mark-read/:id', protect, authorize('admin', 'staff'), markAsRead);
router.delete('/admin/delete/:id', protect, authorize('admin', 'staff'), deleteEnquiry);

module.exports = router;
