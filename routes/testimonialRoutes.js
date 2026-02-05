const express = require('express');
const {
    getAdminTestimonials,
    getTestimonials,
    toggleVisibility,
    deleteTestimonial,
    createTestimonial,
    submitTestimonial
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getTestimonials);

// User routes
router.post('/submit', protect, submitTestimonial);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'super admin'));

router.post('/', createTestimonial);
router.get('/admin', getAdminTestimonials);
router.put('/:id/visibility', toggleVisibility);
router.delete('/:id', deleteTestimonial);


module.exports = router;
