import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, MoreVertical, Store, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../../store/useChat';
import { useAuthStore } from '../../store/authStore';

export default function ChatDrawer() {
  const { user } = useAuthStore();
  const { isDrawerOpen, activeConversation, messages, closeDrawer, sendMessage, setTyping, onlineUsers, typingUsers } = useChat();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
    setTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
    }, 1500);
  };

  if (!isDrawerOpen || !activeConversation) return null;

  // Determine other user
  const otherParticipant = activeConversation.participants.find(p => p.user._id !== user._id)?.user;
  const isOnline = onlineUsers.includes(otherParticipant?._id);
  const isOtherTyping = typingUsers[activeConversation._id] === otherParticipant?._id;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-[100] flex flex-col border-l border-gray-200"
      >
        {/* Header */}
        <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                {otherParticipant?.firstName?.[0] || 'U'}
              </div>
              {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 tracking-tight leading-none">
                {otherParticipant?.firstName} {otherParticipant?.lastName}
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {otherParticipant?.shopName || 'Retailer'} {isOnline ? "• Online" : ""}
              </p>
            </div>
          </div>
          <button onClick={closeDrawer} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Context Banner */}
        {activeConversation.product && (
          <div className="bg-gray-50 border-b border-gray-100 p-4 shrink-0 flex items-center gap-4">
            <Store className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-0.5">Inquiry about Product</p>
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{activeConversation.product.name}</p>
            </div>
          </div>
        )}

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <p className="text-sm font-medium">Say hello to start the conversation.</p>
             </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.sender._id === user._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMe ? "bg-emerald-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  <div className={`text-[10px] mt-2 flex items-center gap-1 ${isMe ? "text-emerald-200 justify-end" : "text-gray-400 justify-start"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && (
                       // Simplified read receipt logic
                       msg.readBy?.length > 0 ? <CheckCheck className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-emerald-300" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isOtherTyping && (
             <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-end gap-2">
             <button type="button" className="p-3 text-gray-400 hover:text-gray-600 transition shrink-0">
               <Paperclip className="w-5 h-5" />
             </button>
             <textarea 
               value={text} 
               onChange={handleTyping} 
               onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
               placeholder="Write a message..." 
               rows={1}
               className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 max-h-32 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm resize-none"
             />
             <button type="submit" disabled={!text.trim()} className="p-3 bg-black text-white rounded-xl hover:bg-gray-900 disabled:opacity-50 transition shrink-0">
               <Send className="w-5 h-5" />
             </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
