const express = require('express');
const {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
} = require('../controllers/role');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// router.use(authorize('admin')); // Assumption: Only admins can manage roles

router
    .route('/')
    .get(getRoles)
    .post(createRole);

router
    .route('/:id')
    .get(getRole)
    .put(updateRole)
    .delete(deleteRole);

module.exports = router;
