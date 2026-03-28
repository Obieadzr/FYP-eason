import QuoteRequest from '../models/QuoteRequest.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Product from '../models/Product.js';

export const createQuoteRequest = async (req, res) => {
  try {
    const retailerId = req.user.id || req.user._id;
    const { productId, requestedQuantity, targetPrice, message } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const wholesalerId = product.seller;
    if (wholesalerId.toString() === retailerId.toString()) {
      return res.status(400).json({ message: "Cannot request a quote from yourself." });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiration

    const quote = new QuoteRequest({
      product: productId,
      retailer: retailerId,
      wholesaler: wholesalerId,
      requestedQuantity,
      targetPrice,
      message,
      expiresAt
    });

    await quote.save();

    // Optionally auto-create a Conversation and Message
    let conv = await Conversation.findOne({
      'participants.user': { $all: [retailerId, wholesalerId] },
      product: productId
    });

    if (!conv) {
      conv = new Conversation({
        participants: [
          { user: retailerId, role: 'retailer', lastSeen: new Date() },
          { user: wholesalerId, role: 'wholesaler', lastSeen: new Date() }
        ],
        product: productId,
        unreadCount: { [retailerId.toString()]: 0, [wholesalerId.toString()]: 1 }
      });
      await conv.save();
    }

    quote.linkedConversation = conv._id;
    await quote.save();

    // Inject quotation as a chat message
    const msg = new Message({
      conversation: conv._id,
      sender: retailerId,
      text: `Quote Request: ${requestedQuantity} units @ Rs ${targetPrice.toLocaleString()}/unit.\nMessage: ${message}`,
      type: 'quote_request',
      quoteData: quote._id
    });
    await msg.save();
    
    conv.lastMessage = { text: "Quote Request Sent", sender: retailerId, sentAt: new Date() };
    await conv.save();

    const io = req.app.get('io');
    if (io) {
      io.to(conv._id.toString()).emit('new_message', await Message.findById(msg._id).populate('sender', 'firstName lastName shopName'));
    }

    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: "Failed to create quote request" });
  }
};

export const getMyQuotes = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const isRetailer = req.user.role === 'retailer';
    
    const query = isRetailer ? { retailer: userId } : { wholesaler: userId };
    const quotes = await QuoteRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('product', 'name images price wholesalerPrice')
      .populate('retailer', 'firstName lastName shopName')
      .populate('wholesaler', 'firstName lastName shopName');

    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quotes" });
  }
};

export const respondToQuote = async (req, res) => {
  try {
    const wholesalerId = req.user.id || req.user._id;
    const { quoteId } = req.params;
    const { action, price, quantity, message } = req.body; // action: 'accept', 'reject', 'counter'

    const quote = await QuoteRequest.findById(quoteId);
    if (!quote) return res.status(404).json({ message: "Quote not found" });

    if (quote.wholesaler.toString() !== wholesalerId.toString() && quote.retailer.toString() !== wholesalerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (action === 'accept') {
      quote.status = 'accepted';
    } else if (action === 'reject') {
      quote.status = 'rejected';
    } else if (action === 'counter') {
      quote.status = 'counter_offered';
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      quote.counterOffer = { price, quantity, message, expiresAt };
    }

    await quote.save();

    // Inform via chat
    if (quote.linkedConversation) {
       const msgStr = action === 'accept' ? "Quote Accepted!" : action === 'reject' ? "Quote Rejected." : `Counter Offer: ${quantity} units @ Rs ${price}/unit.\nNote: ${message}`;
       const msg = new Message({
         conversation: quote.linkedConversation,
         sender: wholesalerId,
         text: msgStr,
         type: 'quote_response',
         quoteData: quote._id
       });
       await msg.save();
       
       const io = req.app.get('io');
       if (io) {
         io.to(quote.linkedConversation.toString()).emit('new_message', await Message.findById(msg._id).populate('sender', 'firstName lastName shopName'));
       }
    }

    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to quote" });
  }
};
