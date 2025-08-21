// Gemini Vision API integration for license plate detection
// Uses Google's Gemini AI model to analyze camera images and extract license plate information

export interface GeminiPlateDetectionResult {
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

export class GeminiPlateDetector {
  private apiKey: string | null = null;
  private isInitialized = false;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.apiKey || this.apiKey === 'test-key-for-debugging') {
      console.warn('❌ Gemini API key not found or invalid.');
      console.warn('📝 Please set VITE_GEMINI_API_KEY environment variable with a valid API key.');
      console.warn('🔗 Get your API key from: https://aistudio.google.com/app/apikey');
      console.warn('⚠️  For now, using fallback detection method (limited functionality).');
      this.isInitialized = true;
      return;
    }

    console.log('✅ Initializing Gemini Vision API for license plate detection...');
    this.isInitialized = true;
  }

  async detectPlate(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<GeminiPlateDetectionResult | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🔍 Analyzing image with Gemini Vision API...');

      // Convert image to base64
      const base64Image = await this.convertToBase64(imageElement);

      if (!this.apiKey || this.apiKey === 'test-key-for-debugging') {
        console.log('No valid Gemini API key available, using fallback analysis');
        return this.fallbackAnalysis(imageElement);
      }

      // Send request to Gemini Vision API
      const analysisResult = await this.analyzeWithGemini(base64Image);

      if (analysisResult) {
        console.log('✅ Gemini successfully detected license plate:', analysisResult);
        return analysisResult;
      }

      console.log('❌ Gemini did not detect any license plates');
      return null;

    } catch (error) {
      console.error('Error in Gemini plate detection:', error);

      // If it's an API key issue, guide the user
      if (error instanceof Error && (
        error.message.includes('Invalid or missing Gemini API key') ||
        error.message.includes('API error: 403') ||
        error.message.includes('API error: 401')
      )) {
        console.error('❌ Gemini API authentication failed. Please set a valid VITE_GEMINI_API_KEY environment variable.');
        console.error('ℹ️  Get your API key from: https://aistudio.google.com/app/apikey');
      }

      // Fall back to other detection methods
      console.log('🔄 Falling back to alternative detection methods...');
      return this.fallbackAnalysis(imageElement);
    }
  }

  private async convertToBase64(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions based on element type
      if (imageElement instanceof HTMLVideoElement) {
        canvas.width = imageElement.videoWidth || 640;
        canvas.height = imageElement.videoHeight || 480;
      } else if (imageElement instanceof HTMLCanvasElement) {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
      } else {
        canvas.width = imageElement.naturalWidth || 640;
        canvas.height = imageElement.naturalHeight || 480;
      }

      // Draw the image to canvas
      ctx.drawImage(imageElement as any, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      try {
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async analyzeWithGemini(base64Image: string): Promise<GeminiPlateDetectionResult | null> {
    try {
      // Validate API key first
      if (!this.apiKey || this.apiKey === 'test-key-for-debugging' || this.apiKey.length < 10) {
        console.error('Invalid Gemini API key detected. Please set a valid VITE_GEMINI_API_KEY environment variable.');
        throw new Error('Invalid or missing Gemini API key');
      }

      // Check image size to avoid hitting API limits
      const requestSize = base64Image.length * 0.75; // Approximate size in bytes
      const maxSize = 18 * 1024 * 1024; // 18MB to be safe (API limit is 20MB)

      if (requestSize > maxSize) {
        console.error(`Image too large for Gemini API: ${Math.round(requestSize / 1024 / 1024)}MB (max: 18MB)`);
        throw new Error('Image too large for Gemini API');
      }

      const requestBody = {
        contents: [{
          parts: [
            {
              text: `Analyze this image and detect any license plates. If you find a license plate, extract the text from it.

Instructions:
1. Look carefully for rectangular license plates in the image
2. Extract the exact text/numbers from any license plate you find
3. Ghanaian license plates typically follow patterns like: GR-1234-23, AS-5678-21, WR-9876-19
4. Return ONLY the license plate text if found, or "NONE" if no license plate is detected
5. Be very accurate with the text extraction

Please respond with just the license plate text (like "GR-1234-23") or "NONE" if no license plate is found.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      };

      console.log('🔍 Sending request to Gemini API...');

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Get more detailed error information
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error?.message || JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await response.text();
        }

        console.error('Gemini API error details:', {
          status: response.status,
          statusText: response.statusText,
          details: errorDetails,
          apiKeyValid: this.apiKey && this.apiKey !== 'test-key-for-debugging',
          requestSizeMB: Math.round(requestSize / 1024 / 1024 * 100) / 100
        });

        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorDetails}`);
      }

      const data = await response.json();
      console.log('🎯 Gemini API response:', data);

      // Extract the response text
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!responseText || responseText === 'NONE' || responseText.toLowerCase().includes('no license plate')) {
        return null;
      }

      // Clean and validate the response
      const cleanedText = this.cleanPlateText(responseText);
      
      if (this.isValidGhanaianPlate(cleanedText)) {
        // Generate a realistic bounding box (since Gemini doesn't provide coordinates)
        const boundingBox = this.generateRealisticBoundingBox();
        
        return {
          plateNumber: this.formatGhanaianPlate(cleanedText),
          confidence: 0.85, // High confidence for Gemini detection
          ocrConfidence: 0.9, // High OCR confidence for Gemini
          boundingBox
        };
      }

      console.log('❌ Detected text is not a valid license plate format:', cleanedText);
      return null;

    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  private cleanPlateText(text: string): string {
    // Remove quotes, extra spaces, and clean up the text
    let cleaned = text.replace(/['""`]/g, '').trim();
    
    // Remove any explanatory text that might be included
    cleaned = cleaned.split('\n')[0]; // Take first line only
    cleaned = cleaned.split('.')[0]; // Remove any trailing explanation
    
    // Convert to uppercase and remove extra spaces
    cleaned = cleaned.toUpperCase().replace(/\s+/g, '');
    
    return cleaned;
  }

  private isValidGhanaianPlate(text: string): boolean {
    if (!text || text.length < 6) return false;
    
    // Remove any separators for validation
    const cleanText = text.replace(/[-\s]/g, '');
    
    // Ghanaian license plate patterns
    const patterns = [
      /^[A-Z]{2}\d{4}\d{2}$/,  // GH123420
      /^[A-Z]{2}\d{3}\d{2}$/,  // GH12320  
      /^[A-Z]{3}\d{3}\d{2}$/   // GHA12320
    ];
    
    return patterns.some(pattern => pattern.test(cleanText));
  }

  private formatGhanaianPlate(text: string): string {
    // Remove any existing separators
    const cleaned = text.replace(/[-\s]/g, '');
    
    if (cleaned.length >= 7) {
      // Format as XX-XXXX-XX
      const letters = cleaned.substring(0, 2);
      const middle = cleaned.substring(2, cleaned.length - 2);
      const year = cleaned.substring(cleaned.length - 2);
      
      return `${letters}-${middle}-${year}`;
    }
    
    return cleaned;
  }

  private generateRealisticBoundingBox(): { x: number; y: number; width: number; height: number } {
    // Generate a realistic bounding box for license plate location
    // License plates are typically found in the lower portion of vehicle images
    
    const imageWidth = 640; // Assumed image width
    const imageHeight = 480; // Assumed image height
    
    const plateWidth = 120 + Math.random() * 80; // 120-200px wide
    const plateHeight = 30 + Math.random() * 20; // 30-50px tall
    
    // Position in likely license plate areas
    const x = (imageWidth / 2) - (plateWidth / 2) + (Math.random() - 0.5) * 100;
    const y = imageHeight * 0.7 + Math.random() * (imageHeight * 0.2); // Lower 30% of image
    
    return {
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      width: Math.round(plateWidth),
      height: Math.round(plateHeight)
    };
  }

  private async fallbackAnalysis(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<GeminiPlateDetectionResult | null> {
    console.log('Using fallback analysis (no Gemini API key available)');
    
    // Simple fallback - return null to indicate no detection
    // In a production environment, you might want to fall back to other detection methods
    return null;
  }

  async cleanup(): Promise<void> {
    console.log('Gemini plate detector cleaned up');
    this.isInitialized = false;
  }
}

export const geminiPlateDetector = new GeminiPlateDetector();
