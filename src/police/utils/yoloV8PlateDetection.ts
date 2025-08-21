import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
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

export class YOLOv8PlateDetector {
  private objectDetectionModel: cocoSsd.ObjectDetection | null = null;
  private ocrWorker: any = null;
  private isInitialized = false;
  private isInitializing = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;

    this.isInitializing = true;
    console.log('🚀 Initializing YOLOv8-style Object Detection + Enhanced OCR...');

    try {
      // Initialize TensorFlow.js backend
      await tf.ready();
      console.log('✅ TensorFlow.js backend ready');

      // Check for problematic environments
      const hasFullStory = typeof window !== 'undefined' &&
                          ((window as any).FS ||
                           document.querySelector('script[src*="fullstory"]') ||
                           document.querySelector('script[src*="fs.js"]'));

      const isDevelopment = typeof window !== 'undefined' &&
                           (window.location.hostname === 'localhost' ||
                            window.location.hostname.includes('127.0.0.1') ||
                            window.location.hostname.includes('.dev') ||
                            import.meta.env.DEV);

      if (hasFullStory) {
        console.warn('⚠️ FullStory detected - skipping external model loading to avoid conflicts');
        this.objectDetectionModel = null;
      } else {
        // Load COCO-SSD model for object detection with timeout and error handling
        console.log('📦 Loading object detection model...');
        try {
          // Add timeout to prevent hanging
          const modelLoadPromise = cocoSsd.load({
            base: 'mobilenet_v2', // Faster inference
            modelUrl: undefined // Use default pre-trained model
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Model loading timeout')), 10000)
          );

          this.objectDetectionModel = await Promise.race([modelLoadPromise, timeoutPromise]);
          console.log('✅ Object detection model loaded successfully');
        } catch (modelError) {
          console.warn('⚠️ Failed to load COCO-SSD model, using fallback detection:', modelError);
          this.objectDetectionModel = null;
        }
      }

      // Initialize enhanced OCR worker
      console.log('🔤 Initializing enhanced OCR worker...');
      try {
        const ocrTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OCR initialization timeout')), 15000)
        );

        const ocrWorkerPromise = createWorker('eng', 1, {
          logger: (m: any) => {
            if (m.status === 'recognizing text' && m.progress) {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        this.ocrWorker = await Promise.race([ocrWorkerPromise, ocrTimeout]);

        // Configure OCR for license plate recognition
        await this.ocrWorker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
          tessedit_pageseg_mode: '8', // Treat image as single word
          tessedit_ocr_engine_mode: '2', // Use LSTM OCR engine
          preserve_interword_spaces: '0',
          user_defined_dpi: '300'
        });

        console.log('✅ Enhanced OCR worker initialized successfully');
      } catch (ocrError) {
        console.warn('⚠️ Failed to initialize OCR worker, will use basic image analysis:', ocrError);
        this.ocrWorker = null;
      }

      this.isInitialized = true;
      console.log('🎉 YOLOv8-style + Enhanced OCR detector ready!');

    } catch (error) {
      console.error('❌ Failed to initialize detector:', error);
      // Set partial initialization to allow fallback methods
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
      console.log('🔍 Starting license plate detection...');

      // Step 1: Use object detection to find vehicle-related objects
      const vehicleRegions = await this.detectVehicleRegions(imageElement);
      
      // Step 2: Find rectangular regions that could be license plates
      const plateRegions = await this.findLicensePlateRegions(imageElement, vehicleRegions);
      
      if (plateRegions.length === 0) {
        console.log('❌ No potential license plate regions found');
        return null;
      }

      // Step 3: Process each potential plate region with OCR
      for (const region of plateRegions) {
        console.log('🔤 Processing potential plate region:', region);
        
        const plateCanvas = this.extractRegion(imageElement, region);
        const enhancedCanvas = this.enhanceForOCR(plateCanvas);
        
        const ocrResult = await this.performAdvancedOCR(enhancedCanvas);
        
        if (ocrResult && this.isValidLicensePlate(ocrResult.text)) {
          console.log('✅ Valid license plate detected:', ocrResult.text);
          
          return {
            plateNumber: this.formatLicensePlate(ocrResult.text),
            confidence: region.confidence,
            boundingBox: region.boundingBox,
            ocrConfidence: ocrResult.confidence
          };
        }
      }

      console.log('❌ No valid license plates found in detected regions');
      return null;

    } catch (error) {
      console.error('❌ Error in plate detection:', error);
      return null;
    }
  }

  private async detectVehicleRegions(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<any[]> {
    if (!this.objectDetectionModel) {
      console.log('⚠️ No object detection model available, using intelligent image regions');
      return this.getIntelligentImageRegions(imageElement);
    }

    try {
      console.log('🚗 Detecting vehicles in image...');

      const predictions = await this.objectDetectionModel.detect(imageElement as any);

      // Filter for vehicle-related objects
      const vehicleClasses = ['car', 'truck', 'bus', 'motorcycle', 'bicycle'];
      const vehicleDetections = predictions
        .filter(pred => vehicleClasses.includes(pred.class.toLowerCase()))
        .map(pred => ({
          boundingBox: {
            x: pred.bbox[0],
            y: pred.bbox[1],
            width: pred.bbox[2],
            height: pred.bbox[3]
          },
          confidence: pred.score,
          class: pred.class
        }));

      console.log(`🎯 Found ${vehicleDetections.length} vehicle(s):`, vehicleDetections.map(v => v.class));

      return vehicleDetections.length > 0 ? vehicleDetections : this.getIntelligentImageRegions(imageElement);

    } catch (error) {
      console.error('❌ Vehicle detection failed:', error);
      return this.getIntelligentImageRegions(imageElement);
    }
  }

  private getIntelligentImageRegions(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): any[] {
    // Get actual dimensions from the image element
    let width = 640, height = 480;

    if (imageElement instanceof HTMLVideoElement) {
      width = imageElement.videoWidth || 640;
      height = imageElement.videoHeight || 480;
    } else if (imageElement instanceof HTMLCanvasElement) {
      width = imageElement.width;
      height = imageElement.height;
    } else if (imageElement instanceof HTMLImageElement) {
      width = imageElement.naturalWidth || imageElement.width || 640;
      height = imageElement.naturalHeight || imageElement.height || 480;
    }

    // Create multiple regions to search for license plates
    // Focus on typical license plate locations (front and rear of vehicles)
    return [
      // Full image as primary region
      {
        boundingBox: { x: 0, y: 0, width, height },
        confidence: 0.5
      },
      // Lower center region (typical front plate location)
      {
        boundingBox: {
          x: Math.round(width * 0.2),
          y: Math.round(height * 0.6),
          width: Math.round(width * 0.6),
          height: Math.round(height * 0.3)
        },
        confidence: 0.6
      },
      // Upper center region (possible rear plate location)
      {
        boundingBox: {
          x: Math.round(width * 0.25),
          y: Math.round(height * 0.1),
          width: Math.round(width * 0.5),
          height: Math.round(height * 0.4)
        },
        confidence: 0.4
      }
    ];
  }

  private async findLicensePlateRegions(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    vehicleRegions: any[]
  ): Promise<any[]> {
    console.log('🔍 Searching for license plate regions...');
    
    const plateRegions = [];
    
    for (const vehicle of vehicleRegions) {
      // Extract vehicle region
      const vehicleCanvas = this.extractRegion(imageElement, vehicle);
      
      // Find rectangular regions within the vehicle area
      const rectangularRegions = this.findRectangularRegions(vehicleCanvas);
      
      // Convert back to full image coordinates and filter for plate-like regions
      for (const region of rectangularRegions) {
        const fullImageRegion = {
          boundingBox: {
            x: vehicle.boundingBox.x + region.x,
            y: vehicle.boundingBox.y + region.y,
            width: region.width,
            height: region.height
          },
          confidence: region.confidence * vehicle.confidence
        };
        
        // Filter by license plate characteristics
        const aspectRatio = region.width / region.height;
        const area = region.width * region.height;
        
        // License plates typically have aspect ratio 2:1 to 5:1 and reasonable size
        if (aspectRatio >= 2 && aspectRatio <= 5 && area >= 1000 && area <= 15000) {
          plateRegions.push(fullImageRegion);
        }
      }
    }
    
    // Sort by confidence and return top candidates
    return plateRegions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Limit to top 5 candidates
  }

  private findRectangularRegions(canvas: HTMLCanvasElement): any[] {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const regions = [];

    // Convert to grayscale and find edges
    const grayData = this.toGrayscale(imageData);
    const edges = this.detectEdges(grayData, canvas.width, canvas.height);
    
    // Find rectangular contours
    const minWidth = 60;
    const maxWidth = Math.min(canvas.width * 0.8, 300);
    const minHeight = 15;
    const maxHeight = Math.min(canvas.height * 0.3, 80);

    for (let y = 0; y < canvas.height - minHeight; y += 10) {
      for (let x = 0; x < canvas.width - minWidth; x += 10) {
        for (let w = minWidth; w <= maxWidth && x + w < canvas.width; w += 20) {
          for (let h = minHeight; h <= maxHeight && y + h < canvas.height; h += 10) {
            const rectangularity = this.calculateRectangularity(edges, x, y, w, h, canvas.width);
            
            if (rectangularity > 0.4) {
              const edgeStrength = this.calculateEdgeStrength(edges, x, y, w, h, canvas.width);
              const confidence = (rectangularity + edgeStrength) / 2;
              
              if (confidence > 0.3) {
                regions.push({ x, y, width: w, height: h, confidence });
              }
            }
          }
        }
      }
    }

    return this.nonMaxSuppression(regions);
  }

  private toGrayscale(imageData: ImageData): Uint8ClampedArray {
    const gray = new Uint8ClampedArray(imageData.width * imageData.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    return gray;
  }

  private detectEdges(grayData: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(width * height);
    
    // Simple Sobel edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel X kernel
        const gx = 
          -grayData[(y-1)*width + (x-1)] + grayData[(y-1)*width + (x+1)] +
          -2*grayData[y*width + (x-1)] + 2*grayData[y*width + (x+1)] +
          -grayData[(y+1)*width + (x-1)] + grayData[(y+1)*width + (x+1)];
        
        // Sobel Y kernel
        const gy = 
          -grayData[(y-1)*width + (x-1)] - 2*grayData[(y-1)*width + x] - grayData[(y-1)*width + (x+1)] +
          grayData[(y+1)*width + (x-1)] + 2*grayData[(y+1)*width + x] + grayData[(y+1)*width + (x+1)];
        
        edges[idx] = Math.min(255, Math.sqrt(gx*gx + gy*gy));
      }
    }
    
    return edges;
  }

  private calculateRectangularity(edges: Uint8ClampedArray, x: number, y: number, w: number, h: number, imageWidth: number): number {
    const threshold = 50;
    let edgePixelsOnBorder = 0;
    let totalBorderPixels = 0;
    
    // Check top and bottom borders
    for (let i = 0; i < w; i++) {
      const topIdx = y * imageWidth + (x + i);
      const bottomIdx = (y + h - 1) * imageWidth + (x + i);
      
      if (edges[topIdx] > threshold) edgePixelsOnBorder++;
      if (edges[bottomIdx] > threshold) edgePixelsOnBorder++;
      totalBorderPixels += 2;
    }
    
    // Check left and right borders
    for (let i = 1; i < h - 1; i++) {
      const leftIdx = (y + i) * imageWidth + x;
      const rightIdx = (y + i) * imageWidth + (x + w - 1);
      
      if (edges[leftIdx] > threshold) edgePixelsOnBorder++;
      if (edges[rightIdx] > threshold) edgePixelsOnBorder++;
      totalBorderPixels += 2;
    }
    
    return totalBorderPixels > 0 ? edgePixelsOnBorder / totalBorderPixels : 0;
  }

  private calculateEdgeStrength(edges: Uint8ClampedArray, x: number, y: number, w: number, h: number, imageWidth: number): number {
    let totalEdgeStrength = 0;
    let pixelCount = 0;
    
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const idx = (y + dy) * imageWidth + (x + dx);
        totalEdgeStrength += edges[idx];
        pixelCount++;
      }
    }
    
