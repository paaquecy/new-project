import * as tf from '@tensorflow/tfjs';
import { createWorker } from 'tesseract.js';

export interface PlateDetectionResult {
  plateNumber: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ocrConfidence: number;
}

export class YOLOPlateDetector {
  private model: tf.GraphModel | null = null;
  private ocrWorker: any = null;
  private isInitialized = false;
  private isInitializing = false;
  private hasNetworkIssues = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;

    this.isInitializing = true;
    console.log('Initializing YOLOv8 + EasyOCR plate detector...');

    try {
      // Initialize TensorFlow.js backend
      await tf.ready();
      console.log('TensorFlow.js backend ready');

      // Detect third-party script interference
      const hasFullStory = typeof window !== 'undefined' &&
                          (window as any).FS ||
                          document.querySelector('script[src*="fullstory"]') ||
                          document.querySelector('script[src*="fs.js"]');

      // Check if we should skip external model loading
      const isDevelopment = window.location.hostname === 'localhost' ||
                           window.location.hostname.includes('127.0.0.1') ||
                           window.location.hostname.includes('vite') ||
                           import.meta.env.DEV;

      const shouldSkipExternalModel = isDevelopment ||
                                    navigator.onLine === false ||
                                    window.location.protocol !== 'https:' ||
                                    hasFullStory ||
                                    this.hasNetworkIssues;

      if (shouldSkipExternalModel) {
        const reasons = [];
        if (isDevelopment) reasons.push('development mode');
        if (navigator.onLine === false) reasons.push('offline');
        if (window.location.protocol !== 'https:') reasons.push('non-HTTPS');
        if (hasFullStory) reasons.push('third-party interference');
        if (this.hasNetworkIssues) reasons.push('previous network issues');

        console.log('Skipping external model loading:', reasons.join(', '));
        this.model = null;
      } else {
        // Try to load external model with timeout and fallback
        console.log('Attempting to load detection model...');

        try {
          // Using a lightweight detection model for demonstration
          // Replace this URL with your custom YOLOv8 license plate model
          const modelUrl = 'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1';

          // Add timeout for model loading
          const modelLoadPromise = tf.loadGraphModel(modelUrl);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Model loading timeout')), 5000) // Reduced to 5 seconds
          );

          this.model = await Promise.race([modelLoadPromise, timeoutPromise]) as tf.GraphModel;
          console.log('External model loaded successfully');
        } catch (modelError) {
          console.warn('Failed to load external model, will use fallback detection:', modelError);
          this.model = null;

          // Mark network issues for future initialization attempts
          if (modelError instanceof Error &&
              (modelError.message.includes('fetch') ||
               modelError.message.includes('Failed to fetch') ||
               modelError.message.includes('Network'))) {
            this.hasNetworkIssues = true;
            console.log('Network issues detected, future model loading will be skipped');
          }
        }
      }

