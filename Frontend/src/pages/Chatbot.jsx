import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, ArrowRight, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending a new message and getting response from API
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: inputValue, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and show loading
    const query = inputValue;
    setInputValue("");
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/farm-analysis', 
        { text: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add bot response from API
      if (response.data && response.data.response) {
        setMessages(prev => [...prev, { 
          id: prev.length + 1, 
          text: response.data.response, 
          sender: "bot" 
        }]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error getting response:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        id: prev.length + 1, 
        text: "Sorry, I'm having trouble connecting to the farm analysis service. Please try again later.", 
        sender: "bot" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    setInputValue(text);
    setShowChat(true);
    // Use setTimeout to ensure state updates before sending
    setTimeout(() => {
      const event = { preventDefault: () => {} };
      handleSendMessage(event);
    }, 100);
  };
  
  // Farm-specific suggested questions
  const suggestions = [
    "What are the symptoms of common poultry diseases?",
    "How can I improve egg production in my layer hens?",
    "What's the ideal feed formula for broiler chickens?",
    "How to prevent heatstroke in chickens during summer?",
    "What's the best vaccination schedule for layer hens?",
    "How to improve feed conversion ratio in broilers?"
  ];
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white to-green-50 overflow-hidden">
      {/* Top Navigation/Search Bar */}
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <Search className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="relative p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Icon */}
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-800">
            US
          </div>
        </div>
      </div>

      {showChat ? (
        /* Chat Interface */
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Message area - only this should scroll */}
          <div className="absolute inset-0 overflow-y-auto pt-6 pb-20 px-6">
            <div className="max-w-6xl mx-auto w-full">
              <div className="bg-white shadow-sm border border-gray-200 rounded-md p-4 mb-4">
                {messages.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <HelpCircle className="h-12 w-12 text-gray-300 mb-2" />
                    <p>Ask the Farm Assistant anything about poultry farming or livestock!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-3 max-w-[70%] ${
                          message.sender === "user"
                            ? "bg-[#A8E6CF] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.sender === "bot" ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="text-left mb-4">
                    <div className="inline-block rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          
          {/* Input form - fixed at bottom with no scrolling */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-50 to-transparent py-4 px-6">
            <div className="max-w-6xl mx-auto w-full">
              <form onSubmit={handleSendMessage} className="w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your farming question..."
                    className="w-full pl-4 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-700 bg-white shadow-md"
                    disabled={loading}
                  />
                  <button 
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 bg-[#A8E6CF] hover:bg-green-400 text-white px-4 rounded-r-lg transition-colors flex items-center justify-center"
                    disabled={loading}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Main Content Area - Central Ask Assistant */
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="text-center mb-10">
            <div className="inline-block p-4 rounded-full bg-white shadow-md mb-4">
              <HelpCircle className="h-10 w-10 text-[#A8E6CF]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Farm Assistant</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your agricultural companion for all farming and livestock needs. Ask me anything about poultry farming, egg production, or animal health!
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#A8E6CF] cursor-pointer hover:translate-y-[-2px]"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <p className="text-gray-600">{suggestion}</p>
                </div>
              ))}
            </div>

            <div className="relative w-full">
              <input
                type="text"
                placeholder="Ask me anything about poultry farming or livestock"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-12 py-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] shadow-sm text-gray-700"
              />
              <button 
                className="absolute right-0 top-0 bottom-0 bg-[#A8E6CF] text-white px-4 rounded-r-lg hover:bg-green-400 transition-colors flex items-center justify-center"
                onClick={() => {
                  if (inputValue.trim()) {
                    setShowChat(true);
                    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                  }
                }}
                disabled={loading}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;