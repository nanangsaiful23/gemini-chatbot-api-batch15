const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Store conversation history to provide context to the Gemini API
let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to UI and history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  // 2. Show temporary "Thinking..." message
  const botMsgElement = appendMessage('bot', '<div class="typing"><span></span><span></span><span></span></div>');

  try {
    // 3. Send the full conversation history to the backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) throw new Error('Failed to get response from server.');

    const data = await response.json();
    const aiReply = data.result; // Matching your backend spec property name

    if (aiReply) {
      // 4. Update the placeholder with the actual AI response
      botMsgElement.innerHTML = formatText(aiReply);
      conversation.push({ role: 'model', text: aiReply });
    } else {
      throw new Error('Sorry, no response received.');
    }
  } catch (error) {
    botMsgElement.textContent = error.message || 'Failed to get response from server.';
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element so we can update its content later
}

// Simple formatter to handle line breaks and bold text for better readability
function formatText(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Add basic styles for the typing animation and bubbles directly via JS 
// to ensure it works without needing an external CSS file
const style = document.createElement('style');
style.textContent = `
  #chat-box { padding: 10px; display: flex; flex-direction: column; gap: 10px; }
  .message { padding: 10px 15px; border-radius: 15px; max-width: 80%; line-height: 1.5; font-family: sans-serif; }
  .user { align-self: flex-end; background: #007bff; color: white; border-bottom-right-radius: 2px; }
  .bot { align-self: flex-start; background: #f1f1f1; color: #333; border-bottom-left-radius: 2px; }
  
  .typing { display: flex; gap: 4px; padding: 5px 0; }
  .typing span { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: blink 1.4s infinite both; }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);
