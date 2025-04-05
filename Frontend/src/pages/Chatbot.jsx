import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Search, Send, ArrowRight, HelpCircle } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! How can I help you today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [showChat, setShowChat] = useState(false);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    
    // Add user message
    const newMessage = { id: messages.length + 1, text: inputValue, sender: "user" };
    setMessages([...messages, newMessage]);
    setInputValue("");
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = [
        "I'm here to help! What would you like to know?",
        "That's an interesting question. Let me assist you.",
        "Thanks for reaching out. How can I help you further?",
        "I understand. Is there anything specific you'd like to explore?",
        "Great question! Let me provide some information on that."
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      setMessages(prev => [...prev, { id: prev.length + 1, text: randomResponse, sender: "bot" }]);
    }, 1000);
  };

  const handleSuggestionClick = (text) => {
    setInputValue(text);
    setShowChat(true);
    // Simulate submitting the suggestion
    setTimeout(() => {
      handleSendMessage({ preventDefault: () => {} });
    }, 100);
  };
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white to-green-50">
      {/* Top Navigation/Search Bar - Keeping Original */}
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
        <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow-md p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[70%] ${
                    message.sender === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-3 rounded-r-lg hover:bg-green-700 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      ) : (
        /* Main Content Area - Central Ask Assistant */
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-10">
            <div className="inline-block p-4 rounded-full bg-white shadow-md mb-4">
              <HelpCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Farm Assistant</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your agricultural companion for all farming and livestock needs. Ask me anything!
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div 
                className="p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-200 cursor-pointer hover:translate-y-[-2px]"
                onClick={() => handleSuggestionClick("What are the symptoms of common livestock diseases?")}
              >
                <p className="text-gray-600">What are the symptoms of common livestock diseases?</p>
              </div>
              <div 
                className="p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-200 cursor-pointer hover:translate-y-[-2px]"
                onClick={() => handleSuggestionClick("How often should I vaccinate my pet?")}
              >
                <p className="text-gray-600">How often should I vaccinate my pet?</p>
              </div>
              <div 
                className="p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-200 cursor-pointer hover:translate-y-[-2px]"
                onClick={() => handleSuggestionClick("What's the best fertilizer for my crops this season?")}
              >
                <p className="text-gray-600">What's the best fertilizer for my crops this season?</p>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Ask me anything about farming or livestock"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-14 py-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm text-gray-700"
              />
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                onClick={() => {
                  if (inputValue.trim()) {
                    setShowChat(true);
                    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                  }
                }}
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