import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Car,
  Calendar,
  Upload,
  X,
  Download,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { logDataOperation } from '../../utils/auditLog';
import { unifiedAPI } from '../../lib/unified-api';

interface FormData {
  // Vehicle Details
  regNumber: string;
  manufacturer: string;
  model: string;
  vehicleType: string;
  chassisNumber: string;
  yearOfManufacture: string;
  vin: string;
  licensePlate: string;
  color: string;
  use: string;
  dateOfEntry: string;
  
  // Physical Specifications
  length: string;
  width: string;
  height: string;
  numberOfAxles: string;
  numberOfWheels: string;
  tyreSizeFront: string;
  tyreSizeMiddle: string;
  tyreSizeRear: string;
  axleLoadFront: string;
  axleLoadMiddle: string;
  axleLoadRear: string;
  weight: string;
  
  // Engine Details
  engineMake: string;
  engineNumber: string;
  numberOfCylinders: string;
  engineCC: string;
  horsePower: string;
  
  // Owner Details
  fullName: string;
  address: string;
  phoneNumber: string;
  emailAddress: string;
  
  // Document Uploads
  documentType: string;
  
  // Fee Processing
  amountDue: string;
  paymentMethod: string;
  transactionId: string;
}

interface ImportedVehicle {
  regNumber: string;
  manufacturer: string;
  model: string;
  vehicleType: string;
  chassisNumber: string;
  yearOfManufacture: string;
  vin: string;
  licensePlate: string;
  color: string;
  use: string;
  dateOfEntry: string;
  length: string;
  width: string;
  height: string;
  numberOfAxles: string;
  numberOfWheels: string;
  tyreSizeFront: string;
  tyreSizeMiddle: string;
  tyreSizeRear: string;
  axleLoadFront: string;
  axleLoadMiddle: string;
  axleLoadRear: string;
  weight: string;
  engineMake: string;
  engineNumber: string;
  numberOfCylinders: string;
  engineCC: string;
  horsePower: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  emailAddress: string;
}

