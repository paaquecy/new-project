import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import FileUpload from '../../components/FileUpload';
import {
  Flag,
  Camera,
  Send,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ViolationFlagging = () => {
  const { submitViolation, addNotification } = useData();
  const [formData, setFormData] = useState({
    licensePlate: '',
    violationType: '',
    violationDetails: '',
    location: '',
    fine: 0,
    evidenceUrls: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const violationTypes = [
    'Illegal Parking',
    'Speeding',
    'Running Red Light',
    'Expired License',
    'No Insurance',
    'Reckless Driving',
    'DUI/DWI',
    'Improper Lane Change',
    'Failure to Stop',
    'Other'
  ];

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

  const handleAttachEvidence = () => {
    // Simulate file attachment process
    alert('Evidence attachment feature would open camera/file picker here');
  };

  const handleEvidenceUploaded = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      evidenceUrls: [...prev.evidenceUrls, ...urls]
    }));
  };

  const handleSubmitViolation = async () => {
    // Validate form
    if (!formData.licensePlate.trim()) {
      setSubmitStatus('error');
      alert('Please enter a license plate number');
      return;
    }

    if (!formData.violationType) {
      setSubmitStatus('error');
      alert('Please select a violation type');
      return;
    }

    if (!formData.violationDetails.trim()) {
      setSubmitStatus('error');
      alert('Please provide violation details');
      return;
    }

    if (!formData.location.trim()) {
      setSubmitStatus('error');
      alert('Please enter violation location');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      // Submit violation to Supabase
      await submitViolation({
        plateNumber: formData.licensePlate.toUpperCase(),
        violationType: formData.violationType,
        violationDetails: formData.violationDetails,
        location: formData.location,
        fineAmount: formData.fine || getDefaultFine(formData.violationType),
        evidenceUrls: formData.evidenceUrls
      });

      setIsSubmitting(false);
      setSubmitStatus('success');

      // Add notification
      addNotification({
        title: 'Violation Submitted',
        message: `Violation ${formData.violationType} submitted for plate ${formData.licensePlate}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        system: 'Police App'
      });

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          licensePlate: '',
          violationType: '',
          violationDetails: '',
          location: '',
          fine: 0,
          evidenceUrls: []
        });
        setSubmitStatus('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit violation:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      alert('Failed to submit violation. Please try again.');
    }
  };

  const getDefaultFine = (violationType: string): number => {
    const fineMap: Record<string, number> = {
      'Illegal Parking': 50,
      'Speeding': 150,
      'Running Red Light': 200,
      'Expired License': 100,
      'No Insurance': 300,
      'Reckless Driving': 500,
      'DUI/DWI': 1000,
      'Improper Lane Change': 75,
      'Failure to Stop': 100,
      'Other': 50
    };
    return fineMap[violationType] || 50;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6 lg:mb-8 flex items-center">
          <Flag className="w-5 lg:w-6 h-5 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
          Flag New Violation
        </h3>
        
        <div className="space-y-4 lg:space-y-6">
          {/* License Plate Number */}
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700">
              License Plate Number
            </label>
            <input
              type="text"
              placeholder="e.g., GH-1234-20"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base lg:text-lg text-center transition-colors duration-200"
              maxLength={10}
            />
          </div>

          {/* Violation Type */}
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700">
              Violation Type
            </label>
            <div className="relative">
              <select
                value={formData.violationType}
                onChange={(e) => handleInputChange('violationType', e.target.value)}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors duration-200 text-sm lg:text-base"
              >
                <option value="">Select a violation type</option>
                {violationTypes.map((type, index) => (
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
              placeholder="e.g., Accra-Tema Motorway, Osu Circle"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
            />
          </div>

          {/* Fine Amount */}
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700">
              Fine Amount (GH₵)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm lg:text-base">GH₵</span>
              <input
                type="number"
                placeholder="0"
                value={formData.fine || ''}
                onChange={(e) => handleInputChange('fine', parseInt(e.target.value) || 0)}
                className="w-full pl-12 pr-3 lg:pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm lg:text-base"
                min="0"
              />
            </div>
            {formData.violationType && (
              <p className="text-xs text-gray-500">
                Default fine for {formData.violationType}: GH₵{getDefaultFine(formData.violationType)}
              </p>
            )}
          </div>

          {/* Violation Details / Notes */}
          <div className="space-y-2">
            <label className="block text-sm lg:text-base font-medium text-gray-700">
              Violation Details / Notes
            </label>
            <textarea
              placeholder="Provide details about the violation..."
              value={formData.violationDetails}
              onChange={(e) => handleInputChange('violationDetails', e.target.value)}
              rows={4}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors duration-200 text-sm lg:text-base"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
            {/* File Upload Component */}
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                Attach Evidence (Photos/Videos)
              </label>
              <FileUpload
                onFilesUploaded={handleEvidenceUploaded}
                accept="image/*,video/*"
                multiple={true}
                maxFiles={5}
                bucket="evidence"
              />
            </div>

            <button
              onClick={handleSubmitViolation}
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
                  Violation Submitted Successfully!
                </>
              ) : (
                <>
                  <Send className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
                  Submit Violation Report
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {submitStatus === 'error' && (
            <div className="flex items-center p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 lg:w-5 h-4 lg:h-5 text-red-500 mr-2 lg:mr-3" />
              <span className="text-red-700 font-medium">
                Please fill in all required fields before submitting.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h4 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">
          Common Violation Types
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
          {violationTypes.slice(0, 10).map((type, index) => (
            <button
              key={index}
              onClick={() => handleInputChange('violationType', type)}
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

export default ViolationFlagging;
