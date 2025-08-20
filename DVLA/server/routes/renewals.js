const express = require('express');
const { database } = require('../config/database');
const { validateId, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Get all renewals with pagination and filtering
router.get('/', validateQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ` AND (v.license_plate LIKE ? OR v.owner_name LIKE ? OR r.transaction_id LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== 'All Statuses') {
      whereClause += ' AND r.status = ?';
      params.push(status.toLowerCase().replace(' ', '_'));
    }

    // Get total count
    const countResult = await database.get(
      `SELECT COUNT(*) as total 
       FROM renewals r 
       JOIN vehicles v ON r.vehicle_id = v.id 
       ${whereClause}`,
      params
    );

    // Get renewals with vehicle information
    const renewals = await database.all(
      `SELECT 
        r.id, r.renewal_date, r.expiry_date, r.status, r.amount_paid,
        r.payment_method, r.transaction_id, r.created_at,
        v.license_plate, v.manufacturer, v.model, v.owner_name
       FROM renewals r
       JOIN vehicles v ON r.vehicle_id = v.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Transform status for frontend
    const transformedRenewals = renewals.map(renewal => ({
      ...renewal,
      status: getDisplayStatus(renewal.status, renewal.expiry_date)
    }));

    res.json({
      success: true,
      data: {
        renewals: transformedRenewals,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get renewals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewals'
    });
  }
});

// Get renewal by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const renewal = await database.get(
      `SELECT 
        r.*, 
        v.license_plate, v.manufacturer, v.model, v.owner_name,
        v.owner_phone, v.owner_email, v.owner_address
       FROM renewals r
       JOIN vehicles v ON r.vehicle_id = v.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    res.json({
      success: true,
      data: { renewal }
    });
  } catch (error) {
    console.error('Get renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal'
    });
  }
});

// Create new renewal
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id,
      renewal_date,
      expiry_date,
      amount_paid,
      payment_method,
      transaction_id,
      notes
    } = req.body;

    // Verify vehicle exists
    const vehicle = await database.get(
      'SELECT id FROM vehicles WHERE id = ? AND status = ?',
      [vehicle_id, 'active']
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or inactive'
      });
    }

    const result = await database.run(
      `INSERT INTO renewals (
        vehicle_id, renewal_date, expiry_date, status, amount_paid,
        payment_method, transaction_id, notes, processed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id, renewal_date, expiry_date, 'renewed',
        amount_paid, payment_method, transaction_id, notes, req.user.id
      ]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      ['renewals', result.id, 'create', JSON.stringify(req.body), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Renewal processed successfully',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Create renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process renewal'
    });
  }
});

// Update renewal
router.put('/:id', validateId, async (req, res) => {
  try {
    const renewalId = req.params.id;

    // Get current renewal data for audit log
    const currentRenewal = await database.get(
      'SELECT * FROM renewals WHERE id = ?',
      [renewalId]
    );

    if (!currentRenewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    const updateData = {
      ...req.body,
      processed_by: req.user.id,
      updated_at: new Date().toISOString()
    };

    // Build dynamic update query
    const updateFields = Object.keys(updateData).filter(key => key !== 'id');
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updateData[field]);
    values.push(renewalId);

    await database.run(
      `UPDATE renewals SET ${setClause} WHERE id = ?`,
      values
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['renewals', renewalId, 'update', JSON.stringify(currentRenewal), JSON.stringify(updateData), req.user.id]
    );

    res.json({
      success: true,
      message: 'Renewal updated successfully'
    });
  } catch (error) {
    console.error('Update renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update renewal'
    });
  }
});

// Get renewal statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stats = await Promise.all([
      database.get("SELECT COUNT(*) as total FROM renewals WHERE status = 'renewed' AND date(created_at) >= date('now', '-30 days')"),
      database.get(`SELECT COUNT(*) as total FROM renewals WHERE expiry_date BETWEEN ? AND ? AND status != 'renewed'`, [today, thirtyDaysFromNow]),
      database.get(`SELECT COUNT(*) as total FROM renewals WHERE expiry_date < ? AND status != 'renewed'`, [today]),
      database.get("SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days FROM renewals WHERE status = 'renewed'")
    ]);

    res.json({
      success: true,
      data: {
        renewals_this_month: stats[0].total,
        due_soon: stats[1].total,
        overdue: stats[2].total,
        average_processing_days: Math.round(stats[3].avg_days || 0)
      }
    });
  } catch (error) {
    console.error('Get renewal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal statistics'
    });
  }
});

// Helper function to determine display status
function getDisplayStatus(dbStatus, expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (dbStatus === 'renewed') {
    return 'Renewed';
  } else if (daysUntilExpiry < 0) {
    return 'Overdue';
  } else if (daysUntilExpiry <= 30) {
    return 'Due Soon';
  } else {
    return 'Active';
  }
}

module.exports = router;