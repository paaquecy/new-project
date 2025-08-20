// Test vehicle database with specific license plates for development and testing
// Only these plates will return valid results - all others will show as "Invalid"

export interface TestVehicle {
  id: string;
  plate_number: string;
  reg_number: string;
  make: string;
  manufacturer: string;
  model: string;
  year: number;
  year_of_manufacture: number;
  color: string;
  owner_name: string;
  owner_address: string;
  owner_phone: string;
  owner_email: string;
  status: string;
  registration_status: string;
  registration_expiry: string;
  insurance_status: string;
  insurance_expiry: string;
  vin: string;
  created_at: string;
  updated_at: string;
}

// Predefined test vehicles - Only these plates will be recognized as valid
export const TEST_VEHICLE_DATABASE: TestVehicle[] = [
  {
    id: "1",
    plate_number: "GR-1234-23",
    reg_number: "GR-1234-23",
    make: "Toyota",
    manufacturer: "Toyota",
    model: "Corolla",
    year: 2023,
    year_of_manufacture: 2023,
    color: "Silver",
    owner_name: "Kwame Asante",
    owner_address: "123 Ring Road Central, Accra, Ghana",
    owner_phone: "+233-24-123-4567",
    owner_email: "kwame.asante@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-12-31",
    insurance_status: "Valid",
    insurance_expiry: "2025-06-30",
    vin: "JTDBL40E199000001",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    plate_number: "WR-5678-23",
    reg_number: "WR-5678-23",
    make: "Honda",
    manufacturer: "Honda",
    model: "Civic",
    year: 2023,
    year_of_manufacture: 2023,
    color: "Blue",
    owner_name: "Ama Osei",
    owner_address: "456 Takoradi High Street, Takoradi, Ghana",
    owner_phone: "+233-20-456-7890",
    owner_email: "ama.osei@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-11-15",
    insurance_status: "Valid",
    insurance_expiry: "2025-05-20",
    vin: "JTDBL40E199000002",
    created_at: "2024-02-20T14:30:00Z",
    updated_at: "2024-02-20T14:30:00Z"
  },
  {
    id: "3",
    plate_number: "AS-9012-23",
    reg_number: "AS-9012-23",
    make: "Toyota",
    manufacturer: "Toyota",
    model: "Hilux",
    year: 2023,
    year_of_manufacture: 2023,
    color: "White",
    owner_name: "Kofi Mensah",
    owner_address: "789 Kumasi High Street, Kumasi, Ghana",
    owner_phone: "+233-26-789-0123",
    owner_email: "kofi.mensah@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-10-08",
    insurance_status: "Valid",
    insurance_expiry: "2025-04-15",
    vin: "JTDBL40E199000003",
    created_at: "2024-03-10T09:15:00Z",
    updated_at: "2024-03-10T09:15:00Z"
  },
  {
    id: "4",
    plate_number: "ER-3456-23",
    reg_number: "ER-3456-23",
    make: "Toyota",
    manufacturer: "Toyota",
    model: "Land Cruiser",
    year: 2023,
    year_of_manufacture: 2023,
    color: "Black",
    owner_name: "Abena Addo",
    owner_address: "321 Koforidua Central, Koforidua, Ghana",
    owner_phone: "+233-27-321-6540",
    owner_email: "abena.addo@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-09-22",
    insurance_status: "Valid",
    insurance_expiry: "2025-03-10",
    vin: "JTDBL40E199000004",
    created_at: "2024-04-05T16:45:00Z",
    updated_at: "2024-04-05T16:45:00Z"
  },
  {
    id: "5",
    plate_number: "CR-7890-23",
    reg_number: "CR-7890-23",
    make: "Nissan",
    manufacturer: "Nissan",
    model: "Almera",
    year: 2023,
    year_of_manufacture: 2023,
    color: "Red",
    owner_name: "Yaw Darko",
    owner_address: "654 Cape Coast Road, Cape Coast, Ghana",
    owner_phone: "+233-54-987-6543",
    owner_email: "yaw.darko@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-08-14",
    insurance_status: "Valid",
    insurance_expiry: "2025-02-28",
    vin: "JTDBL40E199000005",
    created_at: "2024-05-12T11:20:00Z",
    updated_at: "2024-05-12T11:20:00Z"
  },
  {
    id: "6", 
    plate_number: "BA-4567-23",
    reg_number: "BA-4567-23",
    make: "Toyota",
    manufacturer: "Toyota", 
    model: "Camry",
    year: 2023,
    year_of_manufacture: 2023,
    color: "Gray",
    owner_name: "Kwesi Boateng",
    owner_address: "234 Sunyani Main Street, Sunyani, Ghana",
    owner_phone: "+233-56-345-6789",
    owner_email: "kwesi.boateng@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-07-03",
    insurance_status: "Valid",
    insurance_expiry: "2025-01-15",
    vin: "JTDBL40E199000006",
    created_at: "2024-06-18T13:10:00Z",
    updated_at: "2024-06-18T13:10:00Z"
  },
  {
    id: "7",
    plate_number: "NR-6789-23", 
    reg_number: "NR-6789-23",
    make: "Toyota",
    manufacturer: "Toyota",
    model: "Hilux",
    year: 2023,
    year_of_manufacture: 2023,
    color: "White",
    owner_name: "Fatima Alhassan",
    owner_address: "567 Tamale Central, Tamale, Ghana",
    owner_phone: "+233-57-456-7890",
    owner_email: "fatima.alhassan@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-06-19",
    insurance_status: "Valid", 
    insurance_expiry: "2024-12-31",
    vin: "JTDBL40E199000007",
    created_at: "2024-07-25T08:55:00Z",
    updated_at: "2024-07-25T08:55:00Z"
  },
  {
    id: "8",
    plate_number: "AA-1234-23",
    reg_number: "AA-1234-23", 
    make: "Mercedes-Benz",
    manufacturer: "Mercedes-Benz",
    model: "S-Class",
    year: 2023,
    year_of_manufacture: 2023,
    color: "Black",
    owner_name: "Embassy of Germany",
    owner_address: "123 Ring Road Central, Accra, Ghana",
    owner_phone: "+233-65-234-5678",
    owner_email: "german.embassy@email.com",
    status: "active",
    registration_status: "Valid",
    registration_expiry: "2025-12-31",
    insurance_status: "Valid",
    insurance_expiry: "2025-12-31",
    vin: "JTDBL40E199000008",
    created_at: "2024-08-30T15:30:00Z",
    updated_at: "2024-08-30T15:30:00Z"
  }
];

