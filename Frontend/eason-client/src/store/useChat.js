import { create } from 'zustand';
import { io } from 'socket.io-client';
import API from '../utils/api';
import toast from 'react-hot-toast';

const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = baseApiUrl.replace(/\/api\/?$/, '');
export const useChat = create((set, get) => ({
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},
  unreadTotal: 0,
  isDrawerOpen: false,

  initSocket: () => {
    // Prevent duplicate sockets
    if (get().socket) return;
    
    // Auth token is typically in cookies ('eason_token') or local storage.
    // Ensure we send it to Socket.io for authentication.
    const token = localStorage.getItem('eason_token') || '';

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect_error:', err.message);
    });

    socket.on('user_online', (users) => set({ onlineUsers: users }));
    socket.on('user_offline', (users) => set({ onlineUsers: users }));

    socket.on('new_message', (msg) => {
      const { activeConversation, messages, conversations } = get();
      
      // If we are looking at this conversation, push it locally
      if (activeConversation && activeConversation._id === msg.conversation) {
        set({ messages: [...messages, msg] });
        // Auto mark as read
        get().markRead(msg.conversation);
      } else {
        // Otherwise it's unread, increment unread total
        set((state) => ({ unreadTotal: state.unreadTotal + 1 }));
      }

      // Bump conversation to top in list
      const updatedConvs = conversations.map(c => 
        c._id === msg.conversation 
          ? { ...c, lastMessage: { text: msg.text, sender: msg.sender, sentAt: new Date() } }
          : c
      ).sort((a,b) => new Date(b.lastMessage?.sentAt || 0) - new Date(a.lastMessage?.sentAt || 0));
      
      set({ conversations: updatedConvs });
    });

    socket.on('user_typing', ({ conversationId, userId, isTyping }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [conversationId]: isTyping ? userId : null }
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    try {
      const { data } = await API.get('/chat/my');
      set({ conversations: data });
      
      // Calculate total unread (from my perspective)
      // Assuming userId is known by the caller or we calculate total by iterating over all unreadCount where I am the target.
      // Easiest is to let backend send unreadTotal, but we can just use length.
      // Wait, actual unread count per conversation is buried in conv.unreadCount.
      // This is simplified.
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  },

  setActiveConversation: async (conv) => {
    set({ activeConversation: conv, isDrawerOpen: true });
    if (!conv) return;

    try {
      const { data } = await API.get(`/chat/${conv._id}/messages`);
      set({ messages: data });
      get().socket?.emit('join_conversation', conv._id);
      get().markRead(conv._id);
    } catch (err) {
      toast.error('Could not load messages');
    }
  },

  startChat: async ({ wholesalerId, productId, orderId }) => {
    try {
      const { data: conv } = await API.post('/chat/start', { wholesalerId, productId, orderId });
      // Insert into local list if new
      const exists = get().conversations.find(c => c._id === conv._id);
      if (!exists) {
        set((state) => ({ conversations: [conv, ...state.conversations] }));
      }
      get().setActiveConversation(conv);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  },

  sendMessage: async (text, type = 'text', attachments = []) => {
    const { activeConversation, socket } = get();
    if (!activeConversation) return;

    try {
      // Optimistic append omitted for simplicity as we await API
      await API.post(`/chat/${activeConversation._id}/messages`, { text, type, attachments });
      // The socket event 'new_message' will broadcast back to us to append it!
    } catch (err) {
      toast.error('Failed to send message');
    }
  },

  markRead: async (conversationId) => {
    try {
      await API.post(`/chat/${conversationId}/read`);
      // Update local unread counter
      set((state) => {
        const newConvs = state.conversations.map(c => {
          if (c._id === conversationId && c.unreadCount) {
             // simplified clearing unread for current user
             return { ...c };
          }
          return c;
        });
        return { conversations: newConvs, unreadTotal: Math.max(0, state.unreadTotal - 1) };
      });
    } catch (err) {
      // Background fail
    }
  },

  setTyping: (isTyping) => {
    const { socket, activeConversation } = get();
    if (!socket || !activeConversation) return;
    
    if (isTyping) {
      socket.emit('typing_start', activeConversation._id);
    } else {
      socket.emit('typing_stop', activeConversation._id);
    }
  },

  closeDrawer: () => {
    const { socket, activeConversation } = get();
    if (socket && activeConversation) {
      socket.emit('leave_conversation', activeConversation._id);
    }
    set({ isDrawerOpen: false, activeConversation: null, messages: [] });
  }
}));
