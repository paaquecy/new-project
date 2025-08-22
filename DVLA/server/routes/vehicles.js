const express = require('express');
const { database, TABLES, VEHICLE_STATUS } = require('../config/supabase');
const { validateVehicle, validateId, validateQuery } = require('../middleware/validation');
const { supabaseUploadMultipleMiddleware, saveFileMetadata } = require('../middleware/supabaseUpload');

const router = express.Router();

// Get all vehicles with pagination and search
router.get('/', validateQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build query with filters
    let query = database.client
      .from(TABLES.VEHICLES)
      .select('id, reg_number, manufacturer, model, vehicle_type, license_plate, owner_name, owner_phone, owner_email, status, created_at', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`reg_number.ilike.%${search}%,license_plate.ilike.%${search}%,owner_name.ilike.%${search}%,manufacturer.ilike.%${search}%,model.ilike.%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: vehicles, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        vehicles: vehicles || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
});

// Get vehicle by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Get vehicle data
    const { data: vehicle, error: vehicleError } = await database.client
      .from(TABLES.VEHICLES)
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (vehicleError) {
      throw vehicleError;
    }

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get associated documents
    const { data: documents, error: documentsError } = await database.client
      .from(TABLES.DOCUMENTS)
      .select('*')
      .eq('entity_type', 'vehicle')
      .eq('entity_id', vehicleId);

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
    }

    res.json({
      success: true,
      data: {
        vehicle,
        documents: documents || []
      }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
});

// Create new vehicle
router.post('/', validateVehicle, async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      created_by: req.user?.id || null,
      status: VEHICLE_STATUS.ACTIVE
    };

    const { data: vehicle, error } = await database.client
      .from(TABLES.VEHICLES)
      .insert(vehicleData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await database.logAudit(
      TABLES.VEHICLES,
      vehicle.id,
      'INSERT',
      null,
      vehicleData,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      data: {
        id: vehicle.id,
        reg_number: vehicle.reg_number
      }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Vehicle with this registration number, VIN, or license plate already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register vehicle',
      error: error.message
    });
  }
});

// Update vehicle
router.put('/:id', validateId, async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Get current vehicle data for audit log
    const { data: currentVehicle, error: fetchError } = await database.client
      .from(TABLES.VEHICLES)
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

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

    const { data: updatedVehicle, error: updateError } = await database.client
      .from(TABLES.VEHICLES)
      .update(updateData)
      .eq('id', vehicleId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await database.logAudit(
      TABLES.VEHICLES,
      vehicleId,
      'UPDATE',
      currentVehicle,
      updateData,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
});

// Delete vehicle (soft delete)
router.delete('/:id', validateId, async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Get vehicle data for audit log
    const { data: vehicle, error: fetchError } = await database.client
      .from(TABLES.VEHICLES)
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Soft delete by updating status
    const { error: updateError } = await database.client
      .from(TABLES.VEHICLES)
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await database.logAudit(
      TABLES.VEHICLES,
      vehicleId,
      'DELETE',
      vehicle,
      null,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
});

// Upload vehicle documents
router.post('/:id/documents', validateId, supabaseUploadMultipleMiddleware('document', 'documents', 10), async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { document_type } = req.body;

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await database.client
      .from(TABLES.VEHICLES)
      .select('id')
      .eq('id', vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (!req.uploadResults || req.uploadResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocuments = [];

    // Save file metadata to database
    for (const uploadResult of req.uploadResults) {
      try {
        const documentData = await saveFileMetadata(
          uploadResult,
          'vehicle',
          vehicleId,
          document_type || 'general',
          req.user?.id
        );
        
        uploadedDocuments.push({
          id: documentData.id,
          file_name: uploadResult.originalName,
          file_size: uploadResult.fileSize,
          mime_type: uploadResult.mimeType,
          file_url: uploadResult.publicUrl
        });
      } catch (metadataError) {
        console.error('Failed to save file metadata:', metadataError);
      }
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
      message: 'Failed to upload documents',
      error: error.message
    });
  }
});

// Get vehicle statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Get total vehicles by status
    const { data: statusStats, error: statusError } = await database.client
      .rpc('get_vehicle_statistics');

    if (statusError) {
      throw statusError;
    }

    // Get vehicles created today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayVehicles, error: todayError, count: todayCount } = await database.client
      .from(TABLES.VEHICLES)
      .select('id', { count: 'exact', head: true })
      .eq('status', VEHICLE_STATUS.ACTIVE)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (todayError) {
      console.error('Error fetching today stats:', todayError);
    }

    // Get vehicles by type
    const { data: typeStats, error: typeError } = await database.client
      .from(TABLES.VEHICLES)
      .select('vehicle_type')
      .eq('status', VEHICLE_STATUS.ACTIVE);

    if (typeError) {
      console.error('Error fetching type stats:', typeError);
    }

    // Count by type
    const typeCounts = (typeStats || []).reduce((acc, vehicle) => {
      acc[vehicle.vehicle_type] = (acc[vehicle.vehicle_type] || 0) + 1;
      return acc;
    }, {});

    const stats = statusStats && statusStats.length > 0 ? statusStats[0] : {
      total_vehicles: 0,
      active_vehicles: 0,
      expired_vehicles: 0,
      suspended_vehicles: 0
    };

    res.json({
      success: true,
      data: {
        total_vehicles: stats.total_vehicles || 0,
        active_vehicles: stats.active_vehicles || 0,
        expired_vehicles: stats.expired_vehicles || 0,
        suspended_vehicles: stats.suspended_vehicles || 0,
        new_today: todayCount || 0,
        by_type: {
          sedan: typeCounts.sedan || 0,
          suv: typeCounts.suv || 0,
          truck: typeCounts.truck || 0,
          other: Object.entries(typeCounts)
            .filter(([type]) => !['sedan', 'suv', 'truck'].includes(type))
            .reduce((sum, [, count]) => sum + count, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle statistics',
      error: error.message
    });
  }
});

// Search vehicles by plate number or registration
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;

    const { data: vehicles, error } = await database.client
      .from(TABLES.VEHICLES)
      .select('*')
      .or(`license_plate.ilike.%${query}%,reg_number.ilike.%${query}%`)
      .eq('status', VEHICLE_STATUS.ACTIVE)
      .limit(10);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        vehicles: vehicles || [],
        query
      }
    });
  } catch (error) {
    console.error('Search vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search vehicles',
      error: error.message
    });
  }
});

module.exports = router;
