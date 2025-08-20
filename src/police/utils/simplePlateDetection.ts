// Simplified plate detection that doesn't rely on external models or heavy dependencies
// This is a fallback for when TensorFlow.js models fail to load

export interface SimplePlateDetectionResult {
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

export class SimplePlateDetector {
  private isInitialized = false;

  async initialize(): Promise<void> {
    console.log('Initializing simple plate detector (no external dependencies)');
    this.isInitialized = true;
  }

  async detectPlate(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<SimplePlateDetectionResult | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Running simple plate detection with real image analysis...');

      // Process the actual camera image
      const canvas = this.createCanvasFromImage(imageElement);
      const plateRegions = await this.detectPlateRegions(canvas);

      if (plateRegions.length === 0) {
        console.log('No plate regions detected in this frame');
        return null;
      }

      // Process each detected region
      for (const region of plateRegions) {
        const plateText = await this.extractTextFromRegion(canvas, region);

        if (plateText && this.isValidPlateFormat(plateText.text)) {
          const result: SimplePlateDetectionResult = {
            plateNumber: this.formatPlateNumber(plateText.text),
            confidence: region.confidence,
            ocrConfidence: plateText.confidence,
            boundingBox: region.boundingBox
          };

          console.log('Real detection result:', result);
          return result;
        }
      }

      console.log('No valid plate text found in detected regions');
      return null;
      
    } catch (error) {
      console.error('Simple plate detection failed:', error);
      return null;
    }
  }

  private createCanvasFromImage(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const width = imageElement instanceof HTMLCanvasElement ? imageElement.width :
                  imageElement instanceof HTMLVideoElement ? imageElement.videoWidth || 640 :
                  imageElement.naturalWidth || 640;
    const height = imageElement instanceof HTMLCanvasElement ? imageElement.height :
                   imageElement instanceof HTMLVideoElement ? imageElement.videoHeight || 480 :
                   imageElement.naturalHeight || 480;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement as any, 0, 0, width, height);

