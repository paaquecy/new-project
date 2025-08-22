const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseConfig {
  constructor() {
    this.url = process.env.SUPABASE_URL;
    this.serviceKey = process.env.SUPABASE_SERVICE_KEY;
    this.anonKey = process.env.SUPABASE_ANON_KEY;
    
    this.validateConfig();
    this.client = this.createClient();
  }

  validateConfig() {
    if (!this.url) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    if (!this.serviceKey) {
      throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
    }
    if (!this.url.startsWith('https://')) {
      throw new Error('SUPABASE_URL must start with https://');
    }
    if (!this.url.includes('.supabase.co')) {
      throw new Error('SUPABASE_URL must be a valid Supabase URL');
    }
    
    console.log('✅ Supabase configuration validated');
  }

  createClient() {
    try {
      const client = createClient(this.url, this.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('✅ Supabase client created successfully');
      return client;
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('dvla_users')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
  }
}

// Database table names for DVLA
const TABLES = {
  USERS: 'dvla_users',
  VEHICLES: 'dvla_vehicles',
  RENEWALS: 'dvla_renewals',
  FINES: 'dvla_fines',
  DOCUMENTS: 'dvla_documents',
  AUDIT_LOGS: 'dvla_audit_logs'
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  OFFICER: 'officer'
};

// Vehicle statuses
const VEHICLE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
};

// Renewal statuses
const RENEWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Fine payment statuses
const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue'
};

// Storage buckets
const STORAGE_BUCKETS = {
  DOCUMENTS: 'dvla-documents',
  EVIDENCE: 'dvla-evidence',
  PAYMENT_PROOFS: 'dvla-payment-proofs'
};

// Database wrapper class
class DVLADatabase {
  constructor() {
    this.config = new SupabaseConfig();
    this.client = this.config.client;
  }

  // Generic query methods
  async insert(table, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Insert error for table ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  async update(table, id, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Update error for table ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  async delete(table, id) {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Delete error for table ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  async findById(table, id) {
    try {
      const { data, error } = await this.client
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Find by ID error for table ${table}:`, error);
      return null;
    }
  }

  async findAll(table, options = {}) {
    try {
      let query = this.client.from(table).select('*');
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending !== false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Find all error for table ${table}:`, error);
      return [];
    }
  }

  async findByField(table, field, value) {
    try {
      const { data, error } = await this.client
        .from(table)
        .select('*')
        .eq(field, value);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Find by field error for table ${table}:`, error);
      return [];
    }
  }

  // Audit logging
  async logAudit(tableName, recordId, action, oldValues = null, newValues = null, userId = null) {
    try {
      await this.insert(TABLES.AUDIT_LOGS, {
        table_name: tableName,
        record_id: recordId,
        action,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  // Test connection
  async testConnection() {
    return await this.config.testConnection();
  }
}

// Create singleton instance
const database = new DVLADatabase();

module.exports = {
  database,
  TABLES,
  USER_ROLES,
  VEHICLE_STATUS,
  RENEWAL_STATUS,
  PAYMENT_STATUS,
  STORAGE_BUCKETS,
  DVLADatabase
};
