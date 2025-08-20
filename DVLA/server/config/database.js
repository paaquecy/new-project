const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './database/dvla.db';
const DB_DIR = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

const database = new Database();

const initializeDatabase = async () => {
  try {
    await database.connect();
    await createTables();
    await seedInitialData();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Vehicles table
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reg_number VARCHAR(20) UNIQUE NOT NULL,
      manufacturer VARCHAR(50) NOT NULL,
      model VARCHAR(50) NOT NULL,
      vehicle_type VARCHAR(30) NOT NULL,
      chassis_number VARCHAR(50) UNIQUE NOT NULL,
      year_of_manufacture INTEGER NOT NULL,
      vin VARCHAR(17) UNIQUE NOT NULL,
      license_plate VARCHAR(20) UNIQUE NOT NULL,
      color VARCHAR(30) NOT NULL,
      use_type VARCHAR(20) NOT NULL,
      date_of_entry DATE NOT NULL,
      length_cm INTEGER,
      width_cm INTEGER,
      height_cm INTEGER,
      number_of_axles INTEGER,
      number_of_wheels INTEGER,
      tyre_size_front VARCHAR(20),
      tyre_size_middle VARCHAR(20),
      tyre_size_rear VARCHAR(20),
      axle_load_front_kg INTEGER,
      axle_load_middle_kg INTEGER,
      axle_load_rear_kg INTEGER,
      weight_kg INTEGER,
      engine_make VARCHAR(50),
      engine_number VARCHAR(50),
      number_of_cylinders INTEGER,
      engine_cc INTEGER,
      horse_power INTEGER,
      owner_name VARCHAR(100) NOT NULL,
      owner_address TEXT NOT NULL,
      owner_phone VARCHAR(20) NOT NULL,
      owner_email VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Renewals table
    `CREATE TABLE IF NOT EXISTS renewals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      renewal_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      amount_paid DECIMAL(10,2),
      payment_method VARCHAR(30),
      transaction_id VARCHAR(50),
      notes TEXT,
      processed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (processed_by) REFERENCES users(id)
    )`,

    // Fines table
    `CREATE TABLE IF NOT EXISTS fines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fine_id VARCHAR(20) UNIQUE NOT NULL,
      vehicle_id INTEGER NOT NULL,
      offense_description TEXT NOT NULL,
      offense_date DATETIME NOT NULL,
      offense_location TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_status VARCHAR(20) DEFAULT 'unpaid',
      payment_method VARCHAR(30),
      payment_proof_path VARCHAR(255),
      marked_as_cleared BOOLEAN DEFAULT FALSE,
      notes TEXT,
      evidence_paths TEXT,
      created_by INTEGER,
      verified_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (verified_by) REFERENCES users(id)
    )`,

    // Audit logs table
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name VARCHAR(50) NOT NULL,
      record_id INTEGER NOT NULL,
      action VARCHAR(20) NOT NULL,
      old_values TEXT,
      new_values TEXT,
      user_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Documents table
    `CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type VARCHAR(20) NOT NULL,
      entity_id INTEGER NOT NULL,
      document_type VARCHAR(50) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )`
  ];

  for (const table of tables) {
    await database.run(table);
  }

  // Add phone column to existing users table if it doesn't exist
  try {
    await database.run('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
    console.log('✅ Added phone column to users table');
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column name')) {
      console.log('Phone column already exists or other error:', error.message);
    }
  }
};

const seedInitialData = async () => {
  // Check if admin user exists
  const adminUser = await database.get('SELECT id FROM users WHERE username = ?', ['admin']);
  
  if (!adminUser) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await database.run(
      `INSERT INTO users (username, email, password_hash, full_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@dvla.gov.uk', hashedPassword, 'System Administrator', 'admin']
    );
    
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  }

  // Seed sample vehicles if none exist
  const vehicleCount = await database.get('SELECT COUNT(*) as count FROM vehicles');
  
  if (vehicleCount.count === 0) {
    const sampleVehicles = [
      {
        reg_number: 'ABC123',
        manufacturer: 'Toyota',
        model: 'Camry',
        vehicle_type: 'sedan',
        chassis_number: 'JHMNC5K1KJ1234567',
        year_of_manufacture: 2020,
        vin: '1AZBCBUSB3M123BH0',
        license_plate: 'ABC 123',
        color: 'Blue',
        use_type: 'private',
        date_of_entry: '2023-01-15',
        owner_name: 'Jane Doe',
        owner_address: '123 Main St, London',
        owner_phone: '+44 7700 900123',
        owner_email: 'jane.doe@example.com',
        created_by: 1
      },
      {
        reg_number: 'XYZ789',
        manufacturer: 'Honda',
        model: 'Civic',
        vehicle_type: 'sedan',
        chassis_number: 'JHMNC5K1KJ7890123',
        year_of_manufacture: 2019,
        vin: '1AZBCBUSB3M789BH0',
        license_plate: 'XYZ 789',
        color: 'Red',
        use_type: 'private',
        date_of_entry: '2023-02-20',
        owner_name: 'Robert Smith',
        owner_address: '456 Oak Ave, Manchester',
        owner_phone: '+44 7700 900456',
        owner_email: 'robert.smith@example.com',
        created_by: 1
      }
    ];

    for (const vehicle of sampleVehicles) {
      await database.run(
        `INSERT INTO vehicles (
          reg_number, manufacturer, model, vehicle_type, chassis_number,
          year_of_manufacture, vin, license_plate, color, use_type,
          date_of_entry, owner_name, owner_address, owner_phone,
          owner_email, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        Object.values(vehicle)
      );
    }

    console.log('✅ Sample vehicle data seeded');
  }
};

module.exports = {
  database,
  initializeDatabase
};
