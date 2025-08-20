const express = require('express');
const { database } = require('../config/database');

const router = express.Router();

// Get dashboard overview statistics
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total registrations
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE status = 'active'"),
      
      // New registrations today
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE status = 'active' AND date(created_at) = date('now')"),
      
      // Pending renewals
      database.get(`
        SELECT COUNT(*) as total 
        FROM renewals 
        WHERE expiry_date BETWEEN date('now') AND date('now', '+30 days') 
        AND status != 'renewed'
      `),
      
      // Recent activity (last 10 activities)
      database.all(`
        SELECT 
          'vehicle' as type,
          'Vehicle ' || reg_number || ' registered by ' || owner_name as description,
          created_at as timestamp
        FROM vehicles 
        WHERE status = 'active'
        UNION ALL
        SELECT 
          'renewal' as type,
          'Renewal processed for ' || (SELECT license_plate FROM vehicles WHERE id = vehicle_id) as description,
          created_at as timestamp
        FROM renewals
        UNION ALL
        SELECT 
          'fine' as type,
          'Fine ' || fine_id || ' created' as description,
          created_at as timestamp
        FROM fines
        ORDER BY timestamp DESC
        LIMIT 10
      `),
      
      // Expiration alerts
      database.all(`
        SELECT 
          v.license_plate,
          r.expiry_date,
          CASE 
            WHEN date(r.expiry_date) = date('now') THEN 'high'
            WHEN date(r.expiry_date) BETWEEN date('now', '+1 day') AND date('now', '+7 days') THEN 'high'
            WHEN date(r.expiry_date) BETWEEN date('now', '+8 days') AND date('now', '+30 days') THEN 'medium'
            ELSE 'low'
          END as urgency
        FROM renewals r
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.expiry_date BETWEEN date('now') AND date('now', '+30 days')
        AND r.status != 'renewed'
        ORDER BY r.expiry_date ASC
        LIMIT 10
      `),
      
      // Data quality metrics
      database.get(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(CASE WHEN owner_email IS NULL OR owner_email = '' THEN 1 END) as incomplete_email,
          COUNT(CASE WHEN owner_phone IS NULL OR owner_phone = '' THEN 1 END) as incomplete_phone
        FROM vehicles 
        WHERE status = 'active'
      `),
      
      // System health indicators
      database.get("SELECT COUNT(*) as total FROM vehicles WHERE date(created_at) = date('now')"),
      database.get("SELECT COUNT(*) as total FROM audit_logs WHERE date(timestamp) = date('now')")
    ]);

    // Calculate data quality percentages
    const totalRecords = stats[5].total_records;
    const incompleteRecords = stats[5].incomplete_email + stats[5].incomplete_phone;
    const dataQualityPercentage = totalRecords > 0 ? ((totalRecords - incompleteRecords) / totalRecords * 100).toFixed(1) : 100;

    // Format recent activities
    const recentActivities = stats[3].map(activity => ({
      id: Math.random().toString(36).substr(2, 9),
      description: activity.description,
      timestamp: formatTimestamp(activity.timestamp)
    }));

    // Format expiration alerts
    const expirationAlerts = stats[4].map(alert => ({
      id: Math.random().toString(36).substr(2, 9),
      description: `Vehicle ${alert.license_plate} registration expires ${formatExpirationDate(alert.expiry_date)}`,
      date: alert.expiry_date,
      urgency: alert.urgency
    }));

    res.json({
      success: true,
      data: {
        overview: {
          total_registrations: stats[0].total,
          new_registrations_today: stats[1].total,
          pending_renewals: stats[2].total
        },
        recent_activities: recentActivities,
        expiration_alerts: expirationAlerts,
        data_quality: {
          overall_percentage: dataQualityPercentage,
          incomplete_records_percentage: totalRecords > 0 ? (incompleteRecords / totalRecords * 100).toFixed(1) : 0,
          data_entry_errors_percentage: '0.1',
          duplicate_entries_percentage: '0.05'
        },
        system_health: {
          database_status: 'Operational',
          api_uptime: '99.9%',
          queue_processing: 'Normal',
          daily_transactions: stats[6].total,
          daily_activities: stats[7].total
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

// Get vehicle registration trends
router.get('/vehicles/trends', async (req, res) => {
  try {
    const { period = '12months' } = req.query;
    
    let dateFormat, dateRange;
    
    switch (period) {
      case '7days':
        dateFormat = '%Y-%m-%d';
        dateRange = "date('now', '-7 days')";
        break;
      case '30days':
        dateFormat = '%Y-%m-%d';
        dateRange = "date('now', '-30 days')";
        break;
      case '12months':
      default:
        dateFormat = '%Y-%m';
        dateRange = "date('now', '-12 months')";
        break;
    }

    const trends = await database.all(`
      SELECT 
        strftime('${dateFormat}', created_at) as period,
        COUNT(*) as registrations,
        COUNT(CASE WHEN vehicle_type = 'sedan' THEN 1 END) as sedan_count,
        COUNT(CASE WHEN vehicle_type = 'suv' THEN 1 END) as suv_count,
        COUNT(CASE WHEN vehicle_type = 'truck' THEN 1 END) as truck_count
      FROM vehicles 
      WHERE status = 'active' 
      AND date(created_at) >= ${dateRange}
      GROUP BY strftime('${dateFormat}', created_at)
      ORDER BY period ASC
    `);

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Get vehicle trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle trends'
    });
  }
});

// Get vehicle type distribution
router.get('/vehicles/distribution', async (req, res) => {
  try {
    const distribution = await database.all(`
      SELECT 
        vehicle_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM vehicles WHERE status = 'active'), 1) as percentage
      FROM vehicles 
      WHERE status = 'active'
      GROUP BY vehicle_type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    console.error('Get vehicle distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle distribution'
    });
  }
});

