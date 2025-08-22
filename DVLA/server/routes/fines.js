const express = require('express');
const { database, TABLES, PAYMENT_STATUS } = require('../config/supabase');
const { validateFine, validateId, validateQuery } = require('../middleware/validation');
const { supabaseUploadMiddleware, saveFileMetadata } = require('../middleware/supabaseUpload');

const router = express.Router();

// Get all fines with pagination and filtering
router.get('/', validateQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build query with joins
    let query = database.client
      .from(TABLES.FINES)
      .select(`
        id, fine_id, offense_description, offense_date, offense_location,
        amount, payment_status, payment_method, marked_as_cleared, created_at,
        dvla_vehicles:vehicle_id (
          license_plate, manufacturer, model, owner_name
        )
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`fine_id.ilike.%${search}%,dvla_vehicles.license_plate.ilike.%${search}%,dvla_vehicles.owner_name.ilike.%${search}%`);
    }

    // Apply status filter
    if (status && status !== 'All') {
      query = query.eq('payment_status', status.toLowerCase());
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: fines, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        fines: fines || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fines',
      error: error.message
    });
  }
});

// Get fine by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;

    const { data: fine, error } = await database.client
      .from(TABLES.FINES)
      .select(`
        *,
        dvla_vehicles:vehicle_id (
          id, reg_number, license_plate, manufacturer, model, 
          owner_name, owner_address, owner_phone, owner_email
        )
      `)
      .eq('id', fineId)
      .single();

    if (error) {
      throw error;
    }

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    // Get associated documents
    const { data: documents, error: documentsError } = await database.client
      .from(TABLES.DOCUMENTS)
      .select('*')
      .eq('entity_type', 'fine')
      .eq('entity_id', fineId);

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
    }

    res.json({
      success: true,
      data: {
        fine,
        documents: documents || []
      }
    });
  } catch (error) {
    console.error('Get fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fine',
      error: error.message
    });
  }
});

// Create new fine
router.post('/', validateFine, async (req, res) => {
  try {
    const fineData = {
      ...req.body,
      created_by: req.user?.id || null,
      payment_status: PAYMENT_STATUS.UNPAID
    };

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await database.client
      .from(TABLES.VEHICLES)
      .select('id')
      .eq('id', fineData.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const { data: fine, error } = await database.client
      .from(TABLES.FINES)
      .insert(fineData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await database.logAudit(
      TABLES.FINES,
      fine.id,
      'INSERT',
      null,
      fineData,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: 'Fine created successfully',
      data: {
        id: fine.id,
        fine_id: fine.fine_id
      }
    });
  } catch (error) {
    console.error('Create fine error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Fine with this ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create fine',
      error: error.message
    });
  }
});

// Update fine
router.put('/:id', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;

    // Get current fine data for audit log
    const { data: currentFine, error: fetchError } = await database.client
      .from(TABLES.FINES)
      .select('*')
      .eq('id', fineId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

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

    const { data: updatedFine, error: updateError } = await database.client
      .from(TABLES.FINES)
      .update(updateData)
      .eq('id', fineId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await database.logAudit(
      TABLES.FINES,
      fineId,
      'UPDATE',
      currentFine,
      updateData,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Fine updated successfully',
      data: updatedFine
    });
  } catch (error) {
    console.error('Update fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fine',
      error: error.message
    });
  }
});

// Delete fine
router.delete('/:id', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;

    // Get fine data for audit log
    const { data: fine, error: fetchError } = await database.client
      .from(TABLES.FINES)
      .select('*')
      .eq('id', fineId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    // Delete fine
    const { error: deleteError } = await database.client
      .from(TABLES.FINES)
      .delete()
      .eq('id', fineId);

    if (deleteError) {
      throw deleteError;
    }

    // Log the action
    await database.logAudit(
      TABLES.FINES,
      fineId,
      'DELETE',
      fine,
      null,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Fine deleted successfully'
    });
  } catch (error) {
    console.error('Delete fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fine',
      error: error.message
    });
  }
});

// Mark fine as paid
router.put('/:id/pay', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;
    const { payment_method, transaction_id, notes } = req.body;

    // Get current fine
    const { data: fine, error: fetchError } = await database.client
      .from(TABLES.FINES)
      .select('*')
      .eq('id', fineId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    if (fine.payment_status === PAYMENT_STATUS.PAID) {
      return res.status(400).json({
        success: false,
        message: 'Fine is already marked as paid'
      });
    }

    const updateData = {
      payment_status: PAYMENT_STATUS.PAID,
      payment_method: payment_method || 'cash',
      notes: notes || null,
      updated_at: new Date().toISOString()
    };

    const { data: updatedFine, error: updateError } = await database.client
      .from(TABLES.FINES)
      .update(updateData)
      .eq('id', fineId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await database.logAudit(
      TABLES.FINES,
      fineId,
      'UPDATE',
      fine,
      { action: 'marked_as_paid', ...updateData },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Fine marked as paid successfully',
      data: updatedFine
    });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark fine as paid',
      error: error.message
    });
  }
});

// Mark fine as cleared
router.put('/:id/clear', validateId, async (req, res) => {
  try {
    const fineId = req.params.id;

    // Get current fine
    const { data: fine, error: fetchError } = await database.client
      .from(TABLES.FINES)
      .select('*')
      .eq('id', fineId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    const updateData = {
      marked_as_cleared: true,
      updated_at: new Date().toISOString()
    };

    const { data: updatedFine, error: updateError } = await database.client
      .from(TABLES.FINES)
      .update(updateData)
      .eq('id', fineId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await database.logAudit(
      TABLES.FINES,
      fineId,
      'UPDATE',
      fine,
      { action: 'marked_as_cleared' },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Fine marked as cleared successfully',
      data: updatedFine
    });
  } catch (error) {
    console.error('Clear fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark fine as cleared',
      error: error.message
    });
  }
});

// Upload payment proof
router.post('/:id/payment-proof', validateId, supabaseUploadMiddleware('payment-proof', 'proof'), async (req, res) => {
  try {
    const fineId = req.params.id;

    // Verify fine exists
    const { data: fine, error: fineError } = await database.client
      .from(TABLES.FINES)
      .select('id')
      .eq('id', fineId)
      .single();

    if (fineError || !fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    if (!req.uploadResult) {
      return res.status(400).json({
        success: false,
        message: 'No payment proof uploaded'
      });
    }

    // Save file metadata to database
    const documentData = await saveFileMetadata(
      req.uploadResult,
      'fine',
      fineId,
      'payment_proof',
      req.user?.id
    );

    // Update fine with payment proof URL
    const { error: updateError } = await database.client
      .from(TABLES.FINES)
      .update({ 
        payment_proof_url: req.uploadResult.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', fineId);

    if (updateError) {
      throw updateError;
    }

    res.status(201).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: {
        document: {
          id: documentData.id,
          file_name: req.uploadResult.originalName,
          file_url: req.uploadResult.publicUrl,
          file_size: req.uploadResult.fileSize,
          mime_type: req.uploadResult.mimeType
        }
      }
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment proof',
      error: error.message
    });
  }
});

// Get fine statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Get fines by payment status
    const { data: fines, error } = await database.client
      .from(TABLES.FINES)
      .select('payment_status, amount');

    if (error) {
      throw error;
    }

    // Calculate statistics
    const stats = (fines || []).reduce((acc, fine) => {
      acc.total_fines++;
      acc.total_amount += parseFloat(fine.amount) || 0;
      
      if (fine.payment_status === PAYMENT_STATUS.PAID) {
        acc.paid_fines++;
        acc.paid_amount += parseFloat(fine.amount) || 0;
      } else if (fine.payment_status === PAYMENT_STATUS.UNPAID) {
        acc.unpaid_fines++;
        acc.unpaid_amount += parseFloat(fine.amount) || 0;
      }
      
      return acc;
    }, {
      total_fines: 0,
      paid_fines: 0,
      unpaid_fines: 0,
      total_amount: 0,
      paid_amount: 0,
      unpaid_amount: 0
    });

    // Get fines created today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayFines, error: todayError, count: todayCount } = await database.client
      .from(TABLES.FINES)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (todayError) {
      console.error('Error fetching today stats:', todayError);
    }

    res.json({
      success: true,
      data: {
        ...stats,
        new_today: todayCount || 0,
        collection_rate: stats.total_fines > 0 ? (stats.paid_fines / stats.total_fines * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get fine stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fine statistics',
      error: error.message
    });
  }
});

// Search fines by fine ID or license plate
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;

    const { data: fines, error } = await database.client
      .from(TABLES.FINES)
      .select(`
        id, fine_id, offense_description, amount, payment_status, created_at,
        dvla_vehicles:vehicle_id (
          license_plate, manufacturer, model, owner_name
        )
      `)
      .or(`fine_id.ilike.%${query}%,dvla_vehicles.license_plate.ilike.%${query}%`)
      .limit(10)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        fines: fines || [],
        query
      }
    });
  } catch (error) {
    console.error('Search fines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search fines',
      error: error.message
    });
  }
});

module.exports = router;
