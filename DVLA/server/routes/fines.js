const express = require('express');
const { database } = require('../config/database');
const { validateFine, validateId, validateQuery } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get all fines with pagination and filtering
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
      whereClause += ` AND (f.fine_id LIKE ? OR v.license_plate LIKE ? OR v.owner_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== 'All') {
      whereClause += ' AND f.payment_status = ?';
      params.push(status.toLowerCase());
    }

    // Get total count
    const countResult = await database.get(
      `SELECT COUNT(*) as total 
       FROM fines f 
       JOIN vehicles v ON f.vehicle_id = v.id 
       ${whereClause}`,
      params
    );

    // Get fines with vehicle information
    const fines = await database.all(
      `SELECT 
        f.id, f.fine_id, f.offense_description, f.offense_date, f.offense_location,
        f.amount, f.payment_status, f.payment_method, f.marked_as_cleared, f.created_at,
        v.license_plate, v.manufacturer, v.model, v.owner_name
       FROM fines f
       JOIN vehicles v ON f.vehicle_id = v.id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        fines,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fines'
    });
  }
});

// Get fine by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const fine = await database.get(
      `SELECT 
        f.*, 
        v.license_plate, v.manufacturer, v.model, v.owner_name,
        v.owner_phone, v.owner_email, v.owner_address
       FROM fines f
       JOIN vehicles v ON f.vehicle_id = v.id
       WHERE f.id = ?`,
      [req.params.id]
    );

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    // Get audit logs for this fine
    const auditLogs = await database.all(
      `SELECT 
        al.action, al.timestamp, al.old_values, al.new_values,
        u.full_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.table_name = 'fines' AND al.record_id = ?
       ORDER BY al.timestamp DESC`,
      [req.params.id]
    );

    // Get associated documents
    const documents = await database.all(
      'SELECT * FROM documents WHERE entity_type = ? AND entity_id = ?',
      ['fine', req.params.id]
    );

    res.json({
      success: true,
      data: {
        fine,
        audit_logs: auditLogs,
        documents
      }
    });
  } catch (error) {
    console.error('Get fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fine'
    });
  }
});

// Create new fine
router.post('/', validateFine, async (req, res) => {
  try {
    const fineData = {
      ...req.body,
      created_by: req.user.id
    };

    const result = await database.run(
      `INSERT INTO fines (
        fine_id, vehicle_id, offense_description, offense_date, offense_location,
        amount, payment_status, payment_method, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fineData.fine_id, fineData.vehicle_id, fineData.offense_description,
        fineData.offense_date, fineData.offense_location, fineData.amount,
        fineData.payment_status || 'unpaid', fineData.payment_method,
        fineData.notes, fineData.created_by
      ]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      ['fines', result.id, 'create', JSON.stringify(fineData), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Fine created successfully',
      data: {
        id: result.id,
        fine_id: fineData.fine_id
      }
    });
  } catch (error) {
    console.error('Create fine error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        success: false,
        message: 'Fine with this ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create fine'
    });
  }
});

// Update fine
router.put('/:id', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;

    // Get current fine data for audit log
    const currentFine = await database.get(
      'SELECT * FROM fines WHERE id = ?',
      [fineId]
    );

    if (!currentFine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Build dynamic update query
    const updateFields = Object.keys(updateData).filter(key => key !== 'id');
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updateData[field]);
    values.push(fineId);

    await database.run(
      `UPDATE fines SET ${setClause} WHERE id = ?`,
      values
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['fines', fineId, 'update', JSON.stringify(currentFine), JSON.stringify(updateData), req.user.id]
    );

    res.json({
      success: true,
      message: 'Fine updated successfully'
    });
  } catch (error) {
    console.error('Update fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fine'
    });
  }
});

// Clear fine (mark as cleared)
router.post('/:id/clear', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;
    const { notes } = req.body;

    // Get current fine data
    const currentFine = await database.get(
      'SELECT * FROM fines WHERE id = ?',
      [fineId]
    );

    if (!currentFine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    // Update fine status
    await database.run(
      `UPDATE fines SET 
        marked_as_cleared = TRUE, 
        payment_status = 'paid',
        notes = ?,
        verified_by = ?,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [notes, req.user.id, fineId]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['fines', fineId, 'clear', JSON.stringify(currentFine), JSON.stringify({ marked_as_cleared: true, notes }), req.user.id]
    );

    res.json({
      success: true,
      message: 'Fine cleared successfully'
    });
  } catch (error) {
    console.error('Clear fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear fine'
    });
  }
});

// Upload payment proof
router.post('/:id/payment-proof', validateId, upload.array('payment_proof', 5), handleUploadError, async (req, res) => {
  try {
    const fineId = req.params.id;

    // Verify fine exists
    const fine = await database.get(
      'SELECT id FROM fines WHERE id = ?',
      [fineId]
    );

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocuments = [];

    for (const file of req.files) {
      const result = await database.run(
        `INSERT INTO documents (entity_type, entity_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['fine', fineId, 'payment_proof', file.originalname, file.path, file.size, file.mimetype, req.user.id]
      );

      uploadedDocuments.push({
        id: result.id,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype
      });
    }

    // Update fine with payment proof path
    await database.run(
      'UPDATE fines SET payment_proof_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.files[0].path, fineId]
    );

    res.status(201).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: { documents: uploadedDocuments }
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment proof'
    });
  }
});

// Upload evidence
router.post('/:id/evidence', validateId, upload.array('evidence', 10), handleUploadError, async (req, res) => {
  try {
    const fineId = req.params.id;

    // Verify fine exists
    const fine = await database.get(
      'SELECT id FROM fines WHERE id = ?',
      [fineId]
    );

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocuments = [];
    const evidencePaths = [];

    for (const file of req.files) {
      const result = await database.run(
        `INSERT INTO documents (entity_type, entity_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['fine', fineId, 'evidence', file.originalname, file.path, file.size, file.mimetype, req.user.id]
      );

      uploadedDocuments.push({
        id: result.id,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype
      });

      evidencePaths.push(file.path);
    }

    // Update fine with evidence paths
    await database.run(
      'UPDATE fines SET evidence_paths = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(evidencePaths), fineId]
    );

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: { documents: uploadedDocuments }
    });
  } catch (error) {
    console.error('Upload evidence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload evidence'
    });
  }
});

// Get fine statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      database.get("SELECT COUNT(*) as total FROM fines"),
      database.get("SELECT COUNT(*) as total FROM fines WHERE payment_status = 'paid'"),
      database.get("SELECT COUNT(*) as total FROM fines WHERE payment_status = 'unpaid'"),
      database.get("SELECT COUNT(*) as total FROM fines WHERE payment_status = 'overdue'"),
      database.get("SELECT SUM(amount) as total FROM fines WHERE payment_status = 'paid'"),
      database.get("SELECT SUM(amount) as total FROM fines WHERE payment_status = 'unpaid'")
    ]);

    res.json({
      success: true,
      data: {
        total_fines: stats[0].total,
        paid_fines: stats[1].total,
        unpaid_fines: stats[2].total,
        overdue_fines: stats[3].total,
        total_collected: stats[4].total || 0,
        total_outstanding: stats[5].total || 0
      }
    });
  } catch (error) {
    console.error('Get fine stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fine statistics'
    });
  }
});

module.exports = router;