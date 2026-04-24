import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const GEMINI_MODEL = 'gemini-2.5-flash';
// const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Conversation must be an array!');
        
        const model = ai.getGenerativeModel({ 
            model: GEMINI_MODEL,
            systemInstruction: `Nama Anda adalah Bunga. Jawab dengan ramah seakan-akan anda adalah asisten travel yang membantu pengguna untuk merencanakan perjalanan mereka.
                                Tanyakan mau liburan kemana dan berapa lama, lalu berikan rekomendasi wisata dan itinerary selama di tempat tujuan.`,
        });

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }],
        }));

        const result = await model.generateContent({
            contents,
            generationConfig: { temperature: 0.7, topK: 20 }
        });
        
        const response = await result.response;
        res.json({ result: response.text() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
