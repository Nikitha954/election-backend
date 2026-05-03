import React, { useState, useRef, useEffect } from 'react';

function App() {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Welcome! I am your Election Assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null); // Tracks the DB session
  
  // Ref to automatically scroll to the bottom of the chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  // --- API LOGIC ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    
    // 1. Instantly show the user's message in the UI
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);

    try {
      // 2. Send the payload to your Spring Boot Backend
      const response = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId, // Send the ID if we have one
          message: userMsg
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();

      // 3. Update the UI with the AI's response and save the session ID
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "I'm having trouble connecting to the server right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI RENDER (Tailwind CSS) ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      
      {/* Main Chat Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-center shadow-md z-10">
          <h1 className="text-white font-bold text-xl tracking-wide">Election Navigator</h1>
          <p className="text-blue-200 text-xs mt-1">Official AI Assistant</p>
        </div>

        {/* Message Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm'
                }`}
                // Using dangerouslySetInnerHTML allows the backend <br> and <strong> tags to render
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 shadow-sm text-gray-500 rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Ask about registration, dates..."
              className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className="bg-blue-600 text-white rounded-full px-6 py-3 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;