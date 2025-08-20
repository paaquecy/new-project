import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Calendar, User, MapPin, Camera } from 'lucide-react';
import { acceptViolation, rejectViolation, mockViolations } from '../data/mockData';
import { Violation } from '../types';

interface ViolationDetailsModalProps {
  violation: Violation | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (violationId: string) => void;
  onReject?: (violationId: string, reason?: string) => void;
}

const ViolationDetailsModal: React.FC<ViolationDetailsModalProps> = ({
  violation,
  isOpen,
  onClose,
  onAccept,
  onReject
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !violation) return null;

  const handleAccept = () => {
    const success = acceptViolation(violation.id);
    if (success) {
      alert('Violation accepted successfully!');
      if (onAccept) onAccept(violation.id);
    } else {
      alert('Failed to accept violation. Please try again.');
    }
    onClose();
  };

  const handleReject = () => {
    const success = rejectViolation(violation.id, rejectionReason);
    if (success) {
      alert('Violation rejected successfully!');
      if (onReject) onReject(violation.id, rejectionReason);
    } else {
      alert('Failed to reject violation. Please try again.');
    }
    setShowRejectForm(false);
    setRejectionReason('');
    onClose();
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Violation Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Plate Number:</span>
                    <span className="font-mono font-bold text-lg sm:text-xl text-gray-900">
                      {violation.plateNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offense Info */}
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Offense Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Offense Type:</span>
                    <p className="font-semibold text-red-700 text-base sm:text-lg">{violation.offense}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p className="text-gray-900 mt-1">{violation.description}</p>
                  </div>
                </div>
              </div>

              {/* Officer Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Reporting Officer</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">Officer:</span>
                    <span className="font-medium text-gray-900">{violation.capturedBy}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono text-gray-900">{violation.officerId}</span>
                  </div>
                </div>
              </div>

              {/* Time and Location */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Time & Location</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(violation.dateTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900">{violation.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Evidence */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Evidence</span>
                </h3>
                {violation.imageUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={violation.imageUrl}
                      alt="Violation Evidence"
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Current Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-yellow-700 capitalize">{violation.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {violation.status === 'pending' && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              {!showRejectForm ? (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Accept Violation</span>
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 bg-red-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Reject Violation</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Provide a reason for rejecting this violation..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleReject}
                      className="flex-1 bg-red-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViolationDetailsModal;