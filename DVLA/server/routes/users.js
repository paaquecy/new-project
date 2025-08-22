const express = require('express');
const bcrypt = require('bcryptjs');
const { database, TABLES, USER_ROLES } = require('../config/supabase');
const { validateUser, validateId, validateQuery } = require('../middleware/validation');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', requireRole(['admin']), validateQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query with filters
    let query = database.client
      .from(TABLES.USERS)
      .select('id, username, email, full_name, phone, role, created_at, updated_at', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', requireRole(['admin']), validateId, async (req, res) => {
  try {
    const userId = req.params.id;

    const { data: user, error } = await database.client
      .from(TABLES.USERS)
      .select('id, username, email, full_name, phone, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Create new user (admin only)
router.post('/', requireRole(['admin']), validateUser, async (req, res) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    // Validate role
    if (!USER_ROLES.hasOwnProperty(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      username,
      email,
      password_hash: hashedPassword,
      full_name,
      phone,
      role: role.toLowerCase()
    };

    const { data: user, error } = await database.client
      .from(TABLES.USERS)
      .insert(userData)
      .select('id, username, email, full_name, phone, role, created_at')
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await database.logAudit(
      TABLES.USERS,
      user.id,
      'INSERT',
      null,
      userData,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Update user
router.put('/:id', requireRole(['admin']), validateId, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, full_name, phone, role, password } = req.body;

    // Get current user data for audit log
    const { data: currentUser, error: fetchError } = await database.client
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (role) {
      // Validate role
      if (!USER_ROLES.hasOwnProperty(role.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
      updateData.role = role.toLowerCase();
    }
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { data: updatedUser, error: updateError } = await database.client
      .from(TABLES.USERS)
      .update(updateData)
      .eq('id', userId)
      .select('id, username, email, full_name, phone, role, created_at, updated_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the action (exclude password from audit)
    const auditData = { ...updateData };
    delete auditData.password_hash;
    
    await database.logAudit(
      TABLES.USERS,
      userId,
      'UPDATE',
      currentUser,
      auditData,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), validateId, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user?.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Get user data for audit log
    const { data: user, error: fetchError } = await database.client
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    const { error: deleteError } = await database.client
      .from(TABLES.USERS)
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw deleteError;
    }

    // Log the action
    await database.logAudit(
      TABLES.USERS,
      userId,
      'DELETE',
      user,
      null,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Change password (self or admin)
router.put('/:id/password', validateId, async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    // Check if user is admin or updating their own password
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this password'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user
    const { data: user, error: fetchError } = await database.client
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password (unless admin changing someone else's password)
    if (req.user?.role !== 'admin' || req.user?.id === userId) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await database.client
      .from(TABLES.USERS)
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await database.logAudit(
      TABLES.USERS,
      userId,
      'UPDATE',
      null,
      { action: 'password_changed' },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', requireRole(['admin']), async (req, res) => {
  try {
    // Get total users by role
    const { data: users, error } = await database.client
      .from(TABLES.USERS)
      .select('role');

    if (error) {
      throw error;
    }

    // Count by role
    const roleCounts = (users || []).reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Get users created today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayUsers, error: todayError, count: todayCount } = await database.client
      .from(TABLES.USERS)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (todayError) {
      console.error('Error fetching today stats:', todayError);
    }

    res.json({
      success: true,
      data: {
        total_users: users?.length || 0,
        new_today: todayCount || 0,
        by_role: {
          admin: roleCounts.admin || 0,
          user: roleCounts.user || 0,
          officer: roleCounts.officer || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

module.exports = router;
