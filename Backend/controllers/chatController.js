import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getOrCreateConversation = async (req, res) => {
  try {
    const { wholesalerId, productId, orderId } = req.body;
    const currentUserId = req.user.id || req.user._id;

    if (!wholesalerId) return res.status(400).json({ message: "Wholesaler ID required" });
    if (currentUserId.toString() === wholesalerId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Attempt to find existing
    let matchQuery = {
      'participants.user': { $all: [currentUserId, wholesalerId] }
    };
    if (productId) matchQuery.product = productId;
    if (orderId) matchQuery.order = orderId;

    let conv = await Conversation.findOne(matchQuery).populate('participants.user', 'firstName lastName shopName email avatar');
    
    if (!conv) {
      const isRetailer = req.user.role === 'retailer';
      conv = new Conversation({
        participants: [
          { user: currentUserId, role: isRetailer ? 'retailer' : 'wholesaler', lastSeen: new Date() },
          { user: wholesalerId, role: isRetailer ? 'wholesaler' : 'retailer', lastSeen: new Date() }
        ],
        product: productId || null,
        order: orderId || null,
        unreadCount: { [currentUserId.toString()]: 0, [wholesalerId.toString()]: 0 }
      });
      await conv.save();
      conv = await Conversation.findById(conv._id).populate('participants.user', 'firstName lastName shopName email avatar');
    }

    res.status(200).json(conv);
  } catch (error) {
    res.status(500).json({ message: "Failed to initialize conversation", error: error.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const convs = await Conversation.find({ 'participants.user': currentUserId })
      .sort({ 'lastMessage.sentAt': -1 })
      .limit(50)
      .populate('participants.user', 'firstName lastName shopName email')
      .populate('product', 'name images')
      .populate('order', 'status totalAmount');

    res.status(200).json(convs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { before } = req.query; // Cursor

    const currentUserId = req.user.id || req.user._id;
    
    // Verify participation
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    
    const isParticipant = conv.participants.some(p => p.user.toString() === currentUserId.toString());
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    // Mark read
    if (conv.unreadCount.get(currentUserId.toString()) > 0) {
      conv.unreadCount.set(currentUserId.toString(), 0);
      await conv.save();
    }

    let query = { conversation: conversationId, 'deleted.is': false };
    if (before) query._id = { $lt: before };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'firstName lastName shopName');
    
    res.status(200).json(messages.reverse()); // latest at bottom
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, type, attachments, quoteData } = req.body;
    const currentUserId = req.user.id || req.user._id;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });

    const msg = new Message({
      conversation: conversationId,
      sender: currentUserId,
      text,
      type: type || 'text',
      attachments: attachments || [],
      quoteData: quoteData || null
    });

    await msg.save();

    // Determine receiver
    const receiver = conv.participants.find(p => p.user.toString() !== currentUserId.toString())?.user?.toString();
    
    if (receiver) {
      let count = conv.unreadCount.get(receiver) || 0;
      conv.unreadCount.set(receiver, count + 1);
    }
    
    conv.lastMessage = { text, sender: currentUserId, sentAt: new Date() };
    await conv.save();

    // Populate sender for realtime broadcast
    const populatedMsg = await Message.findById(msg._id).populate('sender', 'firstName lastName shopName');

    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('new_message', populatedMsg);
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const markRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });

    conv.unreadCount.set(currentUserId.toString(), 0);
    await conv.save();
    
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('message_read', { conversationId, readerId: currentUserId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark read" });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files provided." });
    }
    
    const file = req.files[0];
    const fileUrl = `/uploads/chat/${file.filename}`;
    
    res.status(200).json({ 
      url: fileUrl, 
      filename: file.originalname,
      type: file.mimetype,
      size: file.size
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload attachment" });
  }
};
