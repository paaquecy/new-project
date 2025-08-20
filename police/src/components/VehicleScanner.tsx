import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Scan, 
  Eye, 
  Camera,
  CheckCircle,
  AlertCircle,
  FileText,
  Square,
  Play,
  Pause
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { plateDetector, PlateDetectionResult } from '../utils/plateDetection';

const VehicleScanner = () => {
  const [plateInput, setPlateInput] = useState('');
  const [scanResults, setScanResults] = useState({
    plateNumber: 'N/A',
    vehicleModel: 'N/A',
    owner: 'N/A',
    status: 'No Violations',
    statusType: 'clean'
  });
  const [isScanning, setIsScanning] = useState(false);
  const [detectionResult, setDetectionResult] = useState<PlateDetectionResult | null>(null);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  const {
    videoRef,
    canvasRef,
    isActive: cameraActive,
    isLoading: cameraLoading,
    error: cameraError,
    permissionStatus,
    startCamera,
    stopCamera,
    captureFrame
  } = useCamera();

  // Initialize OpenCV when component mounts
  useEffect(() => {
    plateDetector.initialize().catch(console.error);
    
    return () => {
      plateDetector.cleanup();
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanInterval]);

  const performPlateDetection = useCallback(async () => {
    if (!cameraActive || !videoRef.current) return;

    try {
      const result = await plateDetector.detectPlate(videoRef.current);
      
      if (result && result.confidence > 0.7) {
        setDetectionResult(result);
        
        // Auto-populate scan results with detected plate
        const mockResults = {
          plateNumber: result.plateNumber,
          vehicleModel: '2020 Toyota Camry',
          owner: 'Jane Doe',
          status: Math.random() > 0.5 ? 'No Violations' : 'Outstanding Parking Ticket',
          statusType: Math.random() > 0.5 ? 'clean' : 'violation'
        };
        
        setScanResults(mockResults);
        setIsScanning(false);
        
        // Stop continuous scanning after successful detection
        if (scanInterval) {
          clearInterval(scanInterval);
          setScanInterval(null);
        }
      }
    } catch (error) {
      console.error('Error during plate detection:', error);
    }
  }, [cameraActive, scanInterval]);

  const handleStartScan = async () => {
    if (!cameraActive) {
      await startCamera();
    }
    
    setIsScanning(true);
    setDetectionResult(null);
    
    // Start continuous plate detection
    const interval = setInterval(performPlateDetection, 1000); // Scan every second
    setScanInterval(interval);
    
    // Stop scanning after 30 seconds if no plate detected
    setTimeout(() => {
      if (scanInterval) {
        clearInterval(interval);
        setScanInterval(null);
        setIsScanning(false);
      }
    }, 30000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
  };

  const handleManualLookup = () => {
    if (plateInput.trim()) {
      setIsScanning(true);
      
      // Simulate lookup process
      setTimeout(() => {
        const mockResults = {
          plateNumber: plateInput.toUpperCase(),
          vehicleModel: '2020 Toyota Camry',
          owner: 'Jane Doe',
          status: 'Outstanding Parking Ticket',
          statusType: 'violation'
        };
        setScanResults(mockResults);
        setIsScanning(false);
      }, 2000);
    }
  };

  const handleDocumentEvidence = () => {
    const frame = captureFrame();
    if (frame) {
      // In a real app, you would save this frame as evidence
      alert('Evidence frame captured and would be saved to the case file');
    } else {
      alert('Evidence documentation feature would be implemented here');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Row 1 - Live Camera Feed */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Camera className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
          Live Camera Feed with OpenCV Plate Detection
        </h3>
        
        {/* Camera Feed Area */}
        <div className="relative w-full h-48 sm:h-64 lg:h-80 rounded-lg border-2 border-dashed overflow-hidden mb-4 lg:mb-6 transition-all duration-300 bg-gray-900">
          {cameraError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white p-4">
                <AlertCircle className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-4 text-red-400" />
                <p className="font-medium text-sm lg:text-base">Camera Access Required</p>
                <p className="text-xs lg:text-sm text-gray-300 mt-2 mb-4">{cameraError}</p>
                {(cameraError?.includes('permission') || permissionStatus === 'denied') && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">To use the camera scanner:</p>
                    <ol className="text-xs text-gray-400 text-left space-y-1">
                      <li>1. Click the camera icon in your browser's address bar</li>
                      <li>2. Select "Allow" for camera access</li>
                      <li>3. Click "Grant Camera Permission" below</li>
                    </ol>
                  </div>
                )}
                {permissionStatus === 'prompt' && !cameraError && (
                  <p className="text-xs text-yellow-400 mb-4">Camera permission is required. Click below to grant access.</p>
                )}
                <button
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Grant Camera Permission
                </button>
              </div>
            </div>
          ) : cameraLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 lg:h-12 w-8 lg:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="font-medium text-sm lg:text-base">Initializing Camera...</p>
              </div>
            </div>
          ) : cameraActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Detection Overlay */}
              {detectionResult && (
                <div 
                  className="absolute border-2 border-green-400 bg-green-400 bg-opacity-20"
                  style={{
                    left: `${(detectionResult.boundingBox.x / videoRef.current?.videoWidth || 1) * 100}%`,
                    top: `${(detectionResult.boundingBox.y / videoRef.current?.videoHeight || 1) * 100}%`,
                    width: `${(detectionResult.boundingBox.width / videoRef.current?.videoWidth || 1) * 100}%`,
                    height: `${(detectionResult.boundingBox.height / videoRef.current?.videoHeight || 1) * 100}%`
                  }}
                >
                  <div className="absolute -top-8 left-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {detectionResult.plateNumber} ({Math.round(detectionResult.confidence * 100)}%)
                  </div>
                </div>
              )}
              
              {/* Scanning Indicator */}
              {isScanning && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <div className="animate-pulse w-2 h-2 bg-white rounded-full mr-2"></div>
                  Scanning...
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Camera className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 text-gray-400" />
                <p className="font-medium text-sm lg:text-base">Camera Ready</p>
                <p className="text-xs lg:text-sm text-gray-300 mt-2">Click "Start Scan" to activate camera and begin plate detection</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Controls */}
        <div className="flex gap-3">
          {!cameraActive ? (
            <button
              onClick={handleStartScan}
              disabled={cameraLoading}
              className="flex-1 py-3 lg:py-4 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            >
              <Play className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
              Start Camera & Scan
            </button>
          ) : (
            <>
              {!isScanning ? (
                <button
                  onClick={handleStartScan}
                  className="flex-1 py-3 lg:py-4 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base bg-green-600 hover:bg-green-700 flex items-center justify-center"
                >
                  <Scan className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                  Start Plate Detection
                </button>
              ) : (
                <button
                  onClick={handleStopScan}
                  className="flex-1 py-3 lg:py-4 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base bg-red-600 hover:bg-red-700 flex items-center justify-center"
                >
                  <Pause className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                  Stop Scanning
                </button>
              )}
              
              <button
                onClick={stopCamera}
                className="px-4 lg:px-6 py-3 lg:py-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 text-sm lg:text-base flex items-center justify-center"
              >
                <Square className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                Stop Camera
              </button>
            </>
          )}
        </div>
      </div>

      {/* Row 2 - Manual Entry and Scan Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Manual Plate Entry */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Eye className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Manual Plate Entry
          </h3>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter license plate number"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-base lg:text-lg"
              maxLength={10}
            />
            
            <button
              onClick={handleManualLookup}
              disabled={!plateInput.trim() || isScanning}
              className={`w-full py-2 lg:py-3 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base ${
                !plateInput.trim() || isScanning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isScanning ? 'Looking up...' : 'Lookup Plate'}
            </button>
          </div>
        </div>

        {/* Scan Results */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Scan Results
            {detectionResult && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                OpenCV Detected
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 gap-2">
                <span className="text-sm font-medium text-gray-600">Plate Number:</span>
                <span className="text-sm font-semibold text-gray-800 font-mono truncate">
                  {scanResults.plateNumber}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 gap-2">
                <span className="text-sm font-medium text-gray-600">Vehicle Model:</span>
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {scanResults.vehicleModel}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 gap-2">
                <span className="text-sm font-medium text-gray-600">Owner:</span>
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {scanResults.owner}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {scanResults.statusType === 'clean' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${
                    scanResults.statusType === 'clean' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {scanResults.status}
                  </span>
                </div>
              </div>

              {detectionResult && (
                <div className="flex justify-between items-center py-2 border-t border-gray-100 gap-2">
                  <span className="text-sm font-medium text-gray-600">Detection Confidence:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(detectionResult.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDocumentEvidence}
              disabled={scanResults.plateNumber === 'N/A'}
              className={`w-full py-2 lg:py-3 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base ${
                scanResults.plateNumber === 'N/A'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Document Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleScanner;