// Utility functions for working with the test database

/**
 * Find a vehicle by plate number (case-insensitive, handles various formats)
 */
export function findVehicleByPlate(plateNumber: string): TestVehicle | null {
  if (!plateNumber) return null;
  
  // Normalize the plate number - remove spaces, dashes, convert to uppercase
  const normalizedInput = plateNumber.replace(/[-\s]/g, '').toUpperCase();
  
  return TEST_VEHICLE_DATABASE.find(vehicle => {
    const normalizedPlate = vehicle.plate_number.replace(/[-\s]/g, '').toUpperCase();
    return normalizedPlate === normalizedInput;
  }) || null;
}

/**
 * Get all registered plate numbers for reference
 */
export function getAllRegisteredPlates(): string[] {
  return TEST_VEHICLE_DATABASE.map(vehicle => vehicle.plate_number);
}

/**
 * Check if a plate number is registered in the test database
 */
export function isPlateRegistered(plateNumber: string): boolean {
  return findVehicleByPlate(plateNumber) !== null;
}

/**
 * Get random registered plate for testing detection
 */
export function getRandomRegisteredPlate(): string {
  const randomIndex = Math.floor(Math.random() * TEST_VEHICLE_DATABASE.length);
  return TEST_VEHICLE_DATABASE[randomIndex].plate_number;
}

/**
 * Log all registered plates for development reference
 */
export function logRegisteredPlates(): void {
  console.log('📋 Registered Test Plates:');
  TEST_VEHICLE_DATABASE.forEach((vehicle, index) => {
    console.log(`${index + 1}. ${vehicle.plate_number} - ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.owner_name})`);
  });
}