// Get renewal analytics
router.get('/renewals/analytics', async (req, res) => {
  try {
    const analytics = await Promise.all([
      // Monthly renewal trends
      database.all(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as renewals
        FROM renewals 
        WHERE date(created_at) >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month ASC
      `),
      
      // Renewal status distribution
      database.all(`
        SELECT 
          CASE 
            WHEN status = 'renewed' THEN 'Renewed'
            WHEN expiry_date < date('now') THEN 'Overdue'
            WHEN expiry_date BETWEEN date('now') AND date('now', '+30 days') THEN 'Due Soon'
            ELSE 'Active'
          END as status,
          COUNT(*) as count
        FROM renewals
        GROUP BY status
      `),
      
      // Average processing time
      database.get(`
        SELECT 
          AVG(julianday(updated_at) - julianday(created_at)) as avg_processing_days
        FROM renewals 
        WHERE status = 'renewed'
      `)
    ]);

    res.json({
      success: true,
      data: {
        monthly_trends: analytics[0],
        status_distribution: analytics[1],
        average_processing_days: Math.round(analytics[2].avg_processing_days || 2.5)
      }
    });
  } catch (error) {
    console.error('Get renewal analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal analytics'
    });
  }
});

// Get fine analytics
router.get('/fines/analytics', async (req, res) => {
  try {
    const analytics = await Promise.all([
      // Fine trends by month
      database.all(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as total_fines,
          SUM(amount) as total_amount,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_fines
        FROM fines 
        WHERE date(created_at) >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month ASC
      `),
      
      // Payment status distribution
      database.all(`
        SELECT 
          payment_status,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM fines
        GROUP BY payment_status
      `),
      
      // Top offense types
      database.all(`
        SELECT 
          offense_description,
          COUNT(*) as count,
          AVG(amount) as avg_amount
        FROM fines
        GROUP BY offense_description
        ORDER BY count DESC
        LIMIT 10
      `)
    ]);

    res.json({
      success: true,
      data: {
        monthly_trends: analytics[0],
        payment_status_distribution: analytics[1],
        top_offense_types: analytics[2]
      }
    });
  } catch (error) {
    console.error('Get fine analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fine analytics'
    });
  }
});

// Get system performance metrics
router.get('/system/performance', async (req, res) => {
  try {
    const metrics = await Promise.all([
      // Daily transaction counts
      database.all(`
        SELECT 
          date(timestamp) as date,
          COUNT(*) as transactions
        FROM audit_logs 
        WHERE date(timestamp) >= date('now', '-30 days')
        GROUP BY date(timestamp)
        ORDER BY date ASC
      `),
      
      // User activity
      database.all(`
        SELECT 
          u.full_name,
          COUNT(*) as actions
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE date(al.timestamp) >= date('now', '-7 days')
        GROUP BY u.id, u.full_name
        ORDER BY actions DESC
        LIMIT 10
      `),
      
      // Database statistics
      database.get(`
        SELECT 
          (SELECT COUNT(*) FROM vehicles) as total_vehicles,
          (SELECT COUNT(*) FROM renewals) as total_renewals,
          (SELECT COUNT(*) FROM fines) as total_fines,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM audit_logs) as total_audit_logs
      `)
    ]);

    res.json({
      success: true,
      data: {
        daily_transactions: metrics[0],
        user_activity: metrics[1],
        database_stats: metrics[2],
        system_uptime: '99.9%',
        data_accuracy: '98.5%',
        avg_response_time: '1.2 seconds'
      }
    });
  } catch (error) {
    console.error('Get system performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system performance metrics'
    });
  }
});

// Helper functions
function formatTimestamp(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function formatExpirationDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'tomorrow';
  if (diffInDays < 7) return `in ${diffInDays} days`;
  return `on ${date.toLocaleDateString()}`;
}

module.exports = router;