    return pixelCount > 0 ? (totalEdgeStrength / pixelCount) / 255 : 0;
  }

  private nonMaxSuppression(regions: any[]): any[] {
    const sorted = regions.sort((a, b) => b.confidence - a.confidence);
    const kept = [];
    
    for (const region of sorted) {
      let shouldKeep = true;
      
      for (const existing of kept) {
        if (this.calculateOverlap(region, existing) > 0.3) {
          shouldKeep = false;
          break;
        }
      }
      
      if (shouldKeep) {
        kept.push(region);
      }
    }
    
    return kept;
  }

  private calculateOverlap(rect1: any, rect2: any): number {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = rect1.width * rect1.height;
    const area2 = rect2.width * rect2.height;
    const union = area1 + area2 - intersection;
    
    return union > 0 ? intersection / union : 0;
  }

  private extractRegion(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, region: any): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const { x, y, width, height } = region.boundingBox || region;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(
      imageElement as any,
      x, y, width, height,
      0, 0, width, height
    );
    
    return canvas;
  }

  private enhanceForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Enhance contrast and apply sharpening
    this.enhanceContrast(imageData);
    this.sharpenImage(imageData);
    
    // Scale up for better OCR
    const enhancedCanvas = document.createElement('canvas');
    const enhancedCtx = enhancedCanvas.getContext('2d')!;
    
    const scale = 3;
    enhancedCanvas.width = canvas.width * scale;
    enhancedCanvas.height = canvas.height * scale;
    
    ctx.putImageData(imageData, 0, 0);
    
    // Use smooth scaling
    enhancedCtx.imageSmoothingEnabled = true;
    enhancedCtx.imageSmoothingQuality = 'high';
    enhancedCtx.drawImage(canvas, 0, 0, enhancedCanvas.width, enhancedCanvas.height);
    
    return enhancedCanvas;
  }

  private enhanceContrast(imageData: ImageData): void {
    const data = imageData.data;
    const factor = 1.5; // Contrast factor
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
    }
  }

  private sharpenImage(imageData: ImageData): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels
          let sum = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += tempData[idx] * sharpenKernel[kernelIdx];
            }
          }
          
          const idx = (y * width + x) * 4 + c;
          data[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  }

  private async performAdvancedOCR(canvas: HTMLCanvasElement): Promise<{text: string, confidence: number} | null> {
    if (!this.ocrWorker) {
      console.log('⚠️ OCR worker not available, skipping OCR');
      return null;
    }

    try {
      console.log('🔤 Performing advanced OCR...');
      
      const { data: { text, confidence } } = await this.ocrWorker.recognize(canvas);
      
      const cleanText = text.replace(/[^A-Z0-9\-\s]/g, '').trim();
      
      console.log('OCR Result:', { text: cleanText, confidence });
      
      if (cleanText.length >= 5) {
        return {
          text: cleanText,
          confidence: confidence / 100
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ OCR failed:', error);
      return null;
    }
  }

  private isValidLicensePlate(text: string): boolean {
    const cleaned = text.replace(/[^A-Z0-9]/g, '');
    
    // Ghanaian license plate patterns
    const patterns = [
      /^[A-Z]{2}\d{4}\d{2}$/,     // GH123420
      /^[A-Z]{2}\d{3}\d{2}$/,     // GH12320  
      /^[A-Z]{3}\d{3}\d{2}$/,     // GHA12320
      /^[A-Z]{2}\d{1,4}[A-Z]?\d{2}$/ // Flexible pattern
    ];
    
    return patterns.some(pattern => pattern.test(cleaned)) && cleaned.length >= 6;
  }

  private formatLicensePlate(text: string): string {
    const cleaned = text.replace(/[^A-Z0-9]/g, '');
    
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
        await this.ocrWorker.terminate();
        this.ocrWorker = null;
      }
      
      if (this.objectDetectionModel) {
        this.objectDetectionModel.dispose();
        this.objectDetectionModel = null;
      }
      
      this.isInitialized = false;
      console.log('✅ YOLOv8-style detector cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

export const yoloV8PlateDetector = new YOLOv8PlateDetector();
