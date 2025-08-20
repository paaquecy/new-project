import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Search, 
  ChevronDown, 
  FileText, 
  Calendar, 
  Car, 
  CreditCard, 
  ClipboardList, 
  ListChecks,
  Upload,
  X
} from 'lucide-react';

interface FormData {
  fineId: string;
  offenseDescription: string;
  dateTime: string;
  location: string;
  amount: string;
  paymentStatus: string;
  vehiclePlate: string;
  vehicleMakeModel: string;
  ownerName: string;
  ownerContact: string;
  paymentMethod: string;
  markedAsCleared: boolean;
  notes: string;
}

const ClearFines: React.FC = () => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceDragActive, setEvidenceDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    fineId: 'FINE-001234',
    offenseDescription: 'Speeding (45mph in 30mph zone)',
    dateTime: '26/10/2023, 10:30 AM',
    location: 'High Street, London SW1A 0AA',
    amount: '150.00',
    paymentStatus: 'Unpaid',
    vehiclePlate: 'AB12 CDE',
    vehicleMakeModel: 'Toyota Camry',
    ownerName: 'Jane Doe',
    ownerContact: '+44 7700 900123, jane.doe@example.com',
    paymentMethod: '',
    markedAsCleared: false,
    notes: ''
  });

  const statusOptions = ['All', 'Paid', 'Unpaid', 'Overdue'];
  const paymentMethods = ['Card', 'Mobile Money', 'Bank Transfer'];

  const auditLogs = [
    {
      id: '1',
      timestamp: '2023-10-26 11:45 AM',
      action: 'Fine details updated by John Doe',
      user: 'John Doe'
    },
    {
      id: '2',
      timestamp: '2023-10-26 10:30 AM',
      action: 'Fine created by System',
      user: 'System'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handleDrag = (e: React.DragEvent, type: 'payment' | 'evidence') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === 'payment') {
        setDragActive(true);
      } else {
        setEvidenceDragActive(true);
      }
    } else if (e.type === "dragleave") {
      if (type === 'payment') {
        setDragActive(false);
      } else {
        setEvidenceDragActive(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'payment' | 'evidence') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'payment') {
      setDragActive(false);
    } else {
      setEvidenceDragActive(false);
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      if (type === 'payment') {
        setUploadedFiles(prev => [...prev, ...files]);
      } else {
        setEvidenceFiles(prev => [...prev, ...files]);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'evidence') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (type === 'payment') {
        setUploadedFiles(prev => [...prev, ...files]);
      } else {
        setEvidenceFiles(prev => [...prev, ...files]);
      }
    }
  };

  const removeFile = (index: number, type: 'payment' | 'evidence') => {
    if (type === 'payment') {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSearch = () => {
    console.log('Search:', searchTerm, 'Status:', statusFilter);
  };

  const handleViewLinkedOffenses = () => {
    console.log('View linked offenses');
  };

  const handleGenerateReceipt = () => {
    console.log('Generate receipt');
  };

  const handleVerifyPayment = () => {
    console.log('Verify payment');
  };

  const handleCancel = () => {
    console.log('Cancel');
  };

  const handleSaveChanges = () => {
    console.log('Save changes:', formData);
  };

  const handleClearFine = () => {
    console.log('Clear fine:', formData);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}></h1>
        <p className={`text-sm sm:text-base transition-colors duration-200 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}></p>
      </div>

      {/* Search and Filter Section */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8 transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors duration-200 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="text"
              placeholder="Search by Plate or Fine ID (e.g., AB12 CDE or FINE-001)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full sm:w-auto flex items-center space-x-2 px-4 py-2 sm:py-3 border rounded-lg hover:bg-gray-50 transition-all duration-200 justify-between min-w-[140px] ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Filter: {statusFilter}</span>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-full border rounded-lg shadow-lg z-10 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setStatusFilter(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                      statusFilter === option 
                        ? 'bg-blue-50 text-blue-600' 
                        : `${darkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'}`
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column */}
        <div className="space-y-6 sm:space-y-8">
          {/* Fine Details Card */}
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <FileText className={`transition-colors duration-200 ${
                darkMode ? 'text-blue-400' : 'text-blue-500'
              }`} size={20} />
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Fine Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fine ID / Reference Number
                </label>
                <input
                  type="text"
                  value={formData.fineId}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Offense Description
                </label>
                <input
                  type="text"
                  value={formData.offenseDescription}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date and Time of Offense
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.dateTime}
                    readOnly
                    className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed pr-10 transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-300' 
                        : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Location of Offense
                </label>
                <input
                  type="text"
                  value={formData.location}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount to be Paid (£)
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment & Proof Card */}
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className={`transition-colors duration-200 ${
                darkMode ? 'text-blue-400' : 'text-blue-500'
              }`} size={20} />
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Payment & Proof</h3>
            </div>
            
            <div className="space-y-6">
              {/* Payment Options */}
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Options
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={() => handlePaymentMethodChange(method)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`transition-colors duration-200 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Upload Payment Proof */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Upload Payment Proof
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : `${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'payment')}
                  onDragLeave={(e) => handleDrag(e, 'payment')}
                  onDragOver={(e) => handleDrag(e, 'payment')}
                  onDrop={(e) => handleDrop(e, 'payment')}
                >
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileInput(e, 'payment')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className={`mx-auto mb-3 transition-colors duration-200 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} size={32} />
                  <p className={`mb-1 transition-colors duration-200 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Drag & drop files here or click to browse
                  </p>
                  <p className={`text-sm transition-colors duration-200 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Supported formats: PDF, JPG, PNG
                  </p>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <span className={`text-sm transition-colors duration-200 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'payment')}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="markedAsCleared"
                  checked={formData.markedAsCleared}
                  onChange={handleInputChange}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <label className={`text-sm transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mark as Cleared (Admin Use)
                </label>
              </div>

              {/* Generate Receipt Button */}
              <button
                onClick={handleGenerateReceipt}
                className="w-full border border-green-500 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 font-medium"
              >
                Generate & Download Receipt
              </button>
            </div>
          </div>

          {/* Audit Trail Card */}
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <ListChecks className={`transition-colors duration-200 ${
                darkMode ? 'text-blue-400' : 'text-blue-500'
              }`} size={20} />
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Audit Trail</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Timestamp of Last Update
                </label>
                <p className={`text-sm transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  2023-10-26 11:45 AM by John Doe
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Action History / Logs
                </label>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className={`p-3 rounded-lg border-l-4 border-blue-500 transition-colors duration-200 ${
                      darkMode ? 'bg-gray-700' : 'bg-blue-50'
                    }`}>
                      <p className={`text-sm font-medium transition-colors duration-200 ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {log.timestamp}: {log.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 sm:space-y-8">
          {/* Vehicle & Owner Information Card */}
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <Car className={`transition-colors duration-200 ${
                darkMode ? 'text-blue-400' : 'text-blue-500'
              }`} size={20} />
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Vehicle & Owner Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Vehicle Number Plate
                </label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Vehicle Make/Model
                </label>
                <input
                  type="text"
                  value={formData.vehicleMakeModel}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Owner's Name
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Owner's Contact Information
                </label>
                <input
                  type="text"
                  value={formData.ownerContact}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Offense History
                </label>
                <button
                  onClick={handleViewLinkedOffenses}
                  className="w-full border border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  View Linked Offenses
                </button>
              </div>
            </div>
          </div>

          {/* Administrative Actions Card */}
          <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <ClipboardList className={`transition-colors duration-200 ${
                darkMode ? 'text-blue-400' : 'text-blue-500'
              }`} size={20} />
              <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Administrative Actions</h3>
            </div>
            
            <div className="space-y-6">
              {/* Verify Payment Button */}
              <button
                onClick={handleVerifyPayment}
                className="w-full border border-green-500 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 font-medium"
              >
                Verify Payment
              </button>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Attach Notes or Evidence
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add notes or details about the fine..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Upload Evidence */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Upload Evidence (Image/Video)
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    evidenceDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : `${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'evidence')}
                  onDragLeave={(e) => handleDrag(e, 'evidence')}
                  onDragOver={(e) => handleDrag(e, 'evidence')}
                  onDrop={(e) => handleDrop(e, 'evidence')}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileInput(e, 'evidence')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className={`mx-auto mb-3 transition-colors duration-200 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} size={32} />
                  <p className={`mb-1 transition-colors duration-200 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Drag & drop files here or click to browse
                  </p>
                  <p className={`text-sm transition-colors duration-200 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Supported formats: JPG, PNG, MP4, MOV
                  </p>
                </div>
                
                {evidenceFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {evidenceFiles.map((file, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <span className={`text-sm transition-colors duration-200 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'evidence')}
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
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
        <button
          onClick={handleCancel}
          className={`w-full sm:w-auto px-6 py-3 border rounded-lg font-medium transition-all duration-200 ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChanges}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
        >
          Save Changes
        </button>
        <button
          onClick={handleClearFine}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
        >
          Clear Fine
        </button>
      </div>
    </div>
  );
};

export default ClearFines;