const VehicleDataEntry: React.FC = () => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    regNumber: '',
    manufacturer: '',
    model: '',
    vehicleType: '',
    chassisNumber: '',
    yearOfManufacture: '',
    vin: '',
    licensePlate: '',
    color: '',
    use: '',
    dateOfEntry: '',
    length: '',
    width: '',
    height: '',
    numberOfAxles: '',
    numberOfWheels: '',
    tyreSizeFront: '',
    tyreSizeMiddle: '',
    tyreSizeRear: '',
    axleLoadFront: '',
    axleLoadMiddle: '',
    axleLoadRear: '',
    weight: '',
    engineMake: '',
    engineNumber: '',
    numberOfCylinders: '',
    engineCC: '',
    horsePower: '',
    fullName: '',
    address: '',
    phoneNumber: '',
    emailAddress: '',
    documentType: '',
    amountDue: '150.00',
    paymentMethod: '',
    transactionId: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Import functionality states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedVehicles, setImportedVehicles] = useState<ImportedVehicle[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importProgress, setImportProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    // Log vehicle data entry
    logDataOperation('Vehicle Registered', `New vehicle registered: ${formData.licensePlate} (${formData.manufacturer} ${formData.model})`, 'dvla', 'high');

    // Handle form submission logic here
    alert('Vehicle data submitted successfully!');
  };

  const handleCancel = () => {
    // Reset form or navigate away
    console.log('Form cancelled');
  };

  // CSV Import functionality
  const parseCSV = (csvText: string): ImportedVehicle[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const vehicles: ImportedVehicle[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const vehicle: any = {};
      
      headers.forEach((header, index) => {
        vehicle[header] = values[index] || '';
      });
      
      vehicles.push(vehicle as ImportedVehicle);
    }
    
    return vehicles;
  };

  const validateVehicleData = (vehicle: ImportedVehicle): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!vehicle.regNumber) errors.push('Registration number is required');
    if (!vehicle.manufacturer) errors.push('Manufacturer is required');
    if (!vehicle.model) errors.push('Model is required');
    if (!vehicle.licensePlate) errors.push('License plate is required');
    if (!vehicle.fullName) errors.push('Owner name is required');
    if (!vehicle.phoneNumber) errors.push('Phone number is required');
    
    // Validate Ghanaian license plate format
    const platePattern = /^(AS|BA|CR|ER|GR|NR|UE|UW|VR|WR|GN|BT|SV|NE|OT|AA|CD|DP|ET|GA)\s+\d{3,5}\s*-\s*\d{2}$/i;
    if (vehicle.licensePlate && !platePattern.test(vehicle.licensePlate)) {
      errors.push('Invalid license plate format. Use format: AS 1234 - 23');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      setImportStatus('idle');
      setImportMessage('');
    } else {
      setImportMessage('Please select a valid CSV file');
      setImportStatus('error');
    }
  };

  const processImportFile = async () => {
    if (!importFile) return;
    
    setImportStatus('processing');
    setImportProgress(0);
    
    try {
      const text = await importFile.text();
      const vehicles = parseCSV(text);
      
      // Validate all vehicles
      const validationResults = vehicles.map(vehicle => ({
        vehicle,
        validation: validateVehicleData(vehicle)
      }));
      
      const validVehicles = validationResults
        .filter(result => result.validation.isValid)
        .map(result => result.vehicle);
      
      const invalidVehicles = validationResults
        .filter(result => !result.validation.isValid);
      
      setImportedVehicles(validVehicles);
      
      if (validVehicles.length === 0) {
        setImportStatus('error');
        setImportMessage('No valid vehicles found in the CSV file');
        return;
      }
      
      if (invalidVehicles.length > 0) {
        setImportMessage(`${validVehicles.length} valid vehicles found. ${invalidVehicles.length} vehicles have validation errors.`);
      } else {
        setImportMessage(`${validVehicles.length} vehicles ready for import`);
      }
      
      setImportStatus('success');
      
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Error processing CSV file');
      console.error('CSV processing error:', error);
    }
  };

  const importVehiclesToDatabase = async () => {
    if (importedVehicles.length === 0) return;
    
    setImportStatus('processing');
    setImportProgress(0);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < importedVehicles.length; i++) {
        const vehicle = importedVehicles[i];
        
        try {
          // Convert to the format expected by the API
          const vehicleData = {
            reg_number: vehicle.regNumber,
            manufacturer: vehicle.manufacturer,
            model: vehicle.model,
            vehicle_type: vehicle.vehicleType,
            chassis_number: vehicle.chassisNumber,
            year_of_manufacture: vehicle.yearOfManufacture,
            vin: vehicle.vin,
            license_plate: vehicle.licensePlate,
            color: vehicle.color,
            use: vehicle.use,
            date_of_entry: vehicle.dateOfEntry,
            length: vehicle.length,
            width: vehicle.width,
            height: vehicle.height,
            number_of_axles: vehicle.numberOfAxles,
            number_of_wheels: vehicle.numberOfWheels,
            tyre_size_front: vehicle.tyreSizeFront,
            tyre_size_middle: vehicle.tyreSizeMiddle,
            tyre_size_rear: vehicle.tyreSizeRear,
            axle_load_front: vehicle.axleLoadFront,
            axle_load_middle: vehicle.axleLoadMiddle,
            axle_load_rear: vehicle.axleLoadRear,
            weight: vehicle.weight,
            engine_make: vehicle.engineMake,
            engine_number: vehicle.engineNumber,
            number_of_cylinders: vehicle.numberOfCylinders,
            engine_cc: vehicle.engineCC,
            horse_power: vehicle.horsePower,
            owner_name: vehicle.fullName,
            owner_address: vehicle.address,
            owner_phone: vehicle.phoneNumber,
            owner_email: vehicle.emailAddress
          };
          
          const response = await unifiedAPI.createDVLAVehicle(vehicleData);
          
          if (response.data) {
            successCount++;
            logDataOperation('Vehicle Imported', `Vehicle imported: ${vehicle.licensePlate}`, 'dvla', 'medium');
          } else {
            errorCount++;
          }
          
        } catch (error) {
          errorCount++;
          console.error(`Error importing vehicle ${vehicle.licensePlate}:`, error);
        }
        
        setImportProgress(((i + 1) / importedVehicles.length) * 100);
      }
      
      setImportStatus('success');
      setImportMessage(`Import completed: ${successCount} vehicles imported successfully, ${errorCount} failed`);
      
      // Close modal after successful import
      setTimeout(() => {
        setImportModalOpen(false);
        setImportFile(null);
        setImportedVehicles([]);
        setImportStatus('idle');
        setImportMessage('');
        setImportProgress(0);
      }, 3000);
      
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Error during import process');
      console.error('Import error:', error);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = [
      'regNumber', 'manufacturer', 'model', 'vehicleType', 'chassisNumber', 'yearOfManufacture',
      'vin', 'licensePlate', 'color', 'use', 'dateOfEntry', 'length', 'width', 'height',
      'numberOfAxles', 'numberOfWheels', 'tyreSizeFront', 'tyreSizeMiddle', 'tyreSizeRear',
      'axleLoadFront', 'axleLoadMiddle', 'axleLoadRear', 'weight', 'engineMake', 'engineNumber',
      'numberOfCylinders', 'engineCC', 'horsePower', 'fullName', 'address', 'phoneNumber', 'emailAddress'
    ];
    
    const sampleData = [
      'REG001', 'Toyota', 'Corolla', 'Sedan', 'CHASSIS001', '2023', 'VIN001', 'GR 1234 - 23', 'Silver', 'Private', '2023-01-15',
      '4.5', '1.8', '1.5', '2', '4', '205/55R16', '', '', '800', '', '', '1200', 'Toyota', 'ENG001', '4', '1800', '140',
      'Kwame Asante', '123 Ring Road, Accra', '+233-24-123-4567', 'kwame@example.com'
    ];
    
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicle_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Vehicle Data Entry
            </h1>
            <p className={`text-sm sm:text-base transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Register new vehicles or import vehicle data in bulk
            </p>
          </div>
          
          {/* Import Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium ${
                darkMode 
                  ? 'text-gray-300 border-gray-600 hover:bg-gray-800' 
                  : 'text-gray-700'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </button>
            
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Vehicle Details Section */}
        <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center transition-colors duration-200 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <Car className={`mr-2 transition-colors duration-200 ${
              darkMode ? 'text-blue-400' : 'text-blue-500'
            }`} size={20} />
            Vehicle Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Vehicle REG Number
              </label>
              <input
                type="text"
                name="regNumber"
                value={formData.regNumber}
                onChange={handleInputChange}
                placeholder="A912 CDE"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="Toyota"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Camry"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Vehicle
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select vehicle type</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chassis Number
              </label>
              <input
                type="text"
                name="chassisNumber"
                value={formData.chassisNumber}
                onChange={handleInputChange}
                placeholder="JHMNC5K1KJ1234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Manufacture
              </label>
              <input
                type="number"
                name="yearOfManufacture"
                value={formData.yearOfManufacture}
                onChange={handleInputChange}
                placeholder="2020"
                min="1900"
                max="2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VIN
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleInputChange}
                placeholder="1AZBCBUSB3M123BH0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="ABC 123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Blue"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use
              </label>
              <select
                name="use"
                value={formData.use}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select use type</option>
                <option value="private">Private</option>
                <option value="commercial">Commercial</option>
                <option value="government">Government</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Entry
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dateOfEntry"
                  value={formData.dateOfEntry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Physical Specifications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Physical Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length (cm)
              </label>
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleInputChange}
                placeholder="400"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (cm)
              </label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleInputChange}
                placeholder="180"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="150"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Axles
              </label>
              <input
                type="number"
                name="numberOfAxles"
                value={formData.numberOfAxles}
                onChange={handleInputChange}
                placeholder="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Wheels
              </label>
              <input
                type="number"
                name="numberOfWheels"
                value={formData.numberOfWheels}
                onChange={handleInputChange}
                placeholder="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tyre Size (Front)
              </label>
              <input
                type="text"
                name="tyreSizeFront"
                value={formData.tyreSizeFront}
                onChange={handleInputChange}
                placeholder="205/55R16"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tyre Size (Middle)
              </label>
              <input
                type="text"
                name="tyreSizeMiddle"
                value={formData.tyreSizeMiddle}
                onChange={handleInputChange}
                placeholder="N/A or 205/55R16"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tyre Size (Rear)
              </label>
              <input
                type="text"
                name="tyreSizeRear"
                value={formData.tyreSizeRear}
                onChange={handleInputChange}
                placeholder="205/55R16"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perm. Axle Load (Front, kg)
              </label>
              <input
                type="number"
                name="axleLoadFront"
                value={formData.axleLoadFront}
                onChange={handleInputChange}
                placeholder="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perm. Axle Load (Middle, kg)
              </label>
              <input
                type="number"
                name="axleLoadMiddle"
                value={formData.axleLoadMiddle}
                onChange={handleInputChange}
                placeholder="N/A or 1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perm. Axle Load (Rear, kg)
              </label>
              <input
                type="number"
                name="axleLoadRear"
                value={formData.axleLoadRear}
                onChange={handleInputChange}
                placeholder="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="1500"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Engine Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Engine Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engine Make
              </label>
              <input
                type="text"
                name="engineMake"
                value={formData.engineMake}
                onChange={handleInputChange}
                placeholder="Honda"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engine Number
              </label>
              <input
                type="text"
                name="engineNumber"
                value={formData.engineNumber}
                onChange={handleInputChange}
                placeholder="0123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cylinders
              </label>
              <input
                type="number"
                name="numberOfCylinders"
                value={formData.numberOfCylinders}
                onChange={handleInputChange}
                placeholder="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engine CC
              </label>
              <input
                type="number"
                name="engineCC"
                value={formData.engineCC}
                onChange={handleInputChange}
                placeholder="1998"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horse Power
              </label>
              <input
                type="number"
                name="horsePower"
                value={formData.horsePower}
                onChange={handleInputChange}
                placeholder="150"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Owner Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Owner Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St. Anytown"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                placeholder="jane.doe@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Document Uploads Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Uploads</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select document type</option>
                <option value="proof-of-ownership">Proof of Ownership</option>
                <option value="id">ID</option>
                <option value="insurance-certificate">Insurance Certificate</option>
                <option value="inspection-certificate">Inspection Certificate</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">
                  Drag & drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, JPG, PNG (Max 10MB each)
                </p>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fee Processing Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Fee Processing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Due
              </label>
              <input
                type="text"
                name="amountDue"
                value={formData.amountDue}
                onChange={handleInputChange}
                placeholder="150.00"
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select payment method</option>
                <option value="credit-card">Credit Card</option>
                <option value="mobile-money">Mobile Money</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                placeholder="TXN123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
          >
            Submit Registration
          </button>
        </div>
      </form>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl shadow-xl transition-colors duration-200 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b transition-colors duration-200 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Import Vehicle Data
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                  darkMode ? 'hover:bg-gray-700' : ''
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* File Upload Section */}
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select CSV File
                </label>
                
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700' 
                    : 'border-gray-300 bg-gray-50'
                }`}>
                  <FileText className={`w-12 h-12 mx-auto mb-4 transition-colors duration-200 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  
                  <p className={`text-sm mb-4 transition-colors duration-200 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {importFile ? importFile.name : 'Drag and drop a CSV file here, or click to select'}
                  </p>
                  
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFileSelect}
                    className="hidden"
                    id="csv-import"
                  />
                  <label
                    htmlFor="csv-import"
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium cursor-pointer transition-colors duration-200 ${
                      darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
              </div>

              {/* Status and Progress */}
              {importStatus !== 'idle' && (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  {importStatus === 'processing' && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          Processing...
                        </span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {Math.round(importProgress)}%
                        </span>
                      </div>
                      <div className={`w-full bg-gray-200 rounded-full h-2 transition-colors duration-200 ${
                        darkMode ? 'bg-gray-700' : ''
                      }`}>
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {importMessage && (
                    <div className={`flex items-center p-4 rounded-lg ${
                      importStatus === 'error' 
                        ? 'bg-red-50 border border-red-200' 
                        : importStatus === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      {importStatus === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                      ) : importStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500 mr-3" />
                      )}
                      <span className={`text-sm ${
                        importStatus === 'error' 
                          ? 'text-red-700' 
                          : importStatus === 'success'
                          ? 'text-green-700'
                          : 'text-blue-700'
                      }`}>
                        {importMessage}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Import Preview */}
              {importedVehicles.length > 0 && (
                <div>
                  <h4 className={`text-sm font-medium mb-3 transition-colors duration-200 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Preview ({importedVehicles.length} vehicles)
                  </h4>
                  <div className={`max-h-48 overflow-y-auto border rounded-lg transition-colors duration-200 ${
                    darkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <table className="w-full text-sm">
                      <thead className={`transition-colors duration-200 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <tr>
                          <th className={`px-3 py-2 text-left transition-colors duration-200 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Plate</th>
                          <th className={`px-3 py-2 text-left transition-colors duration-200 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Make</th>
                          <th className={`px-3 py-2 text-left transition-colors duration-200 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedVehicles.slice(0, 5).map((vehicle, index) => (
                          <tr key={index} className={`border-t transition-colors duration-200 ${
                            darkMode ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                            <td className={`px-3 py-2 transition-colors duration-200 ${
                              darkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>{vehicle.licensePlate}</td>
                            <td className={`px-3 py-2 transition-colors duration-200 ${
                              darkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>{vehicle.manufacturer} {vehicle.model}</td>
                            <td className={`px-3 py-2 transition-colors duration-200 ${
                              darkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>{vehicle.fullName}</td>
                          </tr>
                        ))}
                        {importedVehicles.length > 5 && (
                          <tr className={`border-t transition-colors duration-200 ${
                            darkMode ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                            <td colSpan={3} className={`px-3 py-2 text-center text-sm transition-colors duration-200 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              ... and {importedVehicles.length - 5} more vehicles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end space-x-3 p-6 border-t transition-colors duration-200 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setImportModalOpen(false)}
                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium ${
                  darkMode 
                    ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-700'
                }`}
              >
                Cancel
              </button>
              
              {importFile && !importedVehicles.length && (
                <button
                  onClick={processImportFile}
                  disabled={importStatus === 'processing'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Process File
                </button>
              )}
              
              {importedVehicles.length > 0 && (
                <button
                  onClick={importVehiclesToDatabase}
                  disabled={importStatus === 'processing'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import to Database
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDataEntry;
