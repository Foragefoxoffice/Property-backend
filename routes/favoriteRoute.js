const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/add', protect, addFavorite);
router.delete('/remove/:propertyId', protect, removeFavorite);
router.get('/', protect, getFavorites);

module.exports = router;
