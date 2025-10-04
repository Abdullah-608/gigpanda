import  { useState, useEffect, useRef } from 'react';
import './ChatBot.css';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/api';

// Use environment variable for API URL with fallback
const API_URL = API_CONFIG.backendURL;

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Welcome to GigPanda AI. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  // IMPORTANT: Define clearChat function BEFORE it's used in the JSX
  const clearChat = async () => {
    try {
      console.log("Clearing chat history via API");
      const response = await fetch(`${API_URL}/api/gemini/clear-chat`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Clear chat response status:', response.status);
      
      if (response.ok) {
        setMessages([
          { sender: 'bot', text: 'Chat history cleared. How can I help you today?' }
        ]);
        toast.success("Chat history cleared successfully");
      } else {
        const errorText = await response.text();
        console.error("Failed to clear chat:", errorText);
        toast.error("Failed to clear chat history");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error(`Failed to clear chat: ${error.message}`);
    }
  };
  
  // Check backend connection when component mounts
  useEffect(() => {
    console.log('FloatingChatbot component mounted');
    
    const checkBackendConnection = async () => {
      try {
        console.log(`Checking backend health at: ${API_URL}/api/gemini/health`);
        
        // Create a controller for timeout manually (compatible with all browsers)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_URL}/api/gemini/health`, {
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Health check response status:', response.status);
        
        if (response.ok) {
          setIsConnected(true);
          setError(null);
          console.log("✅ Successfully connected to backend");
        } else {
          const errorText = await response.text();
          console.error(`Backend health check failed with status: ${response.status}, message: ${errorText}`);
          throw new Error(`Backend responded with status: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to connect to backend:", err);
        
        let errorMessage = "Failed to connect to the AI service. Please try again later.";
        
        if (err.name === 'AbortError') {
          errorMessage = "Connection to AI service timed out. Server might be down or overloaded.";
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        setError(errorMessage);
        setIsConnected(false);
      }
    };
    
    checkBackendConnection();
    
    const intervalId = setInterval(checkBackendConnection, 120000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (error) setError(null);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      console.log("Sending message to backend:", userMessage);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_URL}/api/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        setIsTyping(false);
        toast.error("Please login to use the chat assistant", {
          position: "top-right",
          autoClose: 5000
        });
        setError("Authentication required. Please login to continue.");
        return;
      }
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Server returned an error");
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (err) {
      console.error("Error with backend API:", err);
      setIsTyping(false);
      
      let errorMessage = "I'm having trouble connecting to my brain right now. Please try again later.";
      
      if (err.name === "AbortError") {
        errorMessage = "The request took too long to complete. Please try again with a shorter message.";
      }
      
      setError(`Error: ${err.message}`);
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Fixed return statement
  return (
    <div className="floating-chatbot">
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="header-info">
            <div className="chatbot-avatar">
              <span>GP</span>
            </div>
            <div>
              <h3>GigPanda Assistant</h3>
              <span className={`online-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="clear-button" 
              onClick={clearChat}  // This was causing the error
              title="Clear chat history"
              disabled={!isConnected}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
        </div>
        
        <div className="date-divider">
          <span>{currentDate}</span>
        </div>
        
        <div className="chatbot-messages">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.sender}`}>
              {message.sender === 'bot' && (
                <div className="avatar-small">GP</div>
              )}
              <div className={`message ${message.sender}`}>
                {message.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="avatar-small">GP</div>
              <div className="message bot typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder={isConnected ? "Type a message..." : "Connecting to service..."}
            value={inputText}
            onChange={handleInputChange}
            disabled={isTyping || !isConnected}
          />
          <button 
            type="submit" 
            className={`send-button ${isTyping || !isConnected || inputText.trim() === '' ? 'disabled' : ''}`}
            disabled={isTyping || !isConnected || inputText.trim() === ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
        
        <div className="chatbot-footer">
          <p>Powered by GigPanda AI with Gemini 2.0 Flash Lite</p>
          {!isConnected && <p className="api-status error">API Connection: Not Connected</p>}
        </div>
      </div>
      
      <button 
        className={`chatbot-button ${isOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingChatbot;