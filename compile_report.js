const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'Backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'Frontend', 'eason-client');

function readFileStr(p) {
    try {
        return fs.readFileSync(p, 'utf8');
    } catch (e) {
        return '// Could not find ' + p;
    }
}

function extractFunction(content, funcName) {
    // Basic regex to find start of block
    const regexps = [
        new RegExp(`(?:export\\s+)?const\\s+${funcName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{`),
        new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`),
    ];

    let startIndex = -1;
    let braceCount = 0;

    for (const r of regexps) {
        const match = content.match(r);
        if (match) {
            startIndex = match.index;
            break;
        }
    }

    if (startIndex === -1) {
        return '// Function ' + funcName + ' not found';
    }

    // find matching end brace
    let insideStr = false;
    let strChar = '';

    for (let i = startIndex; i < content.length; i++) {
        const c = content[i];

        if (!insideStr) {
            if (c === "'" || c === '"' || c === '`') {
                insideStr = true;
                strChar = c;
            } else if (c === '{') {
                braceCount++;
            } else if (c === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return content.substring(startIndex, i + 1);
                }
            }
        } else {
            if (c === strChar && content[i - 1] !== '\\') {
                insideStr = false;
            }
        }
    }

    return content.substring(startIndex, startIndex + 500) + '\n... [Extraction truncated due to parsing issue]';
}

function extractComponent(content, compName) {
    return extractFunction(content, compName);
}

const outputFile = path.join(ROOT_DIR, '.gemini', 'antigravity', 'brain', 'a8d35c18-6bee-4587-a82b-8f39bb2275c8', 'artifacts', 'eAson_Technical_Details.md');

// Ensure artifacts dir exists
const artifactsDir = path.dirname(outputFile);
if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
}


let md = `# eAson B2B Marketplace - Deep Technical Details\n\n`;
md += `This document contains the exact code snippets and technical logic requested for the academic report.\n\n`;

md += `## 1. Mongoose Schemas (All 11 Models)\n\n`;
const modelsPath = path.join(BACKEND_DIR, 'models');
const models = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));
for (const m of models) {
    if (m.includes('upload')) continue; // Skip upload.js if it's not a model schema
    md += `### ${m}\n\`\`\`javascript\n`;
    md += readFileStr(path.join(modelsPath, m));
    md += `\n\`\`\`\n\n`;
}

md += `## 2. Complete app.js File\n\n`;
md += `\`\`\`javascript\n`;
md += readFileStr(path.join(BACKEND_DIR, 'app.js'));
md += `\n\`\`\`\n\n`;

md += `## 3. kycController.js - runAiCheck Function\n\n`;
const kycStr = readFileStr(path.join(BACKEND_DIR, 'controllers', 'kycController.js'));
md += `\`\`\`javascript\n`;
md += extractFunction(kycStr, 'runAiCheck');
md += `\n\`\`\`\n\n`;

md += `## 4. authController.js - registerUser and loginUser\n\n`;
const authStr = readFileStr(path.join(BACKEND_DIR, 'controllers', 'authController.js'));
md += `### registerUser\n\`\`\`javascript\n`;
md += extractFunction(authStr, 'registerUser');
md += `\n\`\`\`\n\n### loginUser\n\`\`\`javascript\n`;
md += extractFunction(authStr, 'loginUser');
md += `\n\`\`\`\n\n`;

md += `## 5. CartContext.jsx - getTieredPriceForUser and addToCart\n\n`;
const cartStr = readFileStr(path.join(FRONTEND_DIR, 'src', 'context', 'CartContext.jsx'));
md += `### getTieredPriceForUser\n\`\`\`javascript\n`;
md += extractFunction(cartStr, 'getTieredPriceForUser');
md += `\n\`\`\`\n\n### addToCart\n\`\`\`javascript\n`;
md += extractFunction(cartStr, 'addToCart');
md += `\n\`\`\`\n\n`;

md += `## 6. orderController.js - createOrder\n\n`;
const orderStr = readFileStr(path.join(BACKEND_DIR, 'controllers', 'orderController.js'));
md += `\`\`\`javascript\n`;
md += extractFunction(orderStr, 'createOrder');
md += `\n\`\`\`\n\n`;

md += `## 7. useChat.js Zustand Store\n\n`;
md += `\`\`\`javascript\n`;
md += readFileStr(path.join(FRONTEND_DIR, 'src', 'store', 'useChat.js'));
md += `\n\`\`\`\n\n`;

md += `## 8. validators/schemas.js\n\n`;
md += `\`\`\`javascript\n`;
md += readFileStr(path.join(BACKEND_DIR, 'validators', 'schemas.js'));
md += `\n\`\`\`\n\n`;

