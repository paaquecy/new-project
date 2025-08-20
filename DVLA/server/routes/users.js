const express = require('express');
const bcrypt = require('bcryptjs');
const { database } = require('../config/database');
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

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countResult = await database.get(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    // Get users
    const users = await database.all(
      `SELECT 
        id, username, email, full_name, role, created_at, updated_at
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', requireRole(['admin']), validateId, async (req, res) => {
  try {
    const user = await database.get(
      'SELECT id, username, email, full_name, role, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity stats
    const activityStats = await database.all(`
      SELECT 
        table_name,
        action,
        COUNT(*) as count
      FROM audit_logs 
      WHERE user_id = ?
      GROUP BY table_name, action
      ORDER BY count DESC
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        user,
        activity_stats: activityStats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create new user (admin only)
router.post('/', requireRole(['admin']), validateUser, async (req, res) => {
  try {
    const { username, email, password, full_name, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await database.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await database.run(
      `INSERT INTO users (username, email, password_hash, full_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, full_name, role]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      ['users', result.id, 'create', JSON.stringify({ username, email, full_name, role }), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.id,
        username,
        email,
        full_name,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (admin only)
router.put('/:id', requireRole(['admin']), validateId, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, full_name, role, password } = req.body;

    // Get current user data for audit log
    const currentUser = await database.get(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await database.get(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || currentUser.username, email || currentUser.email, userId]
      );

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }

    const updateData = {
      username: username || currentUser.username,
      email: email || currentUser.email,
      full_name: full_name || currentUser.full_name,
      role: role || currentUser.role,
      updated_at: new Date().toISOString()
    };

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Build dynamic update query
    const updateFields = Object.keys(updateData).filter(key => key !== 'id');
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updateData[field]);
    values.push(userId);

    await database.run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    // Log the action (don't log password hash)
    const logData = { ...updateData };
    delete logData.password_hash;
    
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['users', userId, 'update', JSON.stringify(currentUser), JSON.stringify(logData), req.user.id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), validateId, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Get user data for audit log
    const user = await database.get(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await database.run(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      ['users', userId, 'delete', JSON.stringify(user), req.user.id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get user activity logs (admin only)
router.get('/:id/activity', requireRole(['admin']), validateId, validateQuery, async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Verify user exists
    const user = await database.get(
      'SELECT id, username, full_name FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total count
    const countResult = await database.get(
      'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?',
      [userId]
    );

    // Get activity logs
    const activities = await database.all(
      `SELECT 
        id, table_name, record_id, action, old_values, new_values, timestamp
       FROM audit_logs 
       WHERE user_id = ?
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name
        },
        activities,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', requireRole(['admin']), async (req, res) => {
  try {
    const stats = await Promise.all([
      database.get("SELECT COUNT(*) as total FROM users"),
      database.get("SELECT COUNT(*) as total FROM users WHERE role = 'admin'"),
      database.get("SELECT COUNT(*) as total FROM users WHERE role = 'user'"),
      database.get("SELECT COUNT(*) as total FROM users WHERE date(created_at) >= date('now', '-30 days')"),
      database.get("SELECT COUNT(DISTINCT user_id) as total FROM audit_logs WHERE date(timestamp) >= date('now', '-7 days')")
    ]);

    res.json({
      success: true,
      data: {
        total_users: stats[0].total,
        admin_users: stats[1].total,
        regular_users: stats[2].total,
        new_users_this_month: stats[3].total,
        active_users_this_week: stats[4].total
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

module.exports = router;