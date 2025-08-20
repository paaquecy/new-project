import React, { useState } from 'react';
import { 
  Search, 
  Car, 
  FileText, 
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const VehicleInformationAccess = () => {
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState({
    plateNumber: 'N/A',
    vin: 'N/A',
    make: 'N/A',
    model: 'N/A',
    year: 'N/A',
    owner: 'N/A',
    registrationStatus: 'N/A',
    insuranceStatus: 'N/A',
    outstandingViolations: 0
  });

  const handleLookupVehicle = () => {
    if (lookupInput.trim()) {
      setIsLookingUp(true);
      
      // Simulate lookup process
      setTimeout(() => {
        const mockVehicleData = {
          plateNumber: lookupInput.toUpperCase(),
          vin: '1234567890ABCDEF',
          make: 'Honda',
          model: 'Civic',
          year: '2020',
          owner: 'John Doe',
          registrationStatus: 'Active',
          insuranceStatus: 'Valid',
          outstandingViolations: 2
        };
        
        setVehicleDetails(mockVehicleData);
        setIsLookingUp(false);
      }, 2000);
    }
  };

  const handleViewViolations = () => {
    alert(`Viewing ${vehicleDetails.outstandingViolations} outstanding violations for ${vehicleDetails.plateNumber}`);
  };

  const getStatusColor = (status, type) => {
    if (type === 'registration' || type === 'insurance') {
      return status === 'Active' || status === 'Valid' 
        ? 'text-green-600' 
        : 'text-red-600';
    }
    return 'text-gray-800';
  };

  const getStatusIcon = (status, type) => {
    if (type === 'registration' || type === 'insurance') {
      return status === 'Active' || status === 'Valid' 
        ? <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
        : <AlertCircle className="w-4 h-4 text-red-600 inline ml-2" />;
    }
    return null;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Vehicle Lookup Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <Search className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            Vehicle Lookup
          </h3>
          
          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Plate Number or VIN
              </label>
              <input
                type="text"
                placeholder="Enter plate number or VIN"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base lg:text-lg transition-colors duration-200"
                maxLength={17}
              />
            </div>
            
            <button
              onClick={handleLookupVehicle}
              disabled={!lookupInput.trim() || isLookingUp}
              className={`w-full py-3 lg:py-4 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base ${
                !lookupInput.trim() || isLookingUp
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLookingUp ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 lg:h-5 w-4 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                  Looking up...
                </div>
              ) : (
                'Lookup Vehicle'
              )}
            </button>
          </div>
        </div>

        {/* Vehicle Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <Car className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            Vehicle Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Plate Number:</span>
              <span className="text-sm font-semibold text-gray-800 font-mono truncate">
                {vehicleDetails.plateNumber}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">VIN:</span>
              <span className="text-sm font-semibold text-gray-800 font-mono truncate">
                {vehicleDetails.vin}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Make:</span>
              <span className="text-sm font-semibold text-gray-800 truncate">
                {vehicleDetails.make}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Model:</span>
              <span className="text-sm font-semibold text-gray-800 truncate">
                {vehicleDetails.model}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Year:</span>
              <span className="text-sm font-semibold text-gray-800 truncate">
                {vehicleDetails.year}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Owner:</span>
              <span className="text-sm font-semibold text-gray-800 truncate">
                {vehicleDetails.owner}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Registration Status:</span>
              <div className="flex items-center flex-shrink-0">
                <span className={`text-sm font-semibold ${getStatusColor(vehicleDetails.registrationStatus, 'registration')}`}>
                  {vehicleDetails.registrationStatus}
                </span>
                {getStatusIcon(vehicleDetails.registrationStatus, 'registration')}
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 gap-2">
              <span className="text-sm font-medium text-gray-600">Insurance Status:</span>
              <div className="flex items-center flex-shrink-0">
                <span className={`text-sm font-semibold ${getStatusColor(vehicleDetails.insuranceStatus, 'insurance')}`}>
                  {vehicleDetails.insuranceStatus}
                </span>
                {getStatusIcon(vehicleDetails.insuranceStatus, 'insurance')}
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 lg:py-3 gap-2">
              <span className="text-sm font-medium text-gray-600">Outstanding Violations:</span>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-800">
                  {vehicleDetails.outstandingViolations}
                </span>
                {vehicleDetails.outstandingViolations > 0 && vehicleDetails.plateNumber !== 'N/A' && (
                  <button
                    onClick={handleViewViolations}
                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium transition-colors duration-200"
                  >
                    (View)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Lookup Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h4 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
          Quick Lookup Examples
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
          {['ABC 123', 'XYZ 789', 'DEF 456', 'GHI 012'].map((plate, index) => (
            <button
              key={index}
              onClick={() => setLookupInput(plate)}
              className="px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-center font-mono"
            >
              {plate}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleInformationAccess;