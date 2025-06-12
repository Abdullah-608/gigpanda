import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Store chat sessions mapped to user IDs
const chatSessions = new Map();

export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }
    
    // Get or create chat session for this user
    let chat;
    if (chatSessions.has(userId)) {
      chat = chatSessions.get(userId);
    } else {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-lite",
        systemInstruction: "You are a helpful assistant for a freelancing platform called GigPanda. Your name is GigPanda Assistant. Be friendly, helpful, and concise.Also use emojis" 
      });
      
      chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });
      
      chatSessions.set(userId, chat);
    }
    
    // Send message to Gemini
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();
    
    res.status(200).json({
      success: true,
      response: responseText
    });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process message',
      error: error.message
    });
  }
};

// Clear chat history for a user
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (chatSessions.has(userId)) {
      chatSessions.delete(userId);
      
      // Create a new chat session
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-lite",
        systemInstruction: "You are a helpful assistant for a freelancing platform called GigPanda. Your name is GigPanda Assistant. Be friendly, helpful, and concise." 
      });
      
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });
      
      chatSessions.set(userId, chat);
      
      return res.status(200).json({
        success: true,
        message: 'Chat history cleared successfully'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'No chat history to clear'
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message
    });
  }
};