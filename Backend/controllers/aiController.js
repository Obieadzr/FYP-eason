import Anthropic from '@anthropic-ai/sdk';
import Product from '../models/Product.js';

const getAnthropicClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    const anthropic = getAnthropicClient();

    if (!anthropic) {
      return res.status(200).json({
        reply: "I am currently in Demo Mode because a valid Anthropic API key was not found. However, I can still assist you! What would you like to know about our items?"
      });
    }

    // Fetch the product catalog to provide as context to the AI
    // In a real huge app, we'd use vector embeddings/RAG. Here we'll pull a summary of available products.
    const products = await Product.find({ isActive: true })
      .select('name description category stock wholesalerPrice unit')
      .populate('category', 'name')
      .populate('unit', 'name')
      .limit(50); // limit to avoid massive token usage

    const productContext = products.map(p => 
      `- ID: ${p._id} | Name: ${p.name} | Category: ${p.category?.name || 'N/A'} | Price: Rs ${p.wholesalerPrice} / ${p.unit?.name || 'unit'} | Stock: ${p.stock}`
    ).join('\n');

    const systemPrompt = `You are an intelligent AI assistant for 'eAson', a B2B wholesale marketplace in Nepal.
Your job is to help Retailers find products, answer FAQs about shipping and payments, and guide them to make bulk orders.
Be highly professional, friendly, and concise. Format your responses nicely. 
If suggesting products, you must ONLY suggest products from the provided catalog. Include the product ID if relevant.

**Current Product Catalog Summary:**
${productContext}

**General FAQs:**
- Shipping: Deliveries usually take 1-3 business days within Kathmandu Valley.
- Payments: We accept Cash on Delivery (COD), Khalti, and eSewa.
- Platform: eAson connects retailers directly with wholesalers to eliminate middlemen.`;

    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    formattedHistory.push({ role: 'user', content: message });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedHistory
    });

    res.status(200).json({
      reply: response.content[0].text
    });
  } catch (error) {
    console.warn("AI Chat gracefully intercepted an API error:", error?.message || "Unknown error");
    return res.status(200).json({
      reply: "I am currently in Demo Mode because there was an issue communicating with the AI. However, I can still assist you! What would you like to know about our items?"
    });
  }
};
