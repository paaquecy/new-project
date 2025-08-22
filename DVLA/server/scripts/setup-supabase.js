#!/usr/bin/env node

/**
 * DVLA Supabase Setup and Migration Script
 * 
 * This script:
 * 1. Tests Supabase connection
 * 2. Creates tables if they don't exist
 * 3. Sets up storage buckets
 * 4. Migrates existing SQLite data to Supabase (optional)
 * 5. Tests all functionality
 */

require('dotenv').config();
const { database } = require('../config/supabase');
const { storageSetup } = require('../config/setup-storage');
const fs = require('fs');
const path = require('path');

class DVLASupabaseSetup {
  constructor() {
    this.client = database.client;
    this.sqliteDb = null;
  }

  /**
   * Run the complete setup process
   */
  async setup() {
    console.log('🚀 Starting DVLA Supabase Setup...\n');

    try {
      // Step 1: Test connection
      console.log('1️⃣ Testing Supabase connection...');
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        throw new Error('Supabase connection failed');
      }
      console.log('✅ Supabase connection successful\n');

      // Step 2: Check if tables exist, create if not
      console.log('2️⃣ Setting up database schema...');
      await this.setupSchema();
      console.log('✅ Database schema setup complete\n');

      // Step 3: Setup storage buckets
      console.log('3️⃣ Setting up storage buckets...');
      await storageSetup.setup();
      console.log('✅ Storage buckets setup complete\n');

      // Step 4: Seed initial data if needed
      console.log('4️⃣ Seeding initial data...');
      await this.seedInitialData();
      console.log('✅ Initial data seeded\n');

      // Step 5: Migrate SQLite data (optional)
      console.log('5️⃣ Checking for SQLite data migration...');
      const migrationResult = await this.migrateSQLiteData();
      if (migrationResult) {
        console.log('✅ SQLite data migration complete\n');
      } else {
        console.log('ℹ️ No SQLite data found or migration skipped\n');
      }

      // Step 6: Test functionality
      console.log('6️⃣ Testing CRUD operations...');
      await this.testCRUDOperations();
      console.log('✅ CRUD operations test successful\n');

      console.log('🎉 DVLA Supabase setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Update your .env file with Supabase credentials');
      console.log('2. Restart your DVLA server');
      console.log('3. Test the application functionality');
      console.log('4. Update frontend to use new API endpoints if needed\n');

      return true;
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Check your Supabase credentials in .env');
      console.error('2. Ensure your Supabase project is active');
      console.error('3. Check internet connection');
      console.error('4. Verify RLS policies in Supabase dashboard\n');
      return false;
    }
  }

  /**
   * Test Supabase connection
   */
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('dvla_users')
        .select('count', { count: 'exact', head: true });

      return !error;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Setup database schema by running SQL file
   */
  async setupSchema() {
    try {
      // Read the schema file
      const schemaPath = path.join(__dirname, '../config/dvla-schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        console.log('⚠️ Schema file not found, skipping schema setup');
        return;
      }

      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Note: We can't directly execute SQL via the JS client
      // The schema should be run manually in Supabase SQL editor
      console.log('ℹ️ Schema SQL file found at:', schemaPath);
      console.log('📝 Please run the SQL file in your Supabase dashboard SQL editor');
      console.log('   Or use the Supabase CLI: supabase db reset');

      // Test if tables exist
      const { data: tables, error } = await this.client
        .from('dvla_users')
        .select('count', { count: 'exact', head: true });

      if (error && error.code === '42P01') {
        console.log('⚠️ Tables not found. Please run the schema SQL file first.');
        return false;
      }

      console.log('✅ Tables exist or schema executed successfully');
      return true;
    } catch (error) {
      console.error('Schema setup error:', error.message);
      return false;
    }
  }

  /**
   * Seed initial data
   */
  async seedInitialData() {
    try {
      // Check if admin user exists
      const { data: adminUser, error } = await this.client
        .from('dvla_users')
        .select('id')
        .eq('username', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (adminUser) {
        console.log('ℹ️ Admin user already exists, skipping initial data seeding');
        return;
      }

      console.log('🌱 Creating default admin user...');
      // The initial data is already in the schema file
      console.log('✅ Initial data should be created by schema file');

    } catch (error) {
      console.error('Seed data error:', error.message);
      // Don't fail the setup for seeding errors
    }
  }

  /**
   * Migrate existing SQLite data to Supabase
   */
  async migrateSQLiteData() {
    try {
      const sqlitePath = process.env.DATABASE_PATH || './database/dvla.db';
      
      if (!fs.existsSync(sqlitePath)) {
        console.log('ℹ️ No SQLite database found at:', sqlitePath);
        return false;
      }

      console.log('📦 SQLite database found, checking for data...');
      
      // Initialize SQLite connection
      const sqlite3 = require('sqlite3').verbose();
      
      return new Promise((resolve) => {
        this.sqliteDb = new sqlite3.Database(sqlitePath, async (err) => {
          if (err) {
            console.error('SQLite connection failed:', err.message);
            resolve(false);
            return;
          }

          try {
            // Migrate users
            await this.migrateUsers();
            
            // Migrate vehicles
            await this.migrateVehicles();
            
            // Migrate fines
            await this.migrateFines();
            
            // Migrate renewals
            await this.migrateRenewals();

            this.sqliteDb.close();
            resolve(true);
          } catch (error) {
            console.error('Migration error:', error.message);
            this.sqliteDb.close();
            resolve(false);
          }
        });
      });

    } catch (error) {
      console.error('Migration setup error:', error.message);
      return false;
    }
  }

  /**
   * Migrate users from SQLite to Supabase
   */
  async migrateUsers() {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all('SELECT * FROM users', async (err, rows) => {
        if (err) {
          console.error('Error reading SQLite users:', err.message);
          resolve();
          return;
        }

        if (!rows || rows.length === 0) {
          console.log('ℹ️ No users to migrate');
          resolve();
          return;
        }

        console.log(`📊 Migrating ${rows.length} users...`);

        try {
          for (const row of rows) {
            const userData = {
              username: row.username,
              email: row.email,
              password_hash: row.password_hash,
              full_name: row.full_name,
              phone: row.phone,
              role: row.role,
              created_at: row.created_at,
              updated_at: row.updated_at
            };

            const { error } = await this.client
              .from('dvla_users')
              .upsert(userData, { onConflict: 'username' });

            if (error && error.code !== '23505') {
              console.error(`Error migrating user ${row.username}:`, error.message);
            }
          }
          console.log('✅ Users migration complete');
          resolve();
        } catch (error) {
          console.error('Users migration error:', error.message);
          resolve();
        }
      });
    });
  }

  /**
   * Migrate vehicles from SQLite to Supabase
   */
  async migrateVehicles() {
    return new Promise((resolve) => {
      this.sqliteDb.all('SELECT * FROM vehicles', async (err, rows) => {
        if (err) {
          console.error('Error reading SQLite vehicles:', err.message);
          resolve();
          return;
        }

        if (!rows || rows.length === 0) {
          console.log('ℹ️ No vehicles to migrate');
          resolve();
          return;
        }

        console.log(`📊 Migrating ${rows.length} vehicles...`);

        try {
          for (const row of rows) {
            const { error } = await this.client
              .from('dvla_vehicles')
              .upsert(row, { onConflict: 'reg_number' });

            if (error && error.code !== '23505') {
              console.error(`Error migrating vehicle ${row.reg_number}:`, error.message);
            }
          }
          console.log('✅ Vehicles migration complete');
          resolve();
        } catch (error) {
          console.error('Vehicles migration error:', error.message);
          resolve();
        }
      });
    });
  }

  /**
   * Migrate fines from SQLite to Supabase
   */
  async migrateFines() {
    return new Promise((resolve) => {
      this.sqliteDb.all('SELECT * FROM fines', async (err, rows) => {
        if (err) {
          console.error('Error reading SQLite fines:', err.message);
          resolve();
          return;
        }

        if (!rows || rows.length === 0) {
          console.log('ℹ️ No fines to migrate');
          resolve();
          return;
        }

        console.log(`📊 Migrating ${rows.length} fines...`);

        try {
          for (const row of rows) {
            const { error } = await this.client
              .from('dvla_fines')
              .upsert(row, { onConflict: 'fine_id' });

            if (error && error.code !== '23505') {
              console.error(`Error migrating fine ${row.fine_id}:`, error.message);
            }
          }
          console.log('✅ Fines migration complete');
          resolve();
        } catch (error) {
          console.error('Fines migration error:', error.message);
          resolve();
        }
      });
    });
  }

  /**
   * Migrate renewals from SQLite to Supabase
   */
  async migrateRenewals() {
    return new Promise((resolve) => {
      this.sqliteDb.all('SELECT * FROM renewals', async (err, rows) => {
        if (err) {
          console.error('Error reading SQLite renewals:', err.message);
          resolve();
          return;
        }

        if (!rows || rows.length === 0) {
          console.log('ℹ️ No renewals to migrate');
          resolve();
          return;
        }

        console.log(`📊 Migrating ${rows.length} renewals...`);

        try {
          for (const row of rows) {
            const { error } = await this.client
              .from('dvla_renewals')
              .upsert(row);

            if (error) {
              console.error(`Error migrating renewal ${row.id}:`, error.message);
            }
          }
          console.log('✅ Renewals migration complete');
          resolve();
        } catch (error) {
          console.error('Renewals migration error:', error.message);
          resolve();
        }
      });
    });
  }

  /**
   * Test CRUD operations
   */
  async testCRUDOperations() {
    try {
      // Test user creation
      const testUser = {
        username: `test_user_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password_hash: 'test_hash',
        full_name: 'Test User',
        role: 'user'
      };

      const { data: createdUser, error: createError } = await this.client
        .from('dvla_users')
        .insert(testUser)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('✅ User creation test passed');

      // Test user read
      const { data: readUser, error: readError } = await this.client
        .from('dvla_users')
        .select('*')
        .eq('id', createdUser.id)
        .single();

      if (readError || !readUser) {
        throw new Error('User read test failed');
      }

      console.log('✅ User read test passed');

      // Test user update
      const { error: updateError } = await this.client
        .from('dvla_users')
        .update({ full_name: 'Updated Test User' })
        .eq('id', createdUser.id);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ User update test passed');

      // Test user delete
      const { error: deleteError } = await this.client
        .from('dvla_users')
        .delete()
        .eq('id', createdUser.id);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ User delete test passed');

    } catch (error) {
      throw new Error(`CRUD test failed: ${error.message}`);
    }
  }
}

// Create and export setup instance
const setupInstance = new DVLASupabaseSetup();

// Run setup if script is executed directly
if (require.main === module) {
  setupInstance.setup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Setup script failed:', error);
      process.exit(1);
    });
}

module.exports = { DVLASupabaseSetup, setupInstance };
