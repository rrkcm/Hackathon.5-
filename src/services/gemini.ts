import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmotionState, TonePack } from '../types';

// Using Vite's import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: VITE_GEMINI_API_KEY is not set in environment variables');
  throw new Error('API key is required. Please check your .env file');
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generates an AI response using the Gemini API based on user input and emotional context.
 */
export async function getGeminiResponse(
  text: string,
  emotion: EmotionState,
  tonePack: TonePack,
  isLearningMode: boolean
): Promise<string> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const persona = "You are the AI brain of NeuroBridge, an emotion-aware conversation assistant. " +
      "Your responses should be warm, empathetic, and supportive. " +
      "You're talking to someone who is currently feeling " + emotion.name + ". " +
      (emotion.tooltip ? "Note: " + emotion.tooltip : '');
    
    // Get the appropriate response style based on learning mode
    const responseStyle = isLearningMode 
      ? tonePack.learningResponses?.[emotion.name] || 'Let\'s learn something new!'
      : tonePack.responses?.[emotion.name] || 'How can I help you today?';
    
    const context = `
      - Current emotional state: ${emotion.name} (${emotion.emoji})
      - Mode: ${isLearningMode ? 'Learning' : 'Conversation'}
      - Tone: ${tonePack?.name || 'Default'}
      - Response Style: ${responseStyle}
    `;

    const prompt = `${persona}
    
    CONTEXT:
    ${context}
    
    User: ${text}
    
    Your response (be concise and natural):`;

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });
    
    const response = await result.response;
    return response.text() || "I'm not sure how to respond to that.";
    
  } catch (error) {
    console.error('Error generating response:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // More specific error messages based on the error type
      if (error.message.includes('API key not valid') || error.message.includes('API key')) {
        return "Error: The provided API key is invalid. Please check your .env file and make sure VITE_GEMINI_API_KEY is set correctly.";
      } else if (error.message.includes('quota')) {
        return "Error: API quota exceeded. Please check your Google Cloud account or try again later.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return "Error: Network connection issue. Please check your internet connection.";
      }
    }
    
    return "I'm sorry, I'm having trouble connecting to the AI service. Please try again later.";
  }
}
