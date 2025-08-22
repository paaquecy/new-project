/**
 * @fileOverview Detects Ghana number plates in an image using Google Generative AI.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DetectGhanaNumberPlateInput {
  photoDataUri: string;
}

export interface DetectGhanaNumberPlateOutput {
  numberPlateDetected: boolean;
  numberPlateText?: string;
}

const API_KEY = 'AIzaSyDbtGczxuC895tYIKmtixpVfa3jQouWnlY';

const genAI = new GoogleGenerativeAI(API_KEY);

export async function detectGhanaNumberPlate(input: DetectGhanaNumberPlateInput): Promise<DetectGhanaNumberPlateOutput> {
  try {
    console.log('🤖 Starting Ghana plate detection with Google AI...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert in detecting Ghana number plates in images.

You will receive an image and your task is to determine if there is a Ghana number plate in the image. If you find a Ghana number plate, extract the text from the plate.

Please analyze the image and return ONLY a JSON object with the following structure:
{
  "numberPlateDetected": true/false,
  "numberPlateText": "detected text or null"
}

Make sure that the text of the number plate is as accurate as possible. If you are not sure about the text, set numberPlateDetected to false.
Only return the JSON object, no other text.`;

    // Convert data URI to the format expected by Gemini
    const imageData = input.photoDataUri.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    const mimeType = input.photoDataUri.match(/data:([^;]+)/)?.[1] || 'image/jpeg';

    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };

    console.log('🔍 Sending image to Google AI for analysis...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Raw AI response:', text);

    // Parse the JSON response
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed AI response:', parsed);
      
      return {
        numberPlateDetected: parsed.numberPlateDetected || false,
        numberPlateText: parsed.numberPlateText || undefined
      };
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.log('Raw response was:', text);
      
      // Fallback: try to extract plate text manually if detection keywords are found
      const lowerText = text.toLowerCase();
      if (lowerText.includes('plate') || lowerText.includes('number') || lowerText.includes('license')) {
        // Simple regex to find potential plate patterns (Ghana format examples)
        const platePatterns = [
          /[A-Z]{2,3}[-\s]?\d{3,4}[-\s]?\d{1,2}/g, // GR-1234-20 format
          /[A-Z]{1,3}[-\s]?\d{1,4}[-\s]?\d{1,4}/g, // General patterns
        ];
        
        for (const pattern of platePatterns) {
          const matches = text.match(pattern);
          if (matches && matches.length > 0) {
            return {
              numberPlateDetected: true,
              numberPlateText: matches[0].replace(/[-\s]/g, ' ').trim()
            };
          }
        }
      }
      
      return {
        numberPlateDetected: false,
        numberPlateText: undefined
      };
    }
  } catch (error) {
    console.error('❌ Ghana plate detection failed:', error);
    return {
      numberPlateDetected: false,
      numberPlateText: undefined
    };
  }
}
