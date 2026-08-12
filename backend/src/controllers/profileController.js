const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/profile
 * Get authenticated user's profile details
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        employee_id: user.employee_id,
        employee_name: user.employee_name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        position: user.position,
        department: user.department,
        department_id: user.department_id,
        matricule: user.matricule,
        hire_date: user.hire_date,
        is_active: user.is_active,
        account_status: user.account_status,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[profileController] getProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

/**
 * PUT /api/profile
 * Update authenticated user's profile details
 */
const updateProfile = async (req, res) => {
  try {
    const { username, first_name, last_name, phone, position, department_id } = req.body;

    // Validation
    if (username !== undefined) {
      const cleanUsername = String(username).trim();
      if (!cleanUsername) {
        return res.status(400).json({ success: false, message: 'Username cannot be empty.' });
      }
      if (cleanUsername.length < 3 || cleanUsername.length > 50) {
        return res.status(400).json({ success: false, message: 'Username must be between 3 and 50 characters long.' });
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        return res.status(400).json({ success: false, message: 'Username contains invalid characters. Use letters, numbers, underscores, dots, or hyphens.' });
      }
    }

    if (first_name !== undefined && String(first_name).trim() === '') {
      return res.status(400).json({ success: false, message: 'First name cannot be empty.' });
    }

    if (last_name !== undefined && String(last_name).trim() === '') {
      return res.status(400).json({ success: false, message: 'Last name cannot be empty.' });
    }

    await User.updateProfile(req.user.id, {
      username: username ? String(username).trim() : undefined,
      first_name: first_name ? String(first_name).trim() : undefined,
      last_name: last_name ? String(last_name).trim() : undefined,
      phone: phone !== undefined ? String(phone).trim() : undefined,
      position: position !== undefined ? String(position).trim() : undefined,
      department_id: department_id !== undefined ? department_id : undefined
    });

    const updatedUser = await User.getById(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    console.error('[profileController] updateProfile error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update profile.'
    });
  }
};

/**
 * POST /api/profile/avatar
 * Upload or update authenticated user's profile avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const currentProfile = await User.getById(req.user.id);
    const oldAvatarUrl = currentProfile?.avatar_url;

    // Delete old physical file if it exists and is stored locally
    if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/profile-pictures/')) {
      const oldFilename = path.basename(oldAvatarUrl);
      const oldFilePath = path.join(__dirname, '../../uploads/profile-pictures', oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (unlinkErr) {
          console.warn('[profileController] Could not delete previous avatar file:', unlinkErr.message);
        }
      }
    }

    const relativeAvatarUrl = `/uploads/profile-pictures/${req.file.filename}`;
    await User.updateAvatar(req.user.id, relativeAvatarUrl);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      avatar_url: relativeAvatarUrl
    });
  } catch (error) {
    console.error('[profileController] uploadAvatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture.' });
  }
};

/**
 * DELETE /api/profile/avatar
 * Remove authenticated user's profile avatar
 */
const deleteAvatar = async (req, res) => {
  try {
    const currentProfile = await User.getById(req.user.id);
    const oldAvatarUrl = currentProfile?.avatar_url;

    if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/profile-pictures/')) {
      const oldFilename = path.basename(oldAvatarUrl);
      const oldFilePath = path.join(__dirname, '../../uploads/profile-pictures', oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (unlinkErr) {
          console.warn('[profileController] Could not delete avatar file:', unlinkErr.message);
        }
      }
    }

    await User.updateAvatar(req.user.id, null);

    res.json({
      success: true,
      message: 'Profile picture removed successfully.',
      avatar_url: null
    });
  } catch (error) {
    console.error('[profileController] deleteAvatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove profile picture.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar
};
