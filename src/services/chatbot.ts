import { EmotionState, TonePack } from '../types';

const CHATBOT_API_URL = 'https://api.chatbot.com/v2';

interface ChatbotResponse {
  timestamp: string;
  status: {
    code: number;
    type: string;
  };
  // Add other response fields as needed
  response?: string;
}

// Response templates with context matching
const RESPONSE_TEMPLATES = {
  greeting: [
    "Hello! How can I assist you today?",
    "Hi there! What would you like to talk about?",
    "Greetings! I'm here to help. What's on your mind?"
  ],
  question: {
    what: [
      (subject: string) => `Could you tell me more about ${subject}?`,
      (subject: string) => `I'd be happy to discuss ${subject}. What specifically would you like to know?`,
      (subject: string) => `${subject} is an interesting topic. What would you like to explore about it?`
    ],
    how: [
      (subject: string) => `To help with ${subject}, could you provide more details about what you're trying to achieve?`,
      (subject: string) => `Let me think about how to best approach ${subject}. Could you tell me more about your specific situation?`
    ],
    why: [
      (subject: string) => `That's a great question about ${subject}. Let me help you explore this further.`,
      (subject: string) => `Understanding ${subject} is important. What aspect are you most curious about?`
    ]
  },
  statement: {
    happy: [
      (text: string) => `I'm glad to hear you're feeling positive about ${text}. What's making you feel this way?`,
      (text: string) => `It's wonderful that you're happy about ${text}. Would you like to share more?`
    ],
    sad: [
      (text: string) => `I'm sorry to hear you're feeling down about ${text}. Would you like to talk more about it?`,
      (text: string) => `I hear that ${text} is troubling you. I'm here to listen if you'd like to share more.`
    ],
    default: [
      (text: string) => `I understand you mentioned ${text}. Could you tell me more about that?`,
      (text: string) => `Thanks for sharing about ${text}. What would you like to explore next?`
    ]
  }
};

function extractMainSubject(text: string): string {
  // Simple subject extraction - can be enhanced with NLP if needed
  const words = text.toLowerCase().split(/\s+/);
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
  
  // Find the first noun or the word after a question word
  const nouns = words.filter(word => word.length > 3 && !['that', 'this', 'with', 'about'].includes(word));
  for (let i = 0; i < words.length - 1; i++) {
    if (questionWords.includes(words[i]) && words[i + 1]) {
      return words[i + 1];
    }
  }
  return nouns[0] || 'this topic';
}

export async function getChatbotResponse(
  text: string,
  emotion: EmotionState,
  tonePack: TonePack,
  isLearningMode: boolean,
  accessToken: string
): Promise<string> {
  try {
    // For development/testing, return a contextual response
    if (process.env.NODE_ENV === 'development' || !accessToken) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lowerText = text.toLowerCase().trim();
      const subject = extractMainSubject(text);
      
      // Handle greetings
      if (/^(hi|hello|hey|greetings|good\s(morning|afternoon|evening))\b/i.test(lowerText)) {
        const responses = RESPONSE_TEMPLATES.greeting;
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Handle questions
      if (text.endsWith('?')) {
        if (/\bwhat\b/i.test(lowerText)) {
          const responses = RESPONSE_TEMPLATES.question.what;
          const response = responses[Math.floor(Math.random() * responses.length)];
          return response(subject);
        } else if (/\bhow\b/i.test(lowerText)) {
          const responses = RESPONSE_TEMPLATES.question.how;
          const response = responses[Math.floor(Math.random() * responses.length)];
          return response(subject);
        } else if (/\bwhy\b/i.test(lowerText)) {
          const responses = RESPONSE_TEMPLATES.question.why;
          const response = responses[Math.floor(Math.random() * responses.length)];
          return response(subject);
        }
      }
      
      // Handle statements based on emotion
      const emotionType = emotion?.name?.toLowerCase() || 'default';
      const emotionResponses = RESPONSE_TEMPLATES.statement[emotionType] || RESPONSE_TEMPLATES.statement.default;
      const response = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
      return response(subject || 'that');
    }

    const response = await fetch(`${CHATBOT_API_URL}/stories`, {
      method: 'GET',  // Changed to GET as per your curl example
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: ChatbotResponse = await response.json();
    
    // Return a response based on the status
    if (data.status.code === 200) {
      const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      return data.response || (typeof randomResponse === 'function' ? randomResponse(emotion?.name) : randomResponse);
    } else {
      throw new Error(`API returned status: ${data.status.code} - ${data.status.type}`);
    }
    
  } catch (error) {
    console.error('Error in getChatbotResponse:', error);
    
    // Return a fallback response with a random mock message
    const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    return typeof randomResponse === 'function' ? randomResponse(emotion?.name) : randomResponse;
  }
}