md += `## 9. categoryAttributes.js Configuration\n\n`;
md += `\`\`\`javascript\n`;
md += readFileStr(path.join(FRONTEND_DIR, 'src', 'utils', 'categoryAttributes.js'));
md += `\n\`\`\`\n\n`;

md += `## 10. paymentController.js\n\n`;
const paymentStr = readFileStr(path.join(BACKEND_DIR, 'controllers', 'paymentController.js'));
md += `### initiateKhaltiPayment\n\`\`\`javascript\n`;
md += extractFunction(paymentStr, 'initiateKhaltiPayment');
md += `\n\`\`\`\n\n### verifyKhaltiPayment\n\`\`\`javascript\n`;
md += extractFunction(paymentStr, 'verifyKhaltiPayment');
md += `\n\`\`\`\n\n`;

md += `## 11. JWT Payload Structure\n\n`;
md += `Based on \`authController.js\`, the token payload looks like this:\n`;
md += `\`\`\`javascript\n`;
md += `const token = jwt.sign(\n`;
md += `  {\n`;
md += `    id: user._id,\n`;
md += `    role: user.role,\n`;
md += `    verified: user.verified\n`;
md += `  },\n`;
md += `  process.env.JWT_SECRET,\n`;
md += `  { expiresIn: '7d' }\n`;
md += `);\n`;
md += `\`\`\`\n`;
md += `- **Fields Signed**: \`id\`, \`role\`, and \`verified\` status.\n`;
md += `- **Expiry**: Set to \`7d\` (7 days).\n\n`;

md += `## 12. productController.js - getProducts\n\n`;
const prodStr = readFileStr(path.join(BACKEND_DIR, 'controllers', 'productController.js'));
md += `\`\`\`javascript\n`;
md += extractFunction(prodStr, 'getProducts');
md += `\n\`\`\`\n\n`;

md += `## 13. VerificationQueue.jsx - ScoreGauge Component\n\n`;
const queueStr = readFileStr(path.join(FRONTEND_DIR, 'src', 'pages', 'dashboard', 'VerificationQueue.jsx'));
md += `\`\`\`javascript\n`;
md += extractFunction(queueStr, 'ScoreGauge');
md += `\n\`\`\`\n\n`;

md += `## 14. Socket.IO Rooms Strategy\n\n`;
md += `The system relies on explicit \`conversationId\` rooms to route messages. When a user opens a chat drawer, they join a room named after the specific conversation ID.\n`;
md += `\n### Server-side Implementation (from \`app.js\`)\n`;
md += `\`\`\`javascript\n`;
md += `socket.on('join_conversation', (conversationId) => socket.join(conversationId));\n`;
md += `socket.on('leave_conversation', (conversationId) => socket.leave(conversationId));\n`;
md += `\`\`\`\n`;
md += `Typing events and read receipts are sent to the \`conversationId\` room via \`socket.to(convId).emit(...)\` ensuring only participants in that specific chat window receive real-time updates. Real-time notifications of new messages are broadcast globally but handled client-side depending on active chats.\n\n`;

md += `## 15. Environment Variables\n\n`;
md += `### Backend \`.env\` Variables\n`;
md += `- \`PORT\`: The port the Express server runs on (e.g., 5000).\n`;
md += `- \`MONGO_URI\`: Connection string for the MongoDB instance.\n`;
md += `- \`JWT_SECRET\`: High-entropy key used to sign and verify JSON Web Tokens.\n`;
md += `- \`ANTHROPIC_API_KEY\`: Claude API credentials for the AI-powered KYC identity checks and marketplace chatbot.\n`;
md += `- \`RESEND_API_KEY\` / \`SMTP_HOST\` / \`SMTP_USER\` / \`SMTP_PASS\`: Credentials for dispatching OTP verifications, order confirmations, and status updates via email.\n`;
md += `- \`FRONTEND_URL\`: Localhost (e.g., \`http://localhost:5173\`) used in CORS configuration to restrict origin access.\n`;
md += `- \`KHALTI_PUBLIC_KEY\` & \`KHALTI_SECRET_KEY\`: API keys generated from Khalti Merchant Dashboard for checkout initialisation and verification.\n`;
md += `### Frontend \`.env\` Variables\n`;
md += `- \`VITE_API_URL\`: Base URL for the backend API endpoints.\n`;
md += `- \`VITE_SOCKET_URL\`: Base URL for the WebSocket connection.\n`;

fs.writeFileSync(outputFile, md);
console.log('Artifact created at ' + outputFile);
