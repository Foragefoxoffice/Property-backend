const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private/Admin
exports.getRoles = asyncHandler(async (req, res, next) => {
    const roles = await Role.find();

    res.status(200).json({
        success: true,
        count: roles.length,
        data: roles
    });
});

// @desc    Get single role
// @route   GET /api/v1/roles/:id
// @access  Private/Admin
exports.getRole = asyncHandler(async (req, res, next) => {
    const role = await Role.findById(req.params.id);

    if (!role) {
        return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: role
    });
});

// @desc    Create new role
// @route   POST /api/v1/roles
// @access  Private/Admin
exports.createRole = asyncHandler(async (req, res, next) => {
    const role = await Role.create(req.body);

    res.status(201).json({
        success: true,
        data: role
    });
});

// @desc    Update role
// @route   PUT /api/v1/roles/:id
// @access  Private/Admin
exports.updateRole = asyncHandler(async (req, res, next) => {
    let role = await Role.findById(req.params.id);

    if (!role) {
        return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }

    // Prevent update of Super Admin Role
    if (role.name === "Super Admin") {
        return next(new ErrorResponse("Cannot update Super Admin role", 403));
    }

    role = await Role.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: role
    });
});

// @desc    Delete role
// @route   DELETE /api/v1/roles/:id
// @access  Private/Admin
exports.deleteRole = asyncHandler(async (req, res, next) => {
    const role = await Role.findById(req.params.id);

    if (!role) {
        return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }

    // Prevent deletion of Super Admin Role
    if (role.name === "Super Admin") {
        return next(new ErrorResponse("Cannot delete Super Admin role", 403));
    }

    await role.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
