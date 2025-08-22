import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with Google AI
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyDbtGczxuC895tYIKmtixpVfa3jQouWnlY',
    }),
  ],
});
