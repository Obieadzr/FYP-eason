import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../store/useChat";
import { useAuthStore } from "../../store/authStore";
import { ChevronRight, ArrowLeft, MessageSquare, ShieldCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, fetchConversations, setActiveConversation } = useChat();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations().then(() => setLoading(false));
  }, [fetchConversations]);

  const openConversation = (conv) => {
    setActiveConversation(conv);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-black hover:bg-gray-100 p-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold tracking-widest uppercase text-black">Inbox</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Messages</h2>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Connect with suppliers for the best deals</p>
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div></div>
        ) : conversations.length === 0 ? (
          <div className="bg-white border text-center border-gray-200 rounded-3xl p-16">
            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 mb-8">Have a question about a product? Message the supplier directly from their product page.</p>
            <button onClick={() => navigate('/marketplace')} className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors">
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 shadow-sm rounded-none md:rounded-3xl overflow-hidden divide-y divide-gray-100">
            {conversations.map(conv => {
              const otherUser = conv.participants.find(p => p.user._id !== user._id)?.user;
              const unread = conv.unreadCount && conv.unreadCount[user._id] > 0;

              return (
                <button 
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left p-4 sm:p-6 flex items-start gap-4 transition-colors hover:bg-gray-50 group relative ${unread ? 'bg-emerald-50/30' : ''}`}
                >
                  {unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                  
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg text-gray-600 shrink-0">
                    {otherUser?.firstName?.[0] || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-base truncate ${unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                        {otherUser?.shopName || `${otherUser?.firstName} ${otherUser?.lastName}`}
                      </h4>
                      {conv.lastMessage?.sentAt && (
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(conv.lastMessage.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    
                    {conv.product && (
                       <p className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-1 truncate">
                         Product Inquiry: {conv.product.name}
                       </p>
                    )}

                    <p className={`text-sm truncate pr-4 ${unread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                       {conv.lastMessage?.text || 'Sent an attachment'}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center self-center text-gray-300 group-hover:text-black transition-colors pl-2">
                    {unread && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-4 inline-block"></span>}
                    <ChevronRight className="w-5 h-5 hidden sm:block" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