      // Initialize OCR worker with better error handling
      try {
        console.log('Initializing OCR worker...');
        this.ocrWorker = await createWorker('eng', 1, {
          logger: (m: any) => {
            // Only log important OCR messages to reduce noise
            if (m.status === 'recognizing text' || m.status === 'loading tesseract core') {
              console.log('OCR:', m.status, m.progress ? `${Math.round(m.progress * 100)}%` : '');
            }
          }
        });

        await this.ocrWorker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
          tessedit_pageseg_mode: '8', // Treat the image as a single word
          tessedit_ocr_engine_mode: '2' // Use LSTM OCR engine
        });

        console.log('OCR worker initialized successfully');
      } catch (ocrError) {
        console.warn('Failed to initialize OCR worker, will use simplified text extraction:', ocrError);
        this.ocrWorker = null;
      }

      this.isInitialized = true;
      console.log('Plate detector initialized (Model:', this.model ? 'External' : 'Fallback', ', OCR:', this.ocrWorker ? 'Tesseract' : 'Fallback', ')');

    } catch (error) {
      console.warn('Detector initialization failed, using basic fallback mode:', error);
      // Don't throw error, allow fallback mode
      this.model = null;
      this.ocrWorker = null;
      this.isInitialized = true;
    } finally {
      this.isInitializing = false;
    }
  }

  async detectPlate(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<PlateDetectionResult | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Starting YOLO plate detection...');

      // Convert image to tensor
      const imageTensor = this.preprocessImage(imageElement);
      
      let detections;
      
      if (this.model) {
        // Use YOLO model for detection
        detections = await this.runYOLODetection(imageTensor);
      } else {
        // Fallback to rule-based detection
        detections = await this.fallbackDetection(imageElement);
      }

      imageTensor.dispose();

      if (!detections || detections.length === 0) {
        console.log('No license plates detected');
        return null;
      }

      // Get the best detection (highest confidence)
      const bestDetection = detections[0];
      
      // Extract the license plate region
      const plateRegion = await this.extractPlateRegion(imageElement, bestDetection);
      
      // Perform OCR on the extracted region
      const ocrResult = await this.performOCR(plateRegion);
      
      if (!ocrResult || !this.isValidPlateFormat(ocrResult.text)) {
        console.log('OCR failed or invalid plate format');
        return null;
      }

      return {
        plateNumber: this.cleanPlateText(ocrResult.text),
        confidence: bestDetection.confidence,
        boundingBox: bestDetection.boundingBox,
        ocrConfidence: ocrResult.confidence
      };

    } catch (error) {
      console.error('Error in YOLO plate detection:', error);
      return null;
    }
  }

  private preprocessImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): tf.Tensor {
    // Convert to tensor and normalize for YOLO input
    const tensor = tf.browser.fromPixels(imageElement);
    
    // Resize to model input size (typically 640x640 for YOLOv8)
    const resized = tf.image.resizeBilinear(tensor, [640, 640]);
    
    // Normalize pixel values to [0, 1]
    const normalized = resized.div(255.0);
    
    // Add batch dimension
    const batched = normalized.expandDims(0);
    
    tensor.dispose();
    resized.dispose();
    normalized.dispose();
    
    return batched;
  }

  private async runYOLODetection(imageTensor: tf.Tensor): Promise<any[]> {
    if (!this.model) return [];

    try {
      console.log('Running YOLO inference...');
      
      // Run inference
      const predictions = await this.model.executeAsync(imageTensor) as tf.Tensor[];
      
      // Process YOLO outputs
      // Note: This is simplified - actual YOLOv8 output processing is more complex
      const boxes = await predictions[0].data();
      const scores = await predictions[1].data();
      const classes = await predictions[2].data();
      
      const detections = [];
      const threshold = 0.5;
      
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] > threshold) {
          // Convert normalized coordinates to actual coordinates
          const x = boxes[i * 4] * 640;
          const y = boxes[i * 4 + 1] * 640;
          const width = (boxes[i * 4 + 2] - boxes[i * 4]) * 640;
          const height = (boxes[i * 4 + 3] - boxes[i * 4 + 1]) * 640;
          
          detections.push({
            confidence: scores[i],
            boundingBox: { x, y, width, height }
          });
        }
      }
      
      // Clean up tensors
      predictions.forEach(tensor => tensor.dispose());
      
      return detections.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('YOLO inference failed:', error);
      return [];
    }
  }

  private async fallbackDetection(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<any[]> {
    console.log('Using fallback detection method with real image analysis...');

    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const width = imageElement instanceof HTMLVideoElement ? imageElement.videoWidth || 640 : 640;
    const height = imageElement instanceof HTMLVideoElement ? imageElement.videoHeight || 480 : 480;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement as any, 0, 0, canvas.width, canvas.height);

    // Analyze the actual image for rectangular regions
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const detections = [];

    // Convert to grayscale and detect edges
    const grayCanvas = this.convertToGrayscale(canvas);
    const edgeRegions = this.findRectangularRegions(grayCanvas);

    // Filter regions that look like license plates
    for (const region of edgeRegions) {
      const aspectRatio = region.width / region.height;
      const area = region.width * region.height;

      // License plates typically have aspect ratio between 2:1 and 5:1
      if (aspectRatio >= 2 && aspectRatio <= 5 && area >= 1500 && area <= 15000) {
        const confidence = this.calculateRegionConfidence(imageData.data, region, canvas.width);

        if (confidence > 0.3) {
          detections.push({
            confidence,
            boundingBox: region
          });
        }
      }
    }

    return detections.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  private convertToGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const grayCanvas = document.createElement('canvas');
    const grayCtx = grayCanvas.getContext('2d')!;

    grayCanvas.width = canvas.width;
    grayCanvas.height = canvas.height;

    const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    grayCtx.putImageData(imageData, 0, 0);
    return grayCanvas;
  }

  private findRectangularRegions(canvas: HTMLCanvasElement): Array<{x: number, y: number, width: number, height: number}> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const regions = [];

    const minWidth = 80;
    const maxWidth = 300;
    const minHeight = 20;
    const maxHeight = 80;

    // Sample the image for rectangular regions
    for (let y = 0; y < canvas.height - minHeight; y += 15) {
      for (let x = 0; x < canvas.width - minWidth; x += 15) {
        for (let w = minWidth; w <= maxWidth && x + w < canvas.width; w += 30) {
          for (let h = minHeight; h <= maxHeight && y + h < canvas.height; h += 15) {
            const edgeScore = this.calculateEdgeScore(data, x, y, w, h, canvas.width);

            if (edgeScore > 0.3) {
              regions.push({ x, y, width: w, height: h });
            }
          }
        }
      }
    }

    return this.mergeOverlappingRegions(regions);
  }

  private calculateEdgeScore(data: Uint8ClampedArray, x: number, y: number, w: number, h: number, imageWidth: number): number {
    let edgePixels = 0;
    let totalPixels = 0;

    // Sample the region and count edge pixels
    for (let dy = 0; dy < h; dy += 3) {
      for (let dx = 0; dx < w; dx += 3) {
        const px = x + dx;
        const py = y + dy;

        if (px < imageWidth - 1 && py < data.length / (imageWidth * 4) - 1) {
          const idx = (py * imageWidth + px) * 4;
          const current = data[idx];

          // Check for edges
          const rightIdx = idx + 4;
          const bottomIdx = idx + imageWidth * 4;

          if (rightIdx < data.length && bottomIdx < data.length) {
            const horizontalGrad = Math.abs(current - data[rightIdx]);
            const verticalGrad = Math.abs(current - data[bottomIdx]);

            if (horizontalGrad > 30 || verticalGrad > 30) {
              edgePixels++;
            }

            totalPixels++;
          }
        }
      }
    }

    return totalPixels > 0 ? edgePixels / totalPixels : 0;
  }

  private mergeOverlappingRegions(regions: Array<{x: number, y: number, width: number, height: number}>): Array<{x: number, y: number, width: number, height: number}> {
    const merged = [];

    for (const region of regions) {
      let hasOverlap = false;

      for (const existing of merged) {
        if (this.regionsOverlap(region, existing)) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        merged.push(region);
      }
    }

    return merged;
  }

  private regionsOverlap(rect1: {x: number, y: number, width: number, height: number}, rect2: {x: number, y: number, width: number, height: number}): boolean {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
  }

  private calculateRegionConfidence(data: Uint8ClampedArray, region: {x: number, y: number, width: number, height: number}, imageWidth: number): number {
    const edgeScore = this.calculateEdgeScore(data, region.x, region.y, region.width, region.height, imageWidth);
    const aspectRatio = region.width / region.height;
    const area = region.width * region.height;

    let confidence = edgeScore;

    // Boost confidence for good aspect ratio (license plate like)
    if (aspectRatio >= 2.5 && aspectRatio <= 4.5) {
      confidence += 0.2;
    }

    // Boost confidence for reasonable size
    if (area >= 3000 && area <= 10000) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private async extractPlateRegion(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, detection: any): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const { x, y, width, height } = detection.boundingBox;
    
    canvas.width = width;
    canvas.height = height;
    
    // Extract the detected region
    ctx.drawImage(
      imageElement as any,
      x, y, width, height,
      0, 0, width, height
    );
    
    return canvas;
  }

  private async performOCR(plateCanvas: HTMLCanvasElement): Promise<{text: string, confidence: number} | null> {
    // Use Tesseract OCR if available
    if (this.ocrWorker) {
      try {
        console.log('Performing Tesseract OCR on extracted plate region...');

        const { data: { text, confidence } } = await this.ocrWorker.recognize(plateCanvas);

        console.log('Tesseract OCR result:', { text: text.trim(), confidence });

        const cleanText = text.trim().replace(/\s+/g, ' ');

        if (cleanText && cleanText.length >= 5) {
          return {
            text: cleanText,
            confidence: confidence / 100 // Convert to 0-1 range
          };
        }
      } catch (error) {
        console.error('Tesseract OCR failed:', error);
      }
    }

    // Fallback: try basic image analysis
    try {
      console.log('Tesseract not available, performing basic image analysis...');

      const basicOCR = await this.performBasicImageAnalysis(plateCanvas);
      if (basicOCR) {
        return basicOCR;
      }

      console.log('No valid text detected in plate region');
      return null;
    } catch (error) {
      console.error('All OCR methods failed:', error);
      return null;
    }
  }

  private async performBasicImageAnalysis(canvas: HTMLCanvasElement): Promise<{text: string, confidence: number} | null> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Analyze image characteristics to determine if it contains readable text
    let textPixels = 0;
    let totalPixels = 0;
    let contrastSum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;

      // Look for high contrast regions that might be text
      if (i + 4 < data.length) {
        const nextR = data[i + 4];
        const nextG = data[i + 5];
        const nextB = data[i + 6];
        const nextGray = nextR * 0.299 + nextG * 0.587 + nextB * 0.114;

        const contrast = Math.abs(gray - nextGray);
        contrastSum += contrast;

        if (contrast > 50) {
          textPixels++;
        }
      }

      totalPixels++;
    }

    const textRatio = textPixels / totalPixels;
    const avgContrast = contrastSum / totalPixels;

    // If the image doesn't have sufficient text-like characteristics, return null
    if (textRatio < 0.1 || avgContrast < 20) {
      console.log('Image does not appear to contain readable text');
      return null;
    }

    // Basic pattern recognition would go here
    // For now, return null to avoid generating fake data
    console.log('Image appears to contain text but basic OCR cannot extract it');
    return null;
  }

  private isValidPlateFormat(text: string): boolean {
    // Ghanaian license plate patterns
    const cleanText = text.replace(/[^A-Z0-9]/g, '');
    
    const patterns = [
      /^[A-Z]{2}\d{4}\d{2}$/,  // GH123420
      /^[A-Z]{2}\d{3}\d{2}$/,  // GH12320
      /^[A-Z]{3}\d{3}\d{2}$/,  // GHA12320
      /^[A-Z]{2}\d{1,4}[A-Z]?\d{2}$/  // Flexible pattern
    ];

    return patterns.some(pattern => pattern.test(cleanText)) && cleanText.length >= 6;
  }

  private cleanPlateText(text: string): string {
    // Clean and format the plate text
    let cleaned = text.replace(/[^A-Z0-9]/g, '');
    
    // Try to format according to Ghanaian standards
    if (cleaned.length >= 7) {
      // Format as XX-XXXX-XX
      const letters = cleaned.substring(0, 2);
      const middle = cleaned.substring(2, cleaned.length - 2);
      const year = cleaned.substring(cleaned.length - 2);
      
      return `${letters}-${middle}-${year}`;
    }
    
    return cleaned;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.ocrWorker) {
        try {
          await this.ocrWorker.terminate();
        } catch (error) {
          console.warn('Error terminating OCR worker:', error);
        }
        this.ocrWorker = null;
      }

      if (this.model) {
        try {
          this.model.dispose();
        } catch (error) {
          console.warn('Error disposing model:', error);
        }
        this.model = null;
      }

      this.isInitialized = false;
      console.log('YOLO detector cleaned up successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export const yoloPlateDetector = new YOLOPlateDetector();
