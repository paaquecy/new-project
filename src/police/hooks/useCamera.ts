import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraHook {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
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

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        throw new Error('Camera access requires HTTPS. Please access this page over HTTPS.');
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      console.log('Requesting camera access...');
      console.log('Secure context:', window.isSecureContext);
      console.log('Available devices:', await navigator.mediaDevices.enumerateDevices());

      // First try with basic settings
      let stream: MediaStream;
      try {
        console.log('Trying basic camera settings...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log('Basic camera access successful');
      } catch (basicErr) {
        console.warn('Basic settings failed, trying with specific constraints:', basicErr);

        // Try with more specific settings
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              frameRate: { min: 15, ideal: 30, max: 60 }
            },
            audio: false
          });
          console.log('Specific settings successful');
        } catch (specificErr) {
          console.error('Both basic and specific settings failed:', specificErr);
          throw basicErr; // Throw the original error
        }
      }

      console.log('Camera stream obtained:', stream);
      console.log('Stream tracks:', stream.getTracks());

      // Wait for video element to be available with retry logic
      let attempts = 0;
      const maxAttempts = 10;

      while (!videoRef.current && attempts < maxAttempts) {
        console.log(`Waiting for video element... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!videoRef.current) {
        throw new Error(`Video element not available in DOM after ${maxAttempts} attempts. Please refresh the page and try again.`);
      }

      console.log('Video element found:', videoRef.current);

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Video element became unavailable'));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error('Video loading timeout after 15 seconds. Try refreshing the page.'));
        }, 15000);

        const handleLoadedMetadata = () => {
          clearTimeout(timeoutId);
          console.log('Video metadata loaded:', {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            readyState: videoRef.current?.readyState
          });

          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playback started successfully');
                setIsActive(true);
                resolve();
              })
              .catch((playErr) => {
                console.error('Video play failed:', playErr);
                reject(new Error(`Video playback failed: ${playErr.message}`));
              });
          }
        };

        const handleError = (videoErr: any) => {
          clearTimeout(timeoutId);
          console.error('Video element error:', videoErr);
          reject(new Error('Failed to load video stream into video element'));
        };

        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        videoRef.current.addEventListener('error', handleError, { once: true });

        // Also try to load immediately if metadata is already available
        if (videoRef.current.readyState >= 1) {
          handleLoadedMetadata();
        }
      });
    } catch (err) {
      console.error('Camera initialization failed:', err);
      let errorMessage = 'Failed to access camera';

      if (err instanceof Error) {
        console.log('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });

        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please click the camera icon in your browser\'s address bar and allow camera access, then refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure your device has a camera connected and try again.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser. Please use Chrome, Firefox, Edge, or Safari.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application. Please close other apps using the camera and try again.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported. Your camera may not support the required resolution.';
        } else if (err.message.includes('HTTPS')) {
          errorMessage = err.message;
        } else {
          errorMessage = `Camera error: ${err.message}`;
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
    startCamera,
    stopCamera,
    captureFrame
  };
}
