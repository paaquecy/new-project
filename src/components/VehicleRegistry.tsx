import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Plus, Edit, Eye, Trash2, Save, X, Car, Calendar, User, MapPin, FileText } from 'lucide-react';
import { unifiedAPI } from '../lib/unified-api';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  registrationDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
  vehicleType: string;
  engineNumber: string;
  chassisNumber: string;
}

interface VehicleRegistryProps {
  searchQuery: string;
}

const VehicleRegistry: React.FC<VehicleRegistryProps> = ({ searchQuery }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles from the shared database
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get vehicles from the unified API (shared database)
      const response = await unifiedAPI.getDVLAVehicles();
      
      if (response.data) {
        // Transform the API response to match our local interface
        const transformedVehicles: Vehicle[] = response.data.map((apiVehicle: any) => ({
          id: apiVehicle.id?.toString() || `VEH${Math.random().toString(36).substr(2, 9)}`,
          plateNumber: apiVehicle.license_plate || apiVehicle.reg_number || 'Unknown',
          make: apiVehicle.manufacturer || 'Unknown',
          model: apiVehicle.model || 'Unknown',
          year: apiVehicle.year_of_manufacture?.toString() || 'Unknown',
          color: apiVehicle.color || 'Unknown',
          ownerName: apiVehicle.owner_name || 'Unknown',
          ownerPhone: apiVehicle.owner_phone || 'Unknown',
          ownerEmail: apiVehicle.owner_email || 'Unknown',
          ownerAddress: apiVehicle.owner_address || 'Unknown',
          registrationDate: apiVehicle.date_of_entry || new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 year
          status: apiVehicle.status === 'active' ? 'active' : 'expired',
          vehicleType: apiVehicle.vehicle_type || 'Unknown',
          engineNumber: apiVehicle.engine_number || 'Unknown',
          chassisNumber: apiVehicle.chassis_number || 'Unknown'
        }));
        
        setVehicles(transformedVehicles);
      } else if (response.error) {
        console.warn('Failed to fetch from database, using fallback data:', response.error);
        // Fallback to local data if database is unavailable
        setVehicles(getFallbackVehicles());
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles from database');
      // Fallback to local data
      setVehicles(getFallbackVehicles());
    } finally {
      setLoading(false);
    }
  };

  // Fallback vehicle data for when database is unavailable
  const getFallbackVehicles = (): Vehicle[] => [
    {
      id: 'VEH001',
      plateNumber: 'GR 1234 - 23',
      make: 'Toyota',
      model: 'Corolla',
      year: '2020',
      color: 'Silver',
      ownerName: 'Kwame Asante',
      ownerPhone: '+233-24-123-4567',
      ownerEmail: 'kwame.asante@email.com',
      ownerAddress: '123 Ring Road Central, Accra, Ghana',
      registrationDate: '2020-03-15',
      expiryDate: '2025-03-15',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS789012'
    },
    {
      id: 'VEH002',
      plateNumber: 'WR 5678 - 23',
      make: 'Honda',
      model: 'Civic',
      year: '2019',
      color: 'Blue',
      ownerName: 'Ama Osei',
      ownerPhone: '+233-20-456-7890',
      ownerEmail: 'ama.osei@email.com',
      ownerAddress: '456 Takoradi High Street, Takoradi, Ghana',
      registrationDate: '2019-07-22',
      expiryDate: '2024-07-22',
      status: 'expired',
      vehicleType: 'Sedan',
      engineNumber: 'ENG654321',
      chassisNumber: 'CHS210987'
    },
    {
      id: 'VEH003',
      plateNumber: 'GN 9012 - 23',
      make: 'Toyota',
      model: 'Hilux',
      year: '2021',
      color: 'White',
      ownerName: 'Kofi Mensah',
      ownerPhone: '+233-26-789-0123',
      ownerEmail: 'kofi.mensah@email.com',
      ownerAddress: '789 Sefwi Wiawso Road, Sefwi Wiawso, Ghana',
      registrationDate: '2021-01-10',
      expiryDate: '2026-01-10',
      status: 'active',
      vehicleType: 'Pickup',
      engineNumber: 'ENG987654',
      chassisNumber: 'CHS456789'
    },
    {
      id: 'VEH004',
      plateNumber: 'ER 3456 - 23',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: '2022',
      color: 'Black',
      ownerName: 'Abena Addo',
      ownerPhone: '+233-27-321-6540',
      ownerEmail: 'abena.addo@email.com',
      ownerAddress: '321 Koforidua Central, Koforidua, Ghana',
      registrationDate: '2022-05-18',
      expiryDate: '2027-05-18',
      status: 'suspended',
      vehicleType: 'SUV',
      engineNumber: 'ENG321654',
      chassisNumber: 'CHS987321'
    },
    {
      id: 'VEH005',
      plateNumber: 'CR 7890 - 23',
      make: 'Nissan',
      model: 'Almera',
      year: '2021',
      color: 'Red',
      ownerName: 'Yaw Darko',
      ownerPhone: '+233-54-987-6543',
      ownerEmail: 'yaw.darko@email.com',
      ownerAddress: '654 Cape Coast Road, Cape Coast, Ghana',
      registrationDate: '2021-08-12',
      expiryDate: '2026-08-12',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG456789',
      chassisNumber: 'CHS123456'
    },
    {
      id: 'VEH006',
      plateNumber: 'AS 2345 - 23',
      make: 'Hyundai',
      model: 'Accent',
      year: '2020',
      color: 'Green',
      ownerName: 'Efua Sarpong',
      ownerPhone: '+233-55-234-5678',
      ownerEmail: 'efua.sarpong@email.com',
      ownerAddress: '987 Kumasi High Street, Kumasi, Ghana',
      registrationDate: '2020-11-05',
      expiryDate: '2025-11-05',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG789012',
      chassisNumber: 'CHS345678'
    },
    {
      id: 'VEH007',
      plateNumber: 'BA 4567 - 23',
      make: 'Toyota',
      model: 'Camry',
      year: '2021',
      color: 'Gray',
      ownerName: 'Kwesi Boateng',
      ownerPhone: '+233-56-345-6789',
      ownerEmail: 'kwesi.boateng@email.com',
      ownerAddress: '234 Sunyani Main Street, Sunyani, Ghana',
      registrationDate: '2021-04-20',
      expiryDate: '2026-04-20',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG234567',
      chassisNumber: 'CHS567890'
    },
    {
      id: 'VEH008',
      plateNumber: 'NR 6789 - 23',
      make: 'Toyota',
      model: 'Hilux',
      year: '2022',
      color: 'White',
      ownerName: 'Fatima Alhassan',
      ownerPhone: '+233-57-456-7890',
      ownerEmail: 'fatima.alhassan@email.com',
      ownerAddress: '567 Tamale Central, Tamale, Ghana',
      registrationDate: '2022-02-15',
      expiryDate: '2027-02-15',
      status: 'active',
      vehicleType: 'Pickup',
      engineNumber: 'ENG345678',
      chassisNumber: 'CHS678901'
    },
    {
      id: 'VEH009',
      plateNumber: 'UE 8901 - 23',
      make: 'Toyota',
      model: 'Corolla',
      year: '2020',
      color: 'Blue',
      ownerName: 'Amina Issah',
      ownerPhone: '+233-58-567-8901',
      ownerEmail: 'amina.issah@email.com',
      ownerAddress: '789 Bolgatanga Road, Bolgatanga, Ghana',
      registrationDate: '2020-09-10',
      expiryDate: '2025-09-10',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG456789',
      chassisNumber: 'CHS789012'
    },
    {
      id: 'VEH010',
      plateNumber: 'UW 0123 - 23',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: '2021',
      color: 'Black',
      ownerName: 'Ibrahim Tanko',
      ownerPhone: '+233-59-678-9012',
      ownerEmail: 'ibrahim.tanko@email.com',
      ownerAddress: '123 Wa Central, Wa, Ghana',
      registrationDate: '2021-06-25',
      expiryDate: '2026-06-25',
      status: 'active',
      vehicleType: 'SUV',
      engineNumber: 'ENG567890',
      chassisNumber: 'CHS890123'
    },
    {
      id: 'VEH011',
      plateNumber: 'VR 2345 - 23',
      make: 'Honda',
      model: 'Civic',
      year: '2022',
      color: 'Red',
      ownerName: 'Kofi Agbeko',
      ownerPhone: '+233-60-789-0123',
      ownerEmail: 'kofi.agbeko@email.com',
      ownerAddress: '456 Ho Central, Ho, Ghana',
      registrationDate: '2022-03-30',
      expiryDate: '2027-03-30',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG678901',
      chassisNumber: 'CHS901234'
    },
    {
      id: 'VEH012',
      plateNumber: 'BT 4567 - 23',
      make: 'Nissan',
      model: 'Almera',
      year: '2021',
      color: 'Silver',
      ownerName: 'Abena Kufuor',
      ownerPhone: '+233-61-890-1234',
      ownerEmail: 'abena.kufuor@email.com',
      ownerAddress: '789 Techiman Road, Techiman, Ghana',
      registrationDate: '2021-08-15',
      expiryDate: '2026-08-15',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG789012',
      chassisNumber: 'CHS012345'
    },
    {
      id: 'VEH013',
      plateNumber: 'SV 6789 - 23',
      make: 'Toyota',
      model: 'Hilux',
      year: '2022',
      color: 'White',
      ownerName: 'Yaw Sarpong',
      ownerPhone: '+233-62-901-2345',
      ownerEmail: 'yaw.sarpong@email.com',
      ownerAddress: '234 Damongo Central, Damongo, Ghana',
      registrationDate: '2022-01-20',
      expiryDate: '2027-01-20',
      status: 'active',
      vehicleType: 'Pickup',
      engineNumber: 'ENG890123',
      chassisNumber: 'CHS123456'
    },
    {
      id: 'VEH014',
      plateNumber: 'NE 8901 - 23',
      make: 'Toyota',
      model: 'Corolla',
      year: '2021',
      color: 'Blue',
      ownerName: 'Amina Mahama',
      ownerPhone: '+233-63-012-3456',
      ownerEmail: 'amina.mahama@email.com',
      ownerAddress: '567 Nalerigu Road, Nalerigu, Ghana',
      registrationDate: '2021-05-12',
      expiryDate: '2026-05-12',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG901234',
      chassisNumber: 'CHS234567'
    },
    {
      id: 'VEH015',
      plateNumber: 'OT 0123 - 23',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: '2022',
      color: 'Black',
      ownerName: 'Kwame Osei',
      ownerPhone: '+233-64-123-4567',
      ownerEmail: 'kwame.osei@email.com',
      ownerAddress: '890 Dambai Central, Dambai, Ghana',
      registrationDate: '2022-07-08',
      expiryDate: '2027-07-08',
      status: 'active',
      vehicleType: 'SUV',
      engineNumber: 'ENG012345',
      chassisNumber: 'CHS345678'
    },
    {
      id: 'VEH016',
      plateNumber: 'AA 1234 - 23',
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: '2023',
      color: 'Black',
      ownerName: 'Embassy of Germany',
      ownerPhone: '+233-65-234-5678',
      ownerEmail: 'german.embassy@email.com',
      ownerAddress: '123 Ring Road Central, Accra, Ghana',
      registrationDate: '2023-01-15',
      expiryDate: '2028-01-15',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS456789'
    },
    {
      id: 'VEH017',
      plateNumber: 'CD 5678 - 23',
      make: 'BMW',
      model: '7 Series',
      year: '2023',
      color: 'White',
      ownerName: 'French Embassy',
      ownerPhone: '+233-66-345-6789',
      ownerEmail: 'french.embassy@email.com',
      ownerAddress: '456 Cantonments Road, Accra, Ghana',
      registrationDate: '2023-02-20',
      expiryDate: '2028-02-20',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG234567',
      chassisNumber: 'CHS567890'
    },
    {
      id: 'VEH018',
      plateNumber: 'DP 9012 - 23',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: '2022',
      color: 'White',
      ownerName: 'World Bank Ghana',
      ownerPhone: '+233-67-456-7890',
      ownerEmail: 'worldbank.ghana@email.com',
      ownerAddress: '789 Airport Residential Area, Accra, Ghana',
      registrationDate: '2022-11-10',
      expiryDate: '2027-11-10',
      status: 'active',
      vehicleType: 'SUV',
      engineNumber: 'ENG345678',
      chassisNumber: 'CHS678901'
    },
    {
      id: 'VEH019',
      plateNumber: 'ET 3456 - 23',
      make: 'Toyota',
      model: 'Hilux',
      year: '2022',
      color: 'White',
      ownerName: 'Electoral Commission',
      ownerPhone: '+233-68-567-8901',
      ownerEmail: 'ec.ghana@email.com',
      ownerAddress: '321 East Legon, Accra, Ghana',
      registrationDate: '2022-04-05',
      expiryDate: '2027-04-05',
      status: 'active',
      vehicleType: 'Pickup',
      engineNumber: 'ENG456789',
      chassisNumber: 'CHS789012'
    },
    {
      id: 'VEH020',
      plateNumber: 'GA 7890 - 23',
      make: 'Toyota',
      model: 'Corolla',
      year: '2020',
      color: 'Silver',
      ownerName: 'Kwame Addo',
      ownerPhone: '+233-69-678-9012',
      ownerEmail: 'kwame.addo@email.com',
      ownerAddress: '654 Tema Community 1, Tema, Ghana',
      registrationDate: '2020-12-01',
      expiryDate: '2025-12-01',
      status: 'active',
      vehicleType: 'Sedan',
      engineNumber: 'ENG567890',
      chassisNumber: 'CHS890123'
    }
  ];

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Refresh vehicles when search query changes
  useEffect(() => {
    if (searchQuery) {
      fetchVehicles();
    }
  }, [searchQuery]);

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [plateFilter, setPlateFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAddress: '',
    registrationDate: '',
    expiryDate: '',
    status: 'active',
    vehicleType: '',
    engineNumber: '',
    chassisNumber: ''
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = searchQuery === '' || 
        vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlate = plateFilter === '' ||
        vehicle.plateNumber.toLowerCase().includes(plateFilter.toLowerCase());
      
      const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesType = typeFilter === 'all' || vehicle.vehicleType === typeFilter;
      
      return matchesSearch && matchesPlate && matchesMake && matchesStatus && matchesType;
    });
  }, [vehicles, searchQuery, plateFilter, makeFilter, statusFilter, typeFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVehicle) {
        // Update existing vehicle in database
        const updateData = {
          id: parseInt(editingVehicle.id.replace('VEH', '')),
          license_plate: formData.plateNumber,
          manufacturer: formData.make,
          model: formData.model,
          year_of_manufacture: parseInt(formData.year || '0'),
          color: formData.color,
          owner_name: formData.ownerName,
          owner_phone: formData.ownerPhone,
          owner_email: formData.ownerEmail,
          owner_address: formData.ownerAddress,
          vehicle_type: formData.vehicleType,
          chassis_number: formData.chassisNumber,
          status: formData.status === 'active' ? 'active' : 'inactive'
        };

        const response = await unifiedAPI.updateDVLAVehicle(parseInt(editingVehicle.id.replace('VEH', '')), updateData);
        
        if (response.data) {
          console.log('Vehicle updated in database:', response.data);
          // Refresh the vehicle list from database
          await fetchVehicles();
        } else {
          console.error('Failed to update vehicle:', response.error);
          alert('Failed to update vehicle in database');
        }
      } else {
        // Add new vehicle to database
        const newVehicleData = {
          license_plate: formData.plateNumber,
          manufacturer: formData.make,
          model: formData.model,
          year_of_manufacture: parseInt(formData.year || '0'),
          color: formData.color,
          owner_name: formData.ownerName,
          owner_phone: formData.ownerPhone,
          owner_email: formData.ownerEmail,
          owner_address: formData.ownerAddress,
          vehicle_type: formData.vehicleType,
          chassis_number: formData.chassisNumber,
          status: formData.status === 'active' ? 'active' : 'inactive',
          date_of_entry: new Date().toISOString().split('T')[0]
        };

        const response = await unifiedAPI.createDVLAVehicle(newVehicleData);
        
        if (response.data) {
          console.log('New vehicle added to database:', response.data);
          // Refresh the vehicle list from database
          await fetchVehicles();
        } else {
          console.error('Failed to create vehicle:', response.error);
          alert('Failed to create vehicle in database');
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error saving vehicle to database');
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      make: '',
      model: '',
      year: '',
      color: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      ownerAddress: '',
      registrationDate: '',
      expiryDate: '',
      status: 'active',
      vehicleType: '',
      engineNumber: '',
      chassisNumber: ''
    });
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowForm(true);
    console.log(`Edit clicked for ${vehicle.id}`);
  };

  const handleView = (vehicle: Vehicle) => {
    console.log(`View clicked for ${vehicle.id}`, vehicle);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.plateNumber}?`)) {
      try {
        // Delete from database
        const vehicleId = parseInt(vehicle.id.replace('VEH', ''));
        const response = await unifiedAPI.deleteDVLAVehicle(vehicleId);
        
        if (response.data) {
          console.log('Vehicle deleted from database:', vehicle.plateNumber);
          // Refresh the vehicle list from database
          await fetchVehicles();
        } else {
          console.error('Failed to delete vehicle:', response.error);
          alert('Failed to delete vehicle from database');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Error deleting vehicle from database');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'expired':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'suspended':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const uniqueMakes = [...new Set(vehicles.map(v => v.make))];
  const uniqueTypes = [...new Set(vehicles.map(v => v.vehicleType))];

  return (
    <div className="bg-white">
      {/* Header with Add New Vehicle Button */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Registry Management</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add New Vehicle
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-6 text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading vehicles from database...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-red-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Data Entry Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  {editingVehicle ? 'Edit Vehicle Registration' : 'New Vehicle Registration'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Vehicle Information Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plate Number *
                    </label>
                    <input
                      type="text"
                      name="plateNumber"
                      value={formData.plateNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ABC-123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Toyota"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Camry"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      min="1900"
                      max="2030"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2023"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Silver"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Motorcycle">Motorcycle</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Number *
                    </label>
                    <input
                      type="text"
                      name="engineNumber"
                      value={formData.engineNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ENG123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chassis Number *
                    </label>
                    <input
                      type="text"
                      name="chassisNumber"
                      value={formData.chassisNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CHS789012"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Information Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Owner Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1-555-0123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="ownerAddress"
                      value={formData.ownerAddress}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Information Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Registration Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date *
                    </label>
                    <input
                      type="date"
                      name="registrationDate"
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Filter by Plate Number..."
              value={plateFilter}
              onChange={(e) => setPlateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Makes</option>
              {uniqueMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Vehicle Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VEHICLE ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PLATE NUMBER
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MAKE/MODEL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                YEAR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OWNER
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EXPIRY DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVehicles.map((vehicle, index) => (
              <tr 
                key={vehicle.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{vehicle.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {vehicle.plateNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-xs text-gray-500">
                    {vehicle.color} • {vehicle.vehicleType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vehicle.year}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vehicle.ownerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {vehicle.ownerPhone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(vehicle.expiryDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(vehicle.status)}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(vehicle)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredVehicles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No vehicles found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleRegistry;