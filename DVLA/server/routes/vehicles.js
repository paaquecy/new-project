const express = require('express');
const { database } = require('../config/database');
const { validateVehicle, validateId, validateQuery } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get all vehicles with pagination and search
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
      whereClause += ' AND (reg_number LIKE ? OR license_plate LIKE ? OR owner_name LIKE ? OR manufacturer LIKE ? OR model LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // Get total count
    const countResult = await database.get(
      `SELECT COUNT(*) as total FROM vehicles ${whereClause}`,
      params
    );

    // Get vehicles
    const vehicles = await database.all(
      `SELECT 
        id, reg_number, manufacturer, model, vehicle_type, license_plate,
        owner_name, owner_phone, owner_email, status, created_at
       FROM vehicles 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles'
    });
  }
});

// Get vehicle by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const vehicle = await database.get(
      'SELECT * FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get associated documents
    const documents = await database.all(
      'SELECT * FROM documents WHERE entity_type = ? AND entity_id = ?',
      ['vehicle', req.params.id]
    );

    res.json({
      success: true,
      data: {
        vehicle,
        documents
      }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle'
    });
  }
});

// Create new vehicle
router.post('/', validateVehicle, async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      created_by: req.user.id,
      status: 'active'
    };

    const result = await database.run(
      `INSERT INTO vehicles (
        reg_number, manufacturer, model, vehicle_type, chassis_number,
        year_of_manufacture, vin, license_plate, color, use_type,
        date_of_entry, length_cm, width_cm, height_cm, number_of_axles,
        number_of_wheels, tyre_size_front, tyre_size_middle, tyre_size_rear,
        axle_load_front_kg, axle_load_middle_kg, axle_load_rear_kg, weight_kg,
        engine_make, engine_number, number_of_cylinders, engine_cc, horse_power,
        owner_name, owner_address, owner_phone, owner_email, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicleData.reg_number, vehicleData.manufacturer, vehicleData.model,
        vehicleData.vehicle_type, vehicleData.chassis_number, vehicleData.year_of_manufacture,
        vehicleData.vin, vehicleData.license_plate, vehicleData.color, vehicleData.use_type,
        vehicleData.date_of_entry, vehicleData.length_cm, vehicleData.width_cm,
        vehicleData.height_cm, vehicleData.number_of_axles, vehicleData.number_of_wheels,
        vehicleData.tyre_size_front, vehicleData.tyre_size_middle, vehicleData.tyre_size_rear,
        vehicleData.axle_load_front_kg, vehicleData.axle_load_middle_kg, vehicleData.axle_load_rear_kg,
        vehicleData.weight_kg, vehicleData.engine_make, vehicleData.engine_number,
        vehicleData.number_of_cylinders, vehicleData.engine_cc, vehicleData.horse_power,
        vehicleData.owner_name, vehicleData.owner_address, vehicleData.owner_phone,
        vehicleData.owner_email, vehicleData.status, vehicleData.created_by
      ]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      ['vehicles', result.id, 'create', JSON.stringify(vehicleData), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      data: {
        id: result.id,
        reg_number: vehicleData.reg_number
      }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        success: false,
        message: 'Vehicle with this registration number, VIN, or license plate already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register vehicle'
    });
  }
});

// Update vehicle
router.put('/:id', validateId, async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Get current vehicle data for audit log
    const currentVehicle = await database.get(
      'SELECT * FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (!currentVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
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
    values.push(vehicleId);

    await database.run(
      `UPDATE vehicles SET ${setClause} WHERE id = ?`,
      values
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['vehicles', vehicleId, 'update', JSON.stringify(currentVehicle), JSON.stringify(updateData), req.user.id]
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle'
    });
  }
});

// Delete vehicle
router.delete('/:id', validateId, async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Get vehicle data for audit log
    const vehicle = await database.get(
      'SELECT * FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Soft delete by updating status
    await database.run(
      'UPDATE vehicles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['deleted', vehicleId]
    );

    // Log the action
    await database.run(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      ['vehicles', vehicleId, 'delete', JSON.stringify(vehicle), req.user.id]
    );

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle'
    });
  }
});

// Upload vehicle documents
router.post('/:id/documents', validateId, upload.array('documents', 10), handleUploadError, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { document_type } = req.body;

    // Verify vehicle exists
    const vehicle = await database.get(
      'SELECT id FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
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
        ['vehicle', vehicleId, document_type, file.originalname, file.path, file.size, file.mimetype, req.user.id]
      );

      uploadedDocuments.push({
        id: result.id,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype
      });
    }

    res.status(201).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: { documents: uploadedDocuments }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents'
    });
  }
});

// Get vehicle statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE status = 'active'"),
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE status = 'active' AND date(created_at) = date('now')"),
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE vehicle_type = 'sedan' AND status = 'active'"),
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE vehicle_type = 'suv' AND status = 'active'"),
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE vehicle_type = 'truck' AND status = 'active'")
    ]);

    res.json({
      success: true,
      data: {
        total_vehicles: stats[0].total,
        new_today: stats[1].total,
        by_type: {
          sedan: stats[2].total,
          suv: stats[3].total,
          truck: stats[4].total
        }
      }
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle statistics'
    });
  }
});

module.exports = router;