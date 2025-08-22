'use server';
/**
 * @fileOverview Detects Ghana number plates in an image.
 *
 * - detectGhanaNumberPlate - A function that handles the number plate detection process.
 * - DetectGhanaNumberPlateInput - The input type for the detectGhanaNumberPlate function.
 * - DetectGhanaNumberPlateOutput - The return type for the detectGhanaNumberPlate function.
 */

import { ai } from '../ai/genkit';
import { z } from 'genkit';

const DetectGhanaNumberPlateInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a Ghana number plate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectGhanaNumberPlateInput = z.infer<typeof DetectGhanaNumberPlateInputSchema>;

const DetectGhanaNumberPlateOutputSchema = z.object({
  numberPlateDetected: z.boolean().describe('Whether a Ghana number plate was detected in the image.'),
  numberPlateText: z.string().optional().describe('The text of the detected number plate, if any.'),
});
export type DetectGhanaNumberPlateOutput = z.infer<typeof DetectGhanaNumberPlateOutputSchema>;

export async function detectGhanaNumberPlate(input: DetectGhanaNumberPlateInput): Promise<DetectGhanaNumberPlateOutput> {
  return detectGhanaNumberPlateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectGhanaNumberPlatePrompt',
  input: { schema: DetectGhanaNumberPlateInputSchema },
  output: { schema: DetectGhanaNumberPlateOutputSchema },
  prompt: `You are an expert in detecting Ghana number plates in images.

You will receive an image and your task is to determine if there is a Ghana number plate in the image. If you find a Ghana number plate, extract the text from the plate.

Analyze the following image:

{{media url=photoDataUri}}

Return a JSON object. Set numberPlateDetected to true if you detect a plate, false otherwise. If you detect a plate, also set numberPlateText to the text extracted from the number plate.

Make sure that the text of the number plate is as accurate as possible, if you are not sure set the numberPlateDetected to false.`,
});

const detectGhanaNumberPlateFlow = ai.defineFlow(
  {
    name: 'detectGhanaNumberPlateFlow',
    inputSchema: DetectGhanaNumberPlateInputSchema,
    outputSchema: DetectGhanaNumberPlateOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
