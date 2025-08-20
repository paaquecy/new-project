declare const cv: any;
declare global {
  interface Window {
    cvReady: boolean;
  }
}

export interface PlateDetectionResult {
  plateNumber: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class PlateDetector {
  private isInitialized = false;
  private cascadeClassifier: any = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Wait for OpenCV to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('OpenCV loading timeout, will use fallback detection');
          resolve(); // Don't reject, just resolve to allow fallback
        }, 5000); // Reduced timeout to 5 seconds

        const checkReady = () => {
          if (typeof cv !== 'undefined' && cv.getBuildInformation) {
            clearTimeout(timeout);
            this.isInitialized = true;
            resolve();
            return;
          } else if (window.cvReady) {
            clearTimeout(timeout);
            this.isInitialized = true;
            resolve();
            return;
          }

          // Check periodically
          setTimeout(checkReady, 100);
        };

        // Also listen for opencv-ready event
        window.addEventListener('opencv-ready', () => {
          clearTimeout(timeout);
          this.isInitialized = true;
          resolve();
        }, { once: true });

        checkReady();
      });

      if (this.isInitialized) {
        console.log('OpenCV initialized successfully');
      } else {
        console.warn('OpenCV not available, will use fallback detection');
      }
    } catch (error) {
      console.warn('Failed to initialize OpenCV, will use fallback detection:', error);
      // Don't throw error, allow fallback to work
    }
  }

  async detectPlate(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<PlateDetectionResult | null> {
    // Always try to initialize first
    await this.initialize();

    // Check if OpenCV is actually available and working
    if (typeof cv === 'undefined' || !cv.getBuildInformation) {
      console.warn('OpenCV not loaded or not working, using fallback detection');
      return this.fallbackDetection();
    }

    if (!this.isInitialized) {
      console.warn('OpenCV initialization failed, using fallback detection');
      return this.fallbackDetection();
    }

    try {
      // Convert image to OpenCV Mat
      const src = cv.imread(imageElement);
      const gray = new cv.Mat();
      const edges = new cv.Mat();
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      // Convert to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Apply Gaussian blur to reduce noise
      const blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // Apply edge detection
      cv.Canny(blurred, edges, 50, 150);

      // Find contours
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let bestCandidate: PlateDetectionResult | null = null;
      let maxArea = 0;

      // Analyze contours to find rectangular shapes (potential plates)
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        
        // Filter by area (license plates should be reasonably sized)
        if (area > 1000 && area < 50000) {
          const rect = cv.boundingRect(contour);
          const aspectRatio = rect.width / rect.height;
          
          // License plates typically have aspect ratio between 2:1 and 5:1
          if (aspectRatio > 2 && aspectRatio < 5 && area > maxArea) {
            maxArea = area;
            
            // Extract the region of interest (ROI)
            const roi = src.roi(rect);
            const plateText = await this.extractTextFromROI(roi);
            
            if (plateText && this.isValidPlateFormat(plateText)) {
              bestCandidate = {
                plateNumber: plateText,
                confidence: this.calculateConfidence(plateText, aspectRatio, area),
                boundingBox: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height
                }
              };
            }
            
            roi.delete();
          }
        }
        contour.delete();
      }

      // Clean up memory
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();

      return bestCandidate;
    } catch (error) {
      console.error('Error detecting plate:', error);
      return null;
    }
  }

  private async extractTextFromROI(roi: any): Promise<string | null> {
    try {
      // Convert ROI to grayscale for better OCR
      const gray = new cv.Mat();
      cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);

      // Apply adaptive threshold for better results
      const binary = new cv.Mat();
      cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

      // Morphological operations to clean up the image
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
      const cleaned = new cv.Mat();
      cv.morphologyEx(binary, cleaned, cv.MORPH_CLOSE, kernel);

      // Remove noise with opening operation
      const denoised = new cv.Mat();
      cv.morphologyEx(cleaned, denoised, cv.MORPH_OPEN, kernel);

      // Convert to canvas for text extraction
      const canvas = document.createElement('canvas');
      cv.imshow(canvas, denoised);

      // Perform OCR on the processed image
      const plateText = await this.performRealOCR(canvas);

      // Clean up
      gray.delete();
      binary.delete();
      kernel.delete();
      cleaned.delete();
      denoised.delete();

      return plateText;
    } catch (error) {
      console.error('Error extracting text from ROI:', error);
      return null;
    }
  }

  private async performRealOCR(canvas: HTMLCanvasElement): Promise<string | null> {
    try {
      // Get image data for analysis
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Analyze if the image contains text-like patterns
      const hasTextPatterns = this.analyzeTextPatterns(imageData);

      if (!hasTextPatterns) {
        console.log('No text patterns detected in ROI');
        return null;
      }

      // Try to extract characters using basic pattern recognition
      const extractedText = await this.extractCharacters(imageData);

      if (extractedText && this.isValidPlateFormat(extractedText)) {
        console.log('Valid plate text extracted:', extractedText);
        return extractedText;
      }

      console.log('OCR could not extract valid plate text');
      return null;

    } catch (error) {
      console.error('OCR processing failed:', error);
      return null;
    }
  }

  private analyzeTextPatterns(imageData: ImageData): boolean {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let horizontalTransitions = 0;
    let verticalTransitions = 0;
    let totalPixels = 0;

    // Count transitions that indicate text presence
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const nextIdx = (y * width + x + 1) * 4;

        const current = data[idx];
        const next = data[nextIdx];

        if (Math.abs(current - next) > 100) {
          horizontalTransitions++;
        }
        totalPixels++;
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height - 1; y++) {
        const idx = (y * width + x) * 4;
        const nextIdx = ((y + 1) * width + x) * 4;

        const current = data[idx];
        const next = data[nextIdx];

        if (Math.abs(current - next) > 100) {
          verticalTransitions++;
        }
      }
    }

    const transitionRatio = (horizontalTransitions + verticalTransitions) / totalPixels;

    // Text regions should have a reasonable number of transitions
    return transitionRatio > 0.05 && transitionRatio < 0.8;
  }

  private async extractCharacters(imageData: ImageData): Promise<string | null> {
    // This is a simplified character recognition
    // In production, you would use Tesseract.js or a similar OCR library

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Find connected components that could be characters
    const components = this.findConnectedComponents(data, width, height);

    if (components.length < 4 || components.length > 12) {
      // License plates typically have 6-10 characters
      return null;
    }

    // For now, return null to indicate that real OCR is needed
    // This prevents the system from generating fake plate numbers
    console.log(`Found ${components.length} potential character regions, but need real OCR implementation`);
    return null;
  }

  private findConnectedComponents(data: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number, width: number, height: number}> {
    const visited = new Uint8ClampedArray(width * height);
    const components: Array<{x: number, y: number, width: number, height: number}> = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const pixelIdx = idx * 4;

        if (data[pixelIdx] === 0 && visited[idx] === 0) { // Black pixel (text)
          const component = this.floodFill(data, visited, x, y, width, height);

          if (component.pixels > 10 && component.pixels < 500) { // Reasonable character size
            components.push({
              x: component.minX,
              y: component.minY,
              width: component.maxX - component.minX,
              height: component.maxY - component.minY
            });
          }
        }
      }
    }

    return components;
  }

  private floodFill(data: Uint8ClampedArray, visited: Uint8ClampedArray, startX: number, startY: number, width: number, height: number): {minX: number, maxX: number, minY: number, maxY: number, pixels: number} {
    const stack = [{x: startX, y: startY}];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let pixels = 0;

    while (stack.length > 0) {
      const {x, y} = stack.pop()!;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const idx = y * width + x;
      const pixelIdx = idx * 4;

      if (visited[idx] === 1 || data[pixelIdx] !== 0) continue;

      visited[idx] = 1;
      pixels++;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // Add 4-connected neighbors
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
    }

    return {minX, maxX, minY, maxY, pixels};
  }

  private isValidPlateFormat(text: string): boolean {
    // Ghanaian license plate patterns
    const patterns = [
      /^[A-Z]{2}-\d{4}-\d{2}$/,  // GH-1234-20 (standard format)
      /^[A-Z]{2}\s?\d{4}\s?\d{2}$/,  // GH 1234 20 (with spaces)
      /^[A-Z]{3}-\d{3}-\d{2}$/,  // GHA-123-20 (alternative)
      /^[A-Z]{2}\d{4}\d{2}$/,  // GH123420 (no separators)
      /^[A-Z]{2}-\d{3,4}-\d{2}$/   // Flexible digit count
    ];

    return patterns.some(pattern => pattern.test(text.replace(/\s+/g, ' ').trim()));
  }

  private calculateConfidence(plateText: string, aspectRatio: number, area: number): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for valid format
    if (this.isValidPlateFormat(plateText)) {
      confidence += 0.3;
    }

    // Boost confidence for good aspect ratio
    if (aspectRatio >= 2.5 && aspectRatio <= 4.5) {
      confidence += 0.1;
    }

    // Boost confidence for reasonable area
    if (area >= 5000 && area <= 25000) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private fallbackDetection(): PlateDetectionResult | null {
    // When OpenCV is not available, we cannot perform real plate detection
    // Instead of generating fake data, return null to indicate detection failed
    console.log('OpenCV not available and no fallback detection possible');
    console.log('Real plate detection requires proper computer vision libraries');

    return null;
  }

  cleanup(): void {
    this.isInitialized = false;
    this.cascadeClassifier = null;
  }
}

export const plateDetector = new PlateDetector();
