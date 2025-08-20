import React, { useState } from 'react';
import { 
  FileText, 
  Camera, 
  Send, 
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

const FieldReporting = () => {
  const [formData, setFormData] = useState({
    reportTitle: '',
    reportType: '',
    location: '',
    description: '',
    dateTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const reportTypes = [
    'Traffic Stop',
    'Incident Report',
    'Community Patrol',
    'Suspicious Activity',
    'Accident Report',
    'Noise Complaint',
    'Theft Report',
    'Vandalism',
    'Public Disturbance',
    'Other'
  ];

  // Mock recent reports data
  const [recentReports] = useState([
    {
      id: 1,
      title: 'Traffic Stop - Speeding',
      dateTime: '2023-10-26 10:30 AM',
      status: 'Submitted'
    },
    {
      id: 2,
      title: 'Suspicious Activity - Park',
      dateTime: '2023-10-26 09:15 AM',
      status: 'Approved'
    },
    {
      id: 3,
      title: 'Community Patrol Log',
      dateTime: '2023-10-25 08:45 PM',
      status: 'Draft'
    },
    {
      id: 4,
      title: 'Noise Complaint - Residential',
      dateTime: '2023-10-25 07:20 PM',
      status: 'Submitted'
    },
    {
      id: 5,
      title: 'Vehicle Accident Report',
      dateTime: '2023-10-25 03:30 PM',
      status: 'Approved'
    }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus('');
    }
  };

  const handleAttachMedia = () => {
    // Simulate media attachment process
    alert('Media attachment feature would open camera/file picker here');
  };

  const handleSubmitReport = () => {
    // Validate form
    if (!formData.reportTitle.trim()) {
      setSubmitStatus('error');
      alert('Please enter a report title');
      return;
    }
    
    if (!formData.reportType) {
      setSubmitStatus('error');
      alert('Please select a report type');
      return;
    }

    if (!formData.location.trim()) {
      setSubmitStatus('error');
      alert('Please enter a location');
      return;
    }

    if (!formData.description.trim()) {
      setSubmitStatus('error');
      alert('Please provide a description');
      return;
    }

    if (!formData.dateTime.trim()) {
      setSubmitStatus('error');
      alert('Please enter date and time');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    // Simulate submission process
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          reportTitle: '',
          reportType: '',
          location: '',
          description: '',
          dateTime: ''
        });
        setSubmitStatus('');
      }, 2000);
    }, 2000);
  };

  const handleViewDetails = (report) => {
    alert(`Viewing details for report: ${report.title}\nDate: ${report.dateTime}\nStatus: ${report.status}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'Approved':
        return 'bg-green-100 text-green-700 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />;
      case 'Draft':
        return <AlertCircle className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />;
      case 'Approved':
        return <CheckCircle className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Submit New Report Card - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 lg:p-8">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
            <FileText className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
            Submit New Report
          </h3>
          
          <div className="space-y-4 lg:space-y-6">
            {/* Report Title */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Report Title
              </label>
              <input
                type="text"
                placeholder="e.g., Traffic Stop Incident"
                value={formData.reportTitle}
                onChange={(e) => handleInputChange('reportTitle', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Report Type
              </label>
              <div className="relative">
                <select
                  value={formData.reportType}
                  onChange={(e) => handleInputChange('reportType', e.target.value)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors duration-200 text-sm lg:text-base"
                >
                  <option value="">Select type</option>
                  {reportTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Main St & Oak Ave"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Provide detailed description of the event..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <label className="block text-sm lg:text-base font-medium text-gray-700">
                Date & Time
              </label>
              <input
                type="text"
                placeholder="MM/DD/YYYY HH:MM AM/PM"
                value={formData.dateTime}
                onChange={(e) => handleInputChange('dateTime', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
              <button
                onClick={handleAttachMedia}
                className="w-full flex items-center justify-center px-4 lg:px-6 py-3 lg:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm lg:text-base"
              >
                <Camera className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
                Attach Media
              </button>

              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-4 lg:px-6 py-3 lg:py-4 rounded-lg font-semibold transition-colors duration-200 text-sm lg:text-base ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : submitStatus === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 lg:h-5 w-4 lg:w-5 border-b-2 border-white mr-2 lg:mr-3"></div>
                    Submitting...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
                    Report Submitted Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
                    Submit Report
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {submitStatus === 'error' && (
              <div className="flex items-center p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 lg:w-5 h-4 lg:h-5 text-red-500 mr-2 lg:mr-3" />
                <span className="text-red-700 font-medium text-sm lg:text-base">
                  Please fill in all required fields before submitting.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports Card - Takes 1/3 width on large screens */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
            <Clock className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Recent Reports
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="space-y-2 lg:space-y-3">
                  <h4 className="text-sm lg:text-base font-semibold text-gray-800 leading-tight">
                    {report.title}
                  </h4>
                  
                  <p className="text-xs lg:text-sm text-gray-600">
                    {report.dateTime}
                  </p>
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      {report.status}
                    </span>
                    
                    <button
                      onClick={() => handleViewDetails(report)}
                      className="inline-flex items-center px-2 lg:px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Report Types */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h4 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">
          Quick Report Types
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
          {reportTypes.slice(0, 10).map((type, index) => (
            <button
              key={index}
              onClick={() => handleInputChange('reportType', type)}
              className="px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-center"
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldReporting;