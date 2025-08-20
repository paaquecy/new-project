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
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        console.warn('Not in secure context, but allowing for development');
        // Don't throw error, allow development environments to work
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      console.log('Requesting camera access...');
      console.log('Secure context:', window.isSecureContext);
      console.log('Available devices:', await navigator.mediaDevices.enumerateDevices());

      // Try multiple camera configurations
      let stream: MediaStream;
      const configs = [
        // Basic config with back camera preference
        {
          video: {
            facingMode: 'environment' // Use back camera on mobile devices
          },
          audio: false
        },
        // Mobile-friendly config
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment' // Use back camera on mobile
          },
          audio: false
        },
        // Fallback config
        {
          video: {
            width: { max: 640 },
            height: { max: 480 }
          },
          audio: false
        }
      ];

      let lastError;
      for (let i = 0; i < configs.length; i++) {
        try {
          console.log(`Trying camera config ${i + 1}/${configs.length}:`, configs[i]);
          stream = await navigator.mediaDevices.getUserMedia(configs[i]);
          console.log(`Camera config ${i + 1} successful`);
          break;
        } catch (configErr) {
          console.warn(`Camera config ${i + 1} failed:`, configErr);
          lastError = configErr;
          if (i === configs.length - 1) {
            throw lastError;
          }
        }
      }

      console.log('Camera stream obtained:', stream);
      console.log('Stream tracks:', stream.getTracks());

      // Ensure video element is available
      if (!videoRef.current) {
        // Try to wait a bit for React to render the element
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!videoRef.current) {
          throw new Error('Video element not found. Please refresh the page and try again.');
        }
      }

      console.log('Video element found:', videoRef.current);

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      // Set up video element and wait for it to be ready
      const video = videoRef.current;
      video.srcObject = stream;
      streamRef.current = stream;

      // Wait for video to load and start playing
      try {
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Video loading timeout. Camera may be in use by another application.'));
          }, 10000); // Reduced timeout to 10 seconds

          const cleanup = () => {
            clearTimeout(timeoutId);
            video.removeEventListener('loadedmetadata', handleLoad);
            video.removeEventListener('error', handleError);
          };

          const handleLoad = async () => {
            cleanup();
            console.log('Video metadata loaded:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState
            });

            try {
              await video.play();
              console.log('Video playback started successfully');
              setIsActive(true);
              resolve();
            } catch (playErr) {
              console.error('Video play failed:', playErr);
              reject(new Error(`Video playback failed. This may be due to browser autoplay policies.`));
            }
          };

          const handleError = (videoErr: any) => {
            cleanup();
            console.error('Video element error:', videoErr);
            reject(new Error('Video stream error. Please check camera connection.'));
          };

          video.addEventListener('loadedmetadata', handleLoad, { once: true });
          video.addEventListener('error', handleError, { once: true });

          // Try immediate load if metadata already available
          if (video.readyState >= 1) {
            setTimeout(handleLoad, 0);
          }
        });
      } catch (videoError) {
        // Clean up stream if video setup failed
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        throw videoError;
      }
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
