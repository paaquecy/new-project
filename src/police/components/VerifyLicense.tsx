import React, { useState } from 'react';
import { 
  CreditCard, 
  ClipboardCheck, 
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Shield
} from 'lucide-react';

const VerifyLicense = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState({
    isValid: false,
    hasResults: false,
    licenseData: {
      licenseNumber: '',
      holderName: '',
      dateOfBirth: '',
      address: '',
      licenseClass: '',
      issueDate: '',
      expiryDate: '',
      status: '',
      restrictions: ''
    }
  });

  const handleLicenseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseNumber(e.target.value.toUpperCase());
  };

  const handleVerifyLicense = () => {
    if (!licenseNumber.trim()) {
      alert('Please enter a license number');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification process (replace with backend call when available)
    setTimeout(() => {
      const found = Math.random() > 0.5; // simulate not found cases
      if (!found) {
        setVerificationResults({
          isValid: false,
          hasResults: true,
          licenseData: {
            licenseNumber: licenseNumber,
            holderName: 'Invalid',
            dateOfBirth: '',
            address: 'Invalid',
            licenseClass: 'Invalid',
            issueDate: '',
            expiryDate: '',
            status: 'Invalid',
            restrictions: 'N/A'
          }
        });
        setIsVerifying(false);
        return;
      }

      const mockLicenseData = {
        licenseNumber: licenseNumber,
        holderName: 'John Smith',
        dateOfBirth: '1985-03-15',
        address: '123 Main Street, City, State 12345',
        licenseClass: 'Class C - Regular Driver',
        issueDate: '2020-03-15',
        expiryDate: '2025-03-15',
        status: Math.random() > 0.3 ? 'Valid' : 'Expired',
        restrictions: 'None'
      };

      setVerificationResults({
        isValid: mockLicenseData.status === 'Valid',
        hasResults: true,
        licenseData: mockLicenseData
      });
      setIsVerifying(false);
    }, 1200);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Invalid') return 'text-red-700';
    return status === 'Valid' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Invalid') return <AlertCircle className="w-5 h-5 text-red-700" />;
    return status === 'Valid' 
      ? <CheckCircle className="w-5 h-5 text-green-600" />
      : <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Invalid') return 'bg-red-100 text-red-800 border border-red-300';
    return status === 'Valid'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Enter License Details Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
          <CreditCard className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
          Enter License Details
        </h3>
        
        <div className="space-y-4 lg:space-y-6">
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              placeholder="e.g., DL123456789"
              value={licenseNumber}
              onChange={handleLicenseNumberChange}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base lg:text-lg transition-colors duration-200"
              maxLength={15}
            />
          </div>
          
          <button
            onClick={handleVerifyLicense}
            disabled={!licenseNumber.trim() || isVerifying}
            className={`w-full py-3 lg:py-4 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base ${
              !licenseNumber.trim() || isVerifying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 lg:h-5 w-4 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                Verifying License...
              </div>
            ) : (
              'Verify License'
            )}
          </button>
        </div>
      </div>

      {/* Verification Results Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
          <ClipboardCheck className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
          Verification Results
        </h3>
        
        {!verificationResults.hasResults ? (
          <div className="text-center py-8 lg:py-12">
            <ClipboardCheck className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium text-sm lg:text-base">
              Enter a license number and click 'Verify' to see results.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* License Status */}
            <div className={`p-4 rounded-lg border ${getStatusBadge(verificationResults.licenseData.status)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(verificationResults.licenseData.status)}
                <div>
                  <h4 className="font-semibold text-base lg:text-lg">
                    License Status: {verificationResults.licenseData.status}
                  </h4>
                  <p className="text-sm">
                    {verificationResults.isValid 
                      ? 'This license is currently valid and active.'
                      : 'This license is expired or invalid. Take appropriate action.'}
                  </p>
                </div>
              </div>
            </div>

            {/* License Holder Information */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
              <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                License Holder Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">License Number:</span>
                    <span className="text-sm font-semibold text-gray-800 font-mono">
                      {verificationResults.licenseData.licenseNumber}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Full Name:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {verificationResults.licenseData.holderName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {new Date(verificationResults.licenseData.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">License Class:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {verificationResults.licenseData.licenseClass}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Issue Date:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {new Date(verificationResults.licenseData.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Expiry Date:</span>
                    <span className={`text-sm font-semibold ${getStatusColor(verificationResults.licenseData.status)}`}>
                      {new Date(verificationResults.licenseData.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Restrictions:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {verificationResults.licenseData.restrictions}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${getStatusColor(verificationResults.licenseData.status)}`}>
                        {verificationResults.licenseData.status}
                      </span>
                      {getStatusIcon(verificationResults.licenseData.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-blue-50 rounded-lg p-4 lg:p-6">
              <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                Address Information
              </h4>
              <p className="text-sm text-gray-700">
                {verificationResults.licenseData.address}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => alert('License verification documented in system')}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Shield className="w-4 lg:w-5 h-4 lg:h-5" />
                <span>Document Verification</span>
              </button>
              
              <button
                onClick={() => {
                  setVerificationResults({
                    isValid: false,
                    hasResults: false,
                    licenseData: {
                      licenseNumber: '',
                      holderName: '',
                      dateOfBirth: '',
                      address: '',
                      licenseClass: '',
                      issueDate: '',
                      expiryDate: '',
                      status: '',
                      restrictions: ''
                    }
                  });
                  setLicenseNumber('');
                }}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Clear Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick License Examples */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h4 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">
          Quick License Examples
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
          {['DL123456789', 'DL987654321', 'DL456789123', 'DL789123456'].map((license, index) => (
            <button
              key={index}
              onClick={() => setLicenseNumber(license)}
              className="px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-center font-mono"
            >
              {license}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerifyLicense;