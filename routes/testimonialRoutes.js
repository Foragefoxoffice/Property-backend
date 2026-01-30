const express = require('express');
const {
    getAdminTestimonials,
    getTestimonials,
    toggleVisibility,
    deleteTestimonial,
    syncGoogleReviews,
    createTestimonial
} = require('../controllers/testimonialController');

const router = express.Router();

// Public routes
router.get('/', getTestimonials);

// Admin routes
router.post('/', createTestimonial);
router.get('/admin', getAdminTestimonials);
router.put('/:id/visibility', toggleVisibility);
router.delete('/:id', deleteTestimonial);
router.post('/sync', syncGoogleReviews);

module.exports = router;
