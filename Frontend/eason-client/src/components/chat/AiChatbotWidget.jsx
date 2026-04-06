import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2, Minus } from 'lucide-react';
import API from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function AiChatbotWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your eAson AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // We will conditionally render the button/widget in the return statement

  const toggleOpen = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the previous conversation history (excluding the very first greeting to save tokens if we want, but let's pass all)
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await API.post('/ai/chat', {
        message: userMessage.content,
        history,
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentWithLinks = (text) => {
    // Simple regex to find product IDs if the AI returns them like "ID: 64b8f...".
    // Alternatively, we just render plain text with Markdown style line breaks.
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  if (!user || user.role === 'admin') return null;

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && !isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleOpen}
            className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-emerald-700 transition-colors z-[100]"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {(isOpen || isMinimized) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed right-6 z-[100] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? 'bottom-6 w-72 h-14 cursor-pointer' : 'bottom-6 w-80 sm:w-96 h-[500px]'
            }`}
          >
            {/* Header */}
            <div 
              className="bg-black text-white p-4 flex items-center justify-between shrink-0"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">eAson Assistant</h3>
                  {!isMinimized && <p className="text-[10px] text-emerald-300">Powered by AI</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && (
                  <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="p-1 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition">
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }} className="p-1 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-br-sm' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}
                      >
                        {renderContentWithLinks(msg.content)}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                  <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about products or orders..."
                      className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white border border-transparent transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
