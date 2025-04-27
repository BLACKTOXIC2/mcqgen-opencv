import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variable
const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Configuration for the model
const geminiConfig = {
  temperature: 0.7,
  topK: 32,
  topP: 0.95,
  maxOutputTokens: 2048,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
};

// Helper function to check if the API key is available
export const isGeminiAvailable = () => {
  console.log("Checking Gemini API key:", API_KEY ? "API key exists" : "No API key found");
  return !!API_KEY;
};

// Generate MCQs based on provided parameters
export async function generateMCQs(params: {
  title: string;
  description: string;
  numberOfQuestions: number;
  classLevel: string;
  subject?: string;
}) {
  try {
    if (!isGeminiAvailable()) {
      throw new Error('Google Gemini API key is not configured.');
    }

    const { title, description, numberOfQuestions, classLevel, subject } = params;
    
    // Use the Gemini-1.5-flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      ...geminiConfig,
    });

    // Construct the prompt for MCQ generation
    const prompt = `Generate ${numberOfQuestions} multiple-choice questions (MCQs) for a ${subject || title} test for ${classLevel} class students.
    
Topic: ${title}
${description ? `Additional details: ${description}` : ''}

Each MCQ should have:
1. A clear question
2. Four options (A, B, C, D)
3. One correct answer (indicated as the index 0-3, where 0=A, 1=B, 2=C, 3=D)

Return the questions in the following JSON format only:
[
  {
    "question": "Question text goes here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": 0
  },
  ... more questions
]`;

    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error('Failed to parse the generated MCQs. Response format was unexpected.');
    }
    
    // Parse the JSON content
    try {
      const mcqsData = JSON.parse(jsonMatch[0]);
      
      // Ensure correct_option is a number for each question
      const formattedData = mcqsData.map((mcq: any) => {
        // Convert correct_option to number if it's a string or any other type
        if (typeof mcq.correct_option !== 'number') {
          mcq.correct_option = parseInt(mcq.correct_option, 10);
          // If parsing fails, default to 0
          if (isNaN(mcq.correct_option)) {
            mcq.correct_option = 0;
          }
        }
        
        // Ensure correct_option is within valid range (0-3)
        if (mcq.correct_option < 0 || mcq.correct_option > 3) {
          mcq.correct_option = 0;
        }
        
        return mcq;
      });
      
      console.log("Parsed MCQs with validated correct_option values:", formattedData);
      return formattedData;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Failed to parse the generated MCQs. Invalid JSON format.');
    }
  } catch (error: any) {
    console.error('Error generating MCQs with Gemini:', error);
    throw new Error(`Failed to generate MCQs: ${error.message}`);
  }
} 