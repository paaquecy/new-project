import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { yoloPlateDetector, PlateDetectionResult } from '../utils/yoloPlateDetection';
import { simplePlateDetector } from '../utils/simplePlateDetection';
import { customYOLODetector } from '../utils/customModelDetection';
import { geminiPlateDetector } from '../utils/geminiPlateDetection';
import { useData } from '../../contexts/DataContext';
import DetectionMetrics from './DetectionMetrics';

const VehicleScanner = () => {
  const { lookupVehicle, api } = useData();
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
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isMounted, setIsMounted] = useState(false);
  const [usingSimpleDetector, setUsingSimpleDetector] = useState(false);
  const [usingCustomModel, setUsingCustomModel] = useState(false);
  const [detectorType, setDetectorType] = useState<'gemini' | 'custom' | 'yolo' | 'simple'>('gemini');
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [plateDetectedFromImage, setPlateDetectedFromImage] = useState(false);
  const autoStartRef = useRef(false);

  const {
    videoRef,
    canvasRef,
    isActive: cameraActive,
    isLoading: cameraLoading,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame
  } = useCamera();

  // Auto-start detection when camera becomes active
  useEffect(() => {
    console.log('���� Auto-start check - Camera:', cameraActive, 'Scanning:', isScanning, 'Interval:', !!scanInterval);

    if (cameraActive && !isScanning && !scanInterval) {
      console.log('🚀 Camera is active and not scanning, auto-starting plate detection...');

      // Small delay to ensure camera is fully ready
      const autoStartTimer = setTimeout(() => {
        console.log('⏰ Auto-start timer triggered, calling handleStartScan');
        handleStartScan();
      }, 1500); // Increased delay to ensure camera is ready

      return () => {
        console.log('🧹 Cleaning up auto-start timer');
        clearTimeout(autoStartTimer);
      };
    }
  }, [cameraActive, isScanning, scanInterval]);

  // Track component mount status
  useEffect(() => {
    setIsMounted(true);
    console.log('VehicleScanner component mounted');

    return () => {
      setIsMounted(false);
      console.log('VehicleScanner component unmounting');
    };
  }, []);

  // Check camera permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(permission.state as 'granted' | 'denied' | 'prompt');

          permission.addEventListener('change', () => {
            setPermissionStatus(permission.state as 'granted' | 'denied' | 'prompt');
          });
        }
      } catch (error) {
        console.log('Permissions API not supported');
        setPermissionStatus('unknown');
      }
    };

    checkPermissions();
  }, []);

  // Initialize detection system with Gemini priority
  useEffect(() => {
    const initializeDetector = async () => {
      // Try Gemini Vision API first
      try {
        console.log('Starting Gemini Vision API initialization...');
        await geminiPlateDetector.initialize();
        console.log('Gemini Vision API initialized successfully');
        setDetectorType('gemini');
        setUsingCustomModel(false);
        setUsingSimpleDetector(false);
        return;
      } catch (error) {
        console.warn('Failed to initialize Gemini detector, trying custom model:', error);
      }

      // Fallback to custom model
      try {
        console.log('Starting custom YOLO detector initialization...');
        await customYOLODetector.initialize();
        console.log('Custom YOLO detector initialized successfully');
        setDetectorType('custom');
        setUsingCustomModel(true);
        setUsingSimpleDetector(false);
        return;
      } catch (error) {
        console.warn('Failed to initialize custom detector, trying standard YOLO:', error);
      }

      // Fallback to standard YOLO + EasyOCR
      try {
        console.log('Starting standard YOLOv8 + EasyOCR detector initialization...');
        await yoloPlateDetector.initialize();
        console.log('Standard YOLOv8 + EasyOCR detector initialized successfully');
        setDetectorType('yolo');
        setUsingCustomModel(false);
        setUsingSimpleDetector(false);
        return;
      } catch (error) {
        console.warn('Failed to initialize YOLO detector, falling back to simple detector:', error);
      }

      // Final fallback to simple detector
      try {
        await simplePlateDetector.initialize();
        console.log('Simple detector initialized as final fallback');
        setDetectorType('simple');
        setUsingCustomModel(false);
        setUsingSimpleDetector(true);
      } catch (fallbackError) {
        console.error('Failed to initialize any detector:', fallbackError);
      }
    };

    initializeDetector();

    return () => {
      // Cleanup based on which detector is active
      switch (detectorType) {
        case 'gemini':
          geminiPlateDetector.cleanup();
          break;
        case 'custom':
          customYOLODetector.cleanup();
          break;
        case 'yolo':
          yoloPlateDetector.cleanup();
          break;
        case 'simple':
          simplePlateDetector.cleanup();
          break;
      }

      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanInterval, detectorType]);

  // Log permission status changes for debugging
  useEffect(() => {
    console.log('Camera permission status changed:', permissionStatus);
  }, [permissionStatus]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Use back camera on mobile devices
        }
      });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      alert('Camera permission granted! You can now start scanning.');
    } catch (error) {
      setPermissionStatus('denied');
      alert('Camera permission denied. Please enable camera access in your browser settings.');
    }
  };

  const performPlateDetection = useCallback(async () => {
    console.log('🔍 performPlateDetection called - Camera Active:', cameraActive, 'Video Ref:', !!videoRef.current);

    // Increment detection attempts first to show activity
    setDetectionAttempts(prev => {
      const newCount = prev + 1;
      console.log('📊 Detection attempt #', newCount);
      return newCount;
    });

    if (!cameraActive) {
      console.warn('❌ Camera not active, skipping detection');
      return;
    }

    if (!videoRef.current) {
      console.warn('❌ Video ref not available, skipping detection');
      return;
    }

    // Add timeout wrapper to prevent infinite processing
    const detectionTimeout = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('⏰ Detection attempt timed out after 8 seconds');
        resolve(null);
      }, 8000);
    });

    try {
      console.log('🎯 Running plate detection attempt #', detectionAttempts + 1, 'with',
        detectorType === 'gemini' ? 'Gemini Vision API' :
        detectorType === 'custom' ? 'custom trained model' :
        detectorType === 'yolo' ? 'standard YOLOv8 + EasyOCR' : 'simple detector');

      let result;
      const detectionPromise = (async () => {
        switch (detectorType) {
          case 'gemini':
            return await geminiPlateDetector.detectPlate(videoRef.current);
          case 'custom':
            return await customYOLODetector.detectPlate(videoRef.current);
          case 'yolo':
            return await yoloPlateDetector.detectPlate(videoRef.current);
          case 'simple':
            return await simplePlateDetector.detectPlate(videoRef.current);
          default:
            return await geminiPlateDetector.detectPlate(videoRef.current);
        }
      })();

      // Race between detection and timeout
      result = await Promise.race([detectionPromise, detectionTimeout]);

      // Adjust confidence thresholds based on detector type
      const minConfidence = detectorType === 'gemini' ? 0.7 :
                           detectorType === 'custom' ? 0.4 :
                           detectorType === 'yolo' ? 0.3 : 0.35;
      const minOcrConfidence = detectorType === 'gemini' ? 0.8 :
                              detectorType === 'custom' ? 0.5 :
                              detectorType === 'yolo' ? 0.4 : 0.45;

      console.log('🎯 Detection thresholds:', { minConfidence, minOcrConfidence, detectorType });

      console.log('🔍 Detection result:', {
        plateNumber: result?.plateNumber,
        confidence: result?.confidence,
        ocrConfidence: result?.ocrConfidence,
        minConfidence,
        minOcrConfidence,
        passesConfidenceCheck: result && result.confidence > minConfidence && (result.ocrConfidence || 0) > minOcrConfidence
      });

      if (result && result.confidence > minConfidence &&
          (result.ocrConfidence || 0) > minOcrConfidence) {
        console.log('✅ Plate detected successfully:', result);
        setLastDetectionTime(new Date());

        // Don't set detection result yet - wait for database lookup

        // Show success notification briefly
        console.log(`🎯 Detection successful after ${detectionAttempts + 1} attempts!`);

        // Lookup detected plate in database
        try {
          const lookup = await lookupVehicle(result.plateNumber);
          if (lookup && lookup.vehicle) {
            const vehicle = lookup.vehicle;
            // Vehicle found in database - show all details
            setScanResults({
              plateNumber: result.plateNumber, // Always show what the camera actually detected
              vehicleModel: `${vehicle.year || vehicle.year_of_manufacture || ''} ${vehicle.make || vehicle.manufacturer || ''} ${vehicle.model || ''}`.trim() || 'Unknown',
              owner: vehicle.owner_name || 'Unknown',
              status: lookup.outstandingViolations > 0 ? `${lookup.outstandingViolations} Outstanding Violation(s)` : 'No Violations',
              statusType: lookup.outstandingViolations > 0 ? 'violation' : 'clean'
            });

            // Keep detection result for camera overlay only if vehicle is registered
            setDetectionResult(result);
          } else {
            // Not found in database => show detected plate but mark as not registered
            setScanResults({
              plateNumber: result.plateNumber, // Show what was actually detected
              vehicleModel: 'N/A',
              owner: 'N/A',
              status: 'Not Registered',
              statusType: 'violation'
            });

            // Clear detection result so no overlay appears on camera
            setDetectionResult(null);
          }
        } catch (e) {
          console.error('Lookup failed after detection:', e);
          setScanResults({
            plateNumber: result.plateNumber, // Show what was actually detected
            vehicleModel: 'N/A',
            owner: 'N/A',
            status: 'Database Error',
            statusType: 'violation'
          });

          // Clear detection result on error
          setDetectionResult(null);
        }

        // Keep scanning continuously for new plates
        console.log('Plate detected successfully, continuing to scan for new plates...');

        // Brief pause before next detection to avoid rapid fire
        setTimeout(() => {
          console.log('Ready for next plate detection...');
        }, 3000);
      } else {
        if (result) {
          console.log('��� Detection failed confidence check:', {
            detected: result.plateNumber,
            confidence: `${Math.round(result.confidence * 100)}% (need >${Math.round(minConfidence * 100)}%)`,
            ocrConfidence: `${Math.round((result.ocrConfidence || 0) * 100)}% (need >${Math.round(minOcrConfidence * 100)}%)`,
            reason: result.confidence <= minConfidence ? 'Low detection confidence' : 'Low OCR confidence'
          });
        } else {
          console.log('❌ No plate detected in this frame');
        }
      }
    } catch (error) {
      console.error('Error during plate detection:', error);

      // Implement fallback chain: gemini -> custom -> yolo -> simple
      if (detectorType === 'gemini') {
        console.log('Gemini detector failed, attempting fallback to custom model...');
        try {
          await customYOLODetector.initialize();
          setDetectorType('custom');
          setUsingCustomModel(true);
          setUsingSimpleDetector(false);
        } catch (fallbackError) {
          console.log('Custom model fallback failed, trying YOLO...');
          try {
            await yoloPlateDetector.initialize();
            setDetectorType('yolo');
            setUsingCustomModel(false);
            setUsingSimpleDetector(false);
          } catch (finalError) {
            console.log('YOLO fallback failed, trying simple detector...');
            try {
              await simplePlateDetector.initialize();
              setDetectorType('simple');
              setUsingCustomModel(false);
              setUsingSimpleDetector(true);
            } catch (lastError) {
              console.error('All detectors failed:', lastError);
            }
          }
        }
      } else if (detectorType === 'custom') {
        console.log('Custom detector failed, attempting fallback to standard YOLO...');
        try {
          await yoloPlateDetector.initialize();
          setDetectorType('yolo');
          setUsingCustomModel(false);
          setUsingSimpleDetector(false);
        } catch (fallbackError) {
          console.log('YOLO fallback failed, trying simple detector...');
          try {
            await simplePlateDetector.initialize();
            setDetectorType('simple');
            setUsingCustomModel(false);
            setUsingSimpleDetector(true);
          } catch (finalError) {
            console.error('All detectors failed:', finalError);
          }
        }
      } else if (detectorType === 'yolo') {
        console.log('YOLO detector failed, attempting fallback to simple detector...');
        try {
          await simplePlateDetector.initialize();
          setDetectorType('simple');
          setUsingCustomModel(false);
          setUsingSimpleDetector(true);
        } catch (fallbackError) {
          console.error('Simple detector fallback also failed:', fallbackError);
        }
      }
    }
  }, [cameraActive, scanInterval, stopCamera, lookupVehicle, detectorType]);

  const handleStartScan = async () => {
    console.log('🎬 handleStartScan called');
    console.log('📊 Current states:', { cameraActive, cameraLoading, cameraError, permissionStatus, isScanning, scanInterval: !!scanInterval });

    try {
      if (!cameraActive) {
        console.log('���� Camera not active, starting camera...');
        await startCamera();
        console.log('✅ Camera started successfully');
      }

      console.log('🔄 Setting up detection state...');
      setIsScanning(true);
      setDetectionResult(null);
      setDetectionAttempts(0);
      setLastDetectionTime(null);

      // Start continuous plate detection
      console.log('⏱️ Setting up detection interval (1.5 seconds)...');
      const interval = setInterval(() => {
        console.log('🔍 Interval tick - calling performPlateDetection');
        performPlateDetection();
      }, 1500);

      setScanInterval(interval);

      console.log('✅ Continuous plate detection started - interval ID:', interval);
      console.log('📍 Detection will run until camera is stopped');

      // Test detection immediately
      setTimeout(() => {
        console.log('🧪 Running immediate test detection...');
        performPlateDetection();
      }, 500);

    } catch (error) {
      console.error('❌ Failed to start scanning:', error);
      setIsScanning(false);
    }
  };


  const handleStopScan = () => {
    setIsScanning(false);
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
  };

  const handleManualLookup = async () => {
    if (plateInput.trim()) {
      setIsScanning(true);
      
      try {
        const result = await lookupVehicle(plateInput.trim());
        
        if (result && result.vehicle) {
          const vehicleResults = {
            plateNumber: result.vehicle.plate_number || plateInput.trim(),
            vehicleModel: `${result.vehicle.year || ''} ${result.vehicle.make || ''} ${result.vehicle.model || ''}`.trim() || 'Unknown',
            owner: result.vehicle.owner_name || 'Unknown',
            status: result.outstandingViolations > 0 ? `${result.outstandingViolations} Outstanding Violation(s)` : 'No Violations',
            statusType: result.outstandingViolations > 0 ? 'violation' : 'clean'
          };
          setScanResults(vehicleResults);

          // Record the scan in database
          await api.recordScan(plateInput.trim(), 'Manual', result);
        } else {
          // Vehicle not found in database - show as Not Registered
          setScanResults({
            plateNumber: plateInput.trim(),
            vehicleModel: 'N/A',
            owner: 'N/A',
            status: 'Not Registered',
            statusType: 'violation'
          });
        }
      } catch (error) {
        console.error('Vehicle lookup failed:', error);
        setScanResults({
          plateNumber: plateInput.trim(),
          vehicleModel: 'N/A',
          owner: 'N/A',
          status: 'Database Error',
          statusType: 'violation'
        });
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleCapturePlate = async () => {
    console.log('📸 Capture button clicked - capturing image then performing plate detection');

    if (!cameraActive) {
      console.warn('❌ Camera not active, cannot capture');
      alert('Please start the camera first before capturing');
      return;
    }

    if (!videoRef.current) {
      console.warn('❌ Video ref not available, cannot capture');
      alert('Camera not ready for capture');
      return;
    }

    // First, capture the current camera frame
    console.log('📷 Capturing current camera frame...');

    // Trigger capture flash effect
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 200); // Flash for 200ms

    const frame = captureFrame();
    if (!frame) {
      console.warn('❌ Failed to capture camera frame');
      alert('Failed to capture camera image. Please try again.');
      return;
    }

    // Convert canvas to data URL for storage/display
    const imageDataUrl = frame.toDataURL('image/jpeg', 0.8);
    console.log('✅ Camera frame captured successfully');
    console.log('📊 Image data URL length:', imageDataUrl.length);
    console.log('📊 Image data format:', imageDataUrl.substring(0, 50));

    // Set the captured image in state for display
    setCapturedImage(imageDataUrl);

    // Show brief notification that image was captured
    setScanResults({
      plateNumber: 'Image Captured',
      vehicleModel: 'Starting Analysis',
      owner: 'Please wait',
      status: 'Processing',
      statusType: 'clean'
    });

    // Brief delay to show the capture feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reset scan results before detection
    setScanResults({
      plateNumber: 'Analyzing Captured Image...',
      vehicleModel: 'Processing',
      owner: 'Please wait',
      status: 'AI Analysis in Progress',
      statusType: 'clean'
    });

    console.log('🎯 Starting license plate detection on captured image...');

    try {
      // Analyze the captured image directly
      console.log('🔍 Analyzing captured image for plate detection...');

      let result = null;

      // Try using the captured canvas directly first (most reliable)
      console.log('🎨 Attempting detection using captured canvas directly...');
      try {
        console.log('✅ Using captured canvas for detection:', { width: frame.width, height: frame.height });

        switch (detectorType) {
          case 'gemini':
            result = await geminiPlateDetector.detectPlate(frame);
            break;
          case 'custom':
            result = await customYOLODetector.detectPlate(frame);
            break;
          case 'yolo':
            result = await yoloPlateDetector.detectPlate(frame);
            break;
          case 'simple':
            result = await simplePlateDetector.detectPlate(frame);
            break;
          default:
            result = await geminiPlateDetector.detectPlate(frame);
        }
      } catch (canvasError) {
        console.warn('❌ Canvas detection failed, trying Image element approach:', canvasError);

        // Fallback: Create an image element from the captured image data URL
        console.log('🖼️ Fallback: Creating image from captured data URL...');
        console.log('📊 Image data URL length:', imageDataUrl.length);
        console.log('📊 Image data type:', imageDataUrl.substring(0, 50));

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('✅ Image loaded successfully:', { width: img.width, height: img.height });
            resolve(img);
          };
          img.onerror = (errorEvent) => {
            console.error('❌ Image loading failed:', errorEvent);
            reject(new Error(`Failed to load captured image: ${errorEvent.type}`));
          };
          img.src = imageDataUrl;
        });

        // Try detection on the image element
        switch (detectorType) {
          case 'gemini':
            result = await geminiPlateDetector.detectPlate(img);
            break;
          case 'custom':
            result = await customYOLODetector.detectPlate(img);
            break;
          case 'yolo':
            result = await yoloPlateDetector.detectPlate(img);
            break;
          case 'simple':
            result = await simplePlateDetector.detectPlate(img);
            break;
          default:
            result = await geminiPlateDetector.detectPlate(img);
        }
      }

      console.log('🎯 Detection result for captured image:', result);

      // Process the detection result
      if (result && result.plateNumber) {
        console.log('✅ Plate detected from captured image:', result);
        console.log('📊 Detection confidence:', result.confidence);

        // Always show the detected plate number, regardless of confidence
        const detectedPlateNumber = result.plateNumber;

        // Set initial results showing the detected plate number
        setScanResults({
          plateNumber: detectedPlateNumber,
          vehicleModel: 'Looking up...',
          owner: 'Please wait...',
          status: 'Checking Database',
          statusType: 'clean'
        });

        // Brief delay to show the plate number was detected
        await new Promise(resolve => setTimeout(resolve, 500));

        // Lookup detected plate in database
        try {
          const lookup = await lookupVehicle(detectedPlateNumber);
          if (lookup && lookup.vehicle) {
            // Vehicle found in database - show all details
            const vehicle = lookup.vehicle;
            setScanResults({
              plateNumber: detectedPlateNumber, // Keep showing detected plate
              vehicleModel: `${vehicle.year || vehicle.year_of_manufacture || ''} ${vehicle.make || vehicle.manufacturer || ''} ${vehicle.model || ''}`.trim() || 'Unknown',
              owner: vehicle.owner_name || 'Unknown',
              status: lookup.outstandingViolations > 0 ? `${lookup.outstandingViolations} Outstanding Violation(s)` : 'No Violations',
              statusType: lookup.outstandingViolations > 0 ? 'violation' : 'clean'
            });
            setDetectionResult(result); // Show detection overlay on camera
          } else {
            // Vehicle NOT found in database - show detected plate but N/A for other info
            setScanResults({
              plateNumber: detectedPlateNumber, // Keep showing detected plate
              vehicleModel: 'N/A',
              owner: 'N/A',
              status: 'Not Registered in Database',
              statusType: 'violation'
            });
            setDetectionResult(null); // Don't show detection overlay if not registered
          }
        } catch (lookupError) {
          console.error('Lookup failed after detection:', lookupError);
          // Database error - show detected plate but indicate error
          setScanResults({
            plateNumber: detectedPlateNumber, // Keep showing detected plate
            vehicleModel: 'N/A',
            owner: 'N/A',
            status: 'Database Error - Unable to Verify',
            statusType: 'violation'
          });
          setDetectionResult(null);
        }
      } else {
        console.log('❌ No plate detected in captured image');
        setScanResults({
          plateNumber: 'N/A',
          vehicleModel: 'N/A',
          owner: 'N/A',
          status: 'No Plate Detected in Image',
          statusType: 'clean'
        });
        setDetectionResult(null);
      }

      console.log('✅ Captured image analysis completed');
    } catch (error) {
      console.error('❌ Captured image analysis failed:', error);
      setScanResults({
        plateNumber: 'N/A',
        vehicleModel: 'N/A',
        owner: 'N/A',
        status: 'Detection Failed',
        statusType: 'clean'
      });
      setDetectionResult(null);
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
      {/* Detection Metrics */}
      <DetectionMetrics />

      {/* Row 1 - Live Camera Feed */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Camera className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
          Live Camera Feed with {
            detectorType === 'gemini' ? 'Gemini Vision AI' :
            detectorType === 'custom' ? 'Custom Trained YOLO' :
            detectorType === 'yolo' ? 'Standard YOLOv8 + EasyOCR' : 'Simple'
          } Plate Detection
          {detectorType === 'gemini' && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Gemini AI
            </span>
          )}
          {detectorType === 'custom' && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Custom Model
            </span>
          )}
          {detectorType === 'simple' && (
            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              Fallback Mode
            </span>
          )}
        </h3>
        
        {/* Camera Feed Container */}
        <div className="relative w-full">
          {/* Camera Feed Display Area */}
          <div className="relative w-full h-48 sm:h-64 lg:h-80 rounded-xl border-2 border-gray-300 overflow-hidden mb-4 lg:mb-6 transition-all duration-300 bg-gray-900 shadow-inner">
            {/* Camera Feed Status Indicator */}
            <div className="absolute top-3 left-3 z-10">
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                cameraActive ? 'bg-green-600 text-white' :
                cameraLoading ? 'bg-yellow-600 text-white' :
                cameraError ? 'bg-red-600 text-white' :
                'bg-gray-600 text-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  cameraActive ? 'bg-green-300 animate-pulse' :
                  cameraLoading ? 'bg-yellow-300 animate-spin' :
                  cameraError ? 'bg-red-300' :
                  'bg-gray-400'
                }`}></div>
                {cameraActive ? 'LIVE' :
                 cameraLoading ? 'STARTING' :
                 cameraError ? 'ERROR' :
                 'OFFLINE'}
              </div>
            </div>

            {/* Video Feed - Always present in DOM */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover rounded-lg ${cameraActive ? 'block' : 'hidden'}`}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => console.log('Video metadata loaded')}
              onPlay={() => console.log('Video started playing')}
              onError={(e) => console.error('Video element error:', e)}
            />

            {/* Camera Feed Content Overlays */}
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <AlertCircle className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 text-red-400" />
                  <p className="font-semibold text-lg mb-2">Camera Error</p>
                  <p className="text-sm text-gray-300 mb-4 max-w-md">{cameraError}</p>
                  {permissionStatus === 'denied' && (
                    <button
                      onClick={requestCameraPermission}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Request Camera Permission
                    </button>
                  )}
                </div>
              </div>
            ) : cameraLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <Camera className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                  </div>
                  <p className="font-semibold text-lg">Initializing Camera...</p>
                  <p className="text-sm text-gray-300 mt-2">Please wait while we access your camera</p>
                </div>
              </div>
            ) : cameraActive ? (
              <>
                {/* Camera Feed Overlay Grid (for targeting) */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border border-white/20"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20"></div>
                </div>

                {/* Plate Detection Overlay */}
                {detectionResult && (
                  <div
                    className="absolute border-2 border-green-400 bg-green-400 bg-opacity-20 animate-pulse"
                    style={{
                      left: `${(detectionResult.boundingBox.x / videoRef.current?.videoWidth || 1) * 100}%`,
                      top: `${(detectionResult.boundingBox.y / videoRef.current?.videoHeight || 1) * 100}%`,
                      width: `${(detectionResult.boundingBox.width / videoRef.current?.videoWidth || 1) * 100}%`,
                      height: `${(detectionResult.boundingBox.height / videoRef.current?.videoHeight || 1) * 100}%`
                    }}
                  >
                    <div className="absolute -top-8 left-0 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                      {detectionResult.plateNumber} ({Math.round(detectionResult.confidence * 100)}%)
                    </div>
                  </div>
                )}

                {/* Scanning Indicator */}
                {isScanning && (
                  <div className={`absolute top-3 right-3 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center shadow-lg ${
                    detectorType === 'gemini' ? 'bg-blue-600' :
                    detectorType === 'custom' ? 'bg-green-600' :
                    detectorType === 'yolo' ? 'bg-purple-600' : 'bg-orange-600'
                  }`}>
                    <div className="animate-pulse w-2 h-2 bg-white rounded-full mr-2"></div>
                    🔍 {detectorType === 'gemini' ? 'Gemini AI Active' :
                         detectorType === 'custom' ? 'AI Detection Active' :
                         detectorType === 'yolo' ? 'YOLO Detection Active' : 'Detection Active'}
                  </div>
                )}

                {/* Always show detection status when camera is active */}
                {cameraActive && !isScanning && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center shadow-lg">
                    <div className="animate-pulse w-2 h-2 bg-white rounded-full mr-2"></div>
                    📹 Camera Ready - Click Start Detection
                  </div>
                )}

                {/* Target Box for Plate Positioning */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-2 border-dashed border-white/60 rounded-lg flex items-center justify-center">
                    <span className="text-white/80 text-xs font-medium bg-black/50 px-2 py-1 rounded">
                      Position license plate here
                    </span>
                  </div>
                </div>

                {/* Capture Flash Effect */}
                {captureFlash && (
                  <div className="absolute inset-0 bg-white opacity-80 animate-ping pointer-events-none rounded-lg"></div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <div className="relative mb-6">
                    <Camera className="w-16 lg:w-20 h-16 lg:h-20 mx-auto text-gray-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <p className="font-semibold text-lg mb-2">Camera Feed Ready</p>
                  <p className="text-sm text-gray-300 mb-4 max-w-md">
                    Click "Start Camera & Scan" below to activate your camera. Plate detection will start automatically when camera is active.
                  </p>

                  {permissionStatus === 'denied' && (
                    <div className="mt-6 p-4 bg-red-600/20 border border-red-400 rounded-lg">
                      <p className="text-sm text-red-300 mb-3">Camera access denied</p>
                      <button
                        onClick={requestCameraPermission}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Enable Camera Access
                      </button>
                    </div>
                  )}

                  {permissionStatus === 'prompt' && (
                    <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-400 rounded-lg">
                      <p className="text-sm text-yellow-300 mb-3">Camera permission required</p>
                      <button
                        onClick={requestCameraPermission}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Grant Camera Permission
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Camera Feed Information Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Resolution: {cameraActive && videoRef.current ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 'N/A'}
              </span>
              <span className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  detectorType === 'gemini' ? 'bg-blue-500' :
                  detectorType === 'custom' ? 'bg-green-500' :
                  detectorType === 'yolo' ? 'bg-purple-500' : 'bg-orange-500'
                }`}></div>
                {detectorType === 'gemini' ? 'Gemini AI' :
                 detectorType === 'custom' ? 'Custom Model' :
                 detectorType === 'yolo' ? 'YOLO+OCR' : 'Simple'} Status: {detectionResult ? 'Active' : 'Standby'}
              </span>
            </div>
            <span className="text-gray-400">
              Frame Rate: 30fps
            </span>
          </div>

          {/* Debug Information Panel */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-xs">
            <div className="font-semibold text-gray-700 mb-2">Debug Information:</div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <span>Component Mounted: {isMounted ? '✅' : '❌'}</span>
              <span>Video Ref: {videoRef.current ? '✅' : '❌'}</span>
              <span>Camera Active: {cameraActive ? '✅' : '❌'}</span>
              <span>Detection Active: {isScanning ? '🔍' : '⏸️'}</span>
              <span>Detection Attempts: {detectionAttempts}</span>
              <span>Last Detection: {lastDetectionTime ? lastDetectionTime.toLocaleTimeString() : 'None'}</span>
              <span>Permission: {permissionStatus}</span>
              <span>HTTPS: {window.isSecureContext ? '✅' : '❌'}</span>
            </div>
            {cameraError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                Error: {cameraError}
              </div>
            )}
          </div>
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
                  Start Continuous Detection
                </button>
              ) : (
                <button
                  onClick={handleStopScan}
                  className="flex-1 py-3 lg:py-4 rounded-lg font-semibold text-white transition-colors duration-200 text-sm lg:text-base bg-red-600 hover:bg-red-700 flex items-center justify-center"
                >
                  <Pause className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                  Stop Detection
                </button>
              )}

              <button
                onClick={handleCapturePlate}
                className="px-4 lg:px-6 py-3 lg:py-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base flex items-center justify-center"
              >
                <Camera className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                Capture
              </button>

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
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                detectorType === 'gemini' ? 'bg-blue-100 text-blue-700' :
                detectorType === 'custom' ? 'bg-green-100 text-green-700' :
                detectorType === 'yolo' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {detectorType === 'gemini' ? 'Gemini Vision AI' :
                 detectorType === 'custom' ? 'Custom Model' :
                 detectorType === 'yolo' ? 'YOLOv8 + EasyOCR' : 'Simple Detection'}
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 gap-2">
                <span className="text-sm font-medium text-gray-600">Plate Number:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-800 font-mono truncate">
                    {scanResults.plateNumber}
                  </span>
                  {scanResults.plateNumber !== 'N/A' && scanResults.plateNumber !== 'Capturing...' && scanResults.plateNumber !== 'Analyzing Captured Image...' && scanResults.plateNumber !== 'Looking up...' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      ✓ Detected
                    </span>
                  )}
                </div>
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
                <>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 gap-2">
                    <span className="text-sm font-medium text-gray-600">YOLO Confidence:</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {Math.round(detectionResult.confidence * 100)}%
                    </span>
                  </div>
                  {(detectionResult as any).ocrConfidence && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 gap-2">
                      <span className="text-sm font-medium text-gray-600">OCR Confidence:</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {Math.round((detectionResult as any).ocrConfidence * 100)}%
                      </span>
                    </div>
                  )}
                </>
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

      {/* Captured Image Display */}
      {capturedImage && (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Camera className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-green-600" />
            Captured Image
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              ✓ Saved
            </span>
          </h3>

          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured camera frame"
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                Captured: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Create download link for the image
                  const link = document.createElement('a');
                  link.href = capturedImage;
                  link.download = `license-plate-capture-${Date.now()}.jpg`;
                  link.click();
                }}
                className="flex-1 py-2 lg:py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base"
              >
                Download Image
              </button>

              <button
                onClick={() => setCapturedImage(null)}
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 text-sm lg:text-base"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleScanner;
