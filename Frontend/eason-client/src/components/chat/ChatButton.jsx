import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useChat } from '../../store/useChat';

export default function ChatButton({ wholesalerId, productId, orderId, label = "Message Supplier", className="" }) {
  const { startChat } = useChat();

  const handleStartChat = () => {
    if (!wholesalerId) return;
    startChat({ wholesalerId, productId, orderId });
  };

  return (
    <button 
      onClick={handleStartChat}
      className={`flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-gray-900 transition rounded-xl text-sm font-bold uppercase tracking-widest ${className}`}
    >
      <MessageSquare className="w-4 h-4" />
      {label}
    </button>
  );
}
