import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraHook {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => HTMLCanvasElement | null;
}

export function useCamera(): CameraHook {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  // Check for HTTPS and browser compatibility on mount
  useEffect(() => {
    const checkCompatibility = async () => {
      // Check for HTTPS (required for camera access in production)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setError('Camera access requires a secure connection (HTTPS). Please use HTTPS or localhost for development.');
        return;
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
      }

      // Check permission status if supported
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(permission.state);

          permission.onchange = () => {
            setPermissionStatus(permission.state);
          };
        }
      } catch (err) {
        console.warn('Could not check camera permission status:', err);
      }
    };

    checkCompatibility();
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera access with fallback constraints
      let stream: MediaStream;

      try {
        // Try with optimal settings first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment', // Use back camera on mobile
            frameRate: { ideal: 30 }
          },
          audio: false
        });
      } catch (highResError) {
        console.warn('High resolution camera access failed, trying basic settings:', highResError);

        // Fallback to basic video constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => {
                setIsActive(true);
                resolve();
              })
              .catch(reject);
          };

          videoRef.current.onerror = () => {
            reject(new Error('Failed to load video stream'));
          };
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Failed to access camera';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please grant camera access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure a camera is connected.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints could not be satisfied.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, []);

  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current || !canvasRef.current || !isActive) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    permissionStatus,
    startCamera,
    stopCamera,
    captureFrame
  };
}