    return canvas;
  }

  private async detectPlateRegions(canvas: HTMLCanvasElement): Promise<Array<{confidence: number, boundingBox: {x: number, y: number, width: number, height: number}}>> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and detect rectangular regions
    const grayCanvas = document.createElement('canvas');
    const grayCtx = grayCanvas.getContext('2d')!;
    grayCanvas.width = canvas.width;
    grayCanvas.height = canvas.height;

    const grayImageData = grayCtx.createImageData(canvas.width, canvas.height);
    const grayData = grayImageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      grayData[i] = gray;
      grayData[i + 1] = gray;
      grayData[i + 2] = gray;
      grayData[i + 3] = data[i + 3];
    }

    grayCtx.putImageData(grayImageData, 0, 0);

    // Look for rectangular regions that could be license plates
    const regions = this.findRectangularRegions(grayCanvas);

    return regions.filter(region => this.isPlatelikeRegion(region));
  }

  private findRectangularRegions(canvas: HTMLCanvasElement): Array<{confidence: number, boundingBox: {x: number, y: number, width: number, height: number}}> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const regions = [];
    const minWidth = 80;
    const maxWidth = 300;
    const minHeight = 20;
    const maxHeight = 80;

    // Simple edge detection and region growing
    for (let y = 0; y < height - minHeight; y += 10) {
      for (let x = 0; x < width - minWidth; x += 10) {
        for (let w = minWidth; w <= maxWidth && x + w < width; w += 20) {
          for (let h = minHeight; h <= maxHeight && y + h < height; h += 10) {
            const aspectRatio = w / h;

            // License plates typically have aspect ratio between 2:1 and 5:1
            if (aspectRatio >= 2 && aspectRatio <= 5) {
              const confidence = this.calculateRegionConfidence(data, x, y, w, h, width);

              if (confidence > 0.3) {
                regions.push({
                  confidence,
                  boundingBox: { x, y, width: w, height: h }
                });
              }
            }
          }
        }
      }
    }

    // Sort by confidence and remove overlapping regions
    return this.removeOverlappingRegions(regions.sort((a, b) => b.confidence - a.confidence));
  }

  private calculateRegionConfidence(data: Uint8ClampedArray, x: number, y: number, w: number, h: number, imageWidth: number): number {
    let edgePixels = 0;
    let totalPixels = 0;
    let contrastSum = 0;

    // Sample the region and calculate edge density and contrast
    for (let dy = 0; dy < h; dy += 2) {
      for (let dx = 0; dx < w; dx += 2) {
        const px = x + dx;
        const py = y + dy;

        if (px < imageWidth - 1 && py < data.length / (imageWidth * 4) - 1) {
          const idx = (py * imageWidth + px) * 4;
          const current = data[idx];

          // Check horizontal and vertical gradients
          const rightIdx = idx + 4;
          const bottomIdx = idx + imageWidth * 4;

          if (rightIdx < data.length && bottomIdx < data.length) {
            const horizontalGrad = Math.abs(current - data[rightIdx]);
            const verticalGrad = Math.abs(current - data[bottomIdx]);

            if (horizontalGrad > 30 || verticalGrad > 30) {
              edgePixels++;
            }

            contrastSum += Math.max(horizontalGrad, verticalGrad);
            totalPixels++;
          }
        }
      }
    }

    const edgeRatio = totalPixels > 0 ? edgePixels / totalPixels : 0;
    const avgContrast = totalPixels > 0 ? contrastSum / totalPixels : 0;

    // Combine edge density and contrast for confidence score
    return Math.min(edgeRatio * 2 + avgContrast / 100, 1.0);
  }

  private removeOverlappingRegions(regions: Array<{confidence: number, boundingBox: {x: number, y: number, width: number, height: number}}>): Array<{confidence: number, boundingBox: {x: number, y: number, width: number, height: number}}> {
    const result = [];

    for (let i = 0; i < regions.length; i++) {
      let hasOverlap = false;

      for (let j = 0; j < result.length; j++) {
        if (this.regionsOverlap(regions[i].boundingBox, result[j].boundingBox)) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        result.push(regions[i]);
      }
    }

    return result.slice(0, 3); // Return top 3 candidates
  }

  private regionsOverlap(rect1: {x: number, y: number, width: number, height: number}, rect2: {x: number, y: number, width: number, height: number}): boolean {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
  }

  private isPlatelikeRegion(region: {confidence: number, boundingBox: {x: number, y: number, width: number, height: number}}): boolean {
    const { width, height } = region.boundingBox;
    const aspectRatio = width / height;
    const area = width * height;

    return aspectRatio >= 2 && aspectRatio <= 5 &&
           area >= 1500 && area <= 15000 &&
           region.confidence > 0.3;
  }

  private async extractTextFromRegion(canvas: HTMLCanvasElement, region: {confidence: number, boundingBox: {x: number, y: number, width: number, height: number}}): Promise<{text: string, confidence: number} | null> {
    const { x, y, width, height } = region.boundingBox;

    // Extract the region
    const regionCanvas = document.createElement('canvas');
    const regionCtx = regionCanvas.getContext('2d')!;
    regionCanvas.width = width;
    regionCanvas.height = height;

    regionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    // Preprocess for better OCR
    const processedCanvas = this.preprocessForOCR(regionCanvas);

    // Simple character recognition
    return this.performSimpleOCR(processedCanvas);
  }

  private preprocessForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to binary (black and white)
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const binary = gray > 128 ? 255 : 0;

      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  private async performSimpleOCR(canvas: HTMLCanvasElement): Promise<{text: string, confidence: number} | null> {
    // This is a very basic OCR implementation
    // In production, you would use Tesseract.js or a similar library

    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // For now, return null to indicate no text was detected
    // This forces the system to rely on the database lookup rather than mock data
    return null;
  }

  private isValidPlateFormat(text: string): boolean {
    if (!text || text.length < 6) return false;

    // Ghanaian license plate patterns
    const cleanText = text.replace(/[^A-Z0-9]/g, '');

    const patterns = [
      /^[A-Z]{2}\d{4}\d{2}$/,  // GH123420
      /^[A-Z]{2}\d{3}\d{2}$/,  // GH12320
      /^[A-Z]{3}\d{3}\d{2}$/,  // GHA12320
    ];

    return patterns.some(pattern => pattern.test(cleanText));
  }

  private formatPlateNumber(text: string): string {
    const cleaned = text.replace(/[^A-Z0-9]/g, '');

    if (cleaned.length >= 7) {
      const letters = cleaned.substring(0, 2);
      const middle = cleaned.substring(2, cleaned.length - 2);
      const year = cleaned.substring(cleaned.length - 2);

      return `${letters}-${middle}-${year}`;
    }

    return cleaned;
  }

  cleanup(): void {
    this.isInitialized = false;
    console.log('Simple plate detector cleaned up');
  }
}

export const simplePlateDetector = new SimplePlateDetector();
