import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const SYSTEM_PROMPT = `Aap ek AI Assistant hain jiska naam 'Mayra' hai.
Aapka malik 'Jay Prajapati' hai.
Aap hamesha respectful, polite, sanskari aur helpful tone me baat karenge (Jaise "Ji", "Jay sir", "Namaste", "Main abhi karti hoon", "Aapka swagat hai").
Aap Hindi (Latin script / Hinglish) me hi jawab denge. Hamesha conversational, sweet, polite Hinglish use karein.

Jab bhi user koi mobile action karne ko kahe (jaise camera open karna, torch turn on karna, phone call lagana, ya app open karna), tab aapko ek specific command code zaroor generate karna hai response me:

Command formats (exact format use karein):
- Camera open karne par: ACTION_OPEN_CAMERA
- Torch chalu karne par: ACTION_TORCH_ON
- Torch band karne par: ACTION_TORCH_OFF
- Phone call lagane par: ACTION_CALL_[Number] (Example: ACTION_CALL_9876543210 ya ACTION_CALL_Jay_Prajapati agar number na pata ho toh naam)
- App open karne par: ACTION_OPEN_APP_[AppName] (Example: ACTION_OPEN_APP_WhatsApp, ACTION_OPEN_APP_YouTube, ACTION_OPEN_APP_Instagram, ACTION_OPEN_APP_Chrome, ACTION_OPEN_APP_Calculator, ACTION_OPEN_APP_Maps, ACTION_OPEN_APP_Spotify, ACTION_OPEN_APP_Camera, ACTION_OPEN_APP_Gallery)

Agar user aapse general question puche (jaise "Aap kaun ho?", "Mausam kaisa hai?", "Aapke malik kaun hain?", "Mujhe ek joke sunao", etc.), toh normal Hindi (Hinglish) me sweet aur friendly jawab dein.
Har aadesh ke sath respectful dialogue bole aur exact command code include karein.`;

// Intelligent fallback logic when API key is missing or offline
function generateFallbackResponse(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();

  if (lower.includes('camera') || lower.includes('photo') || lower.includes('tasveer') || lower.includes('selfie')) {
    return 'Ji bilkul! Main abhi camera open kar rahi hoon. ACTION_OPEN_CAMERA';
  }
  if (lower.includes('torch on') || lower.includes('torch chalu') || lower.includes('flashlight on') || lower.includes('roshni') || lower.includes('torch jala')) {
    return 'Ji! Maine torch chalu kar diya hai. ACTION_TORCH_ON';
  }
  if (lower.includes('torch off') || lower.includes('torch band') || lower.includes('flashlight off') || lower.includes('bujha')) {
    return 'Ji, maine torch band kar diya hai. ACTION_TORCH_OFF';
  }
  if (lower.includes('call') || lower.includes('phone') || lower.includes('dial')) {
    const numMatch = userPrompt.match(/\b\d{5,12}\b/);
    if (numMatch) {
      return `Ji, main abhi number ${numMatch[0]} par call laga rahi hoon. ACTION_CALL_${numMatch[0]}`;
    }
    if (lower.includes('jay') || lower.includes('prajapati') || lower.includes('malik') || lower.includes('owner')) {
      return 'Ji, main mere malik Jay Prajapati ji ko call connect kar rahi hoon. ACTION_CALL_Jay_Prajapati';
    }
    return 'Ji, main call connect kar rahi hoon. ACTION_CALL_Support';
  }

  // App opening checks
  const apps = [
    { key: 'whatsapp', name: 'WhatsApp' },
    { key: 'youtube', name: 'YouTube' },
    { key: 'instagram', name: 'Instagram' },
    { key: 'calculator', name: 'Calculator' },
    { key: 'chrome', name: 'Chrome' },
    { key: 'google', name: 'Google' },
    { key: 'map', name: 'Maps' },
    { key: 'spotify', name: 'Spotify' },
    { key: 'gallery', name: 'Gallery' },
    { key: 'facebook', name: 'Facebook' },
    { key: 'twitter', name: 'Twitter' },
    { key: 'x', name: 'Twitter' },
    { key: 'telegram', name: 'Telegram' },
    { key: 'settings', name: 'Settings' }
  ];

  for (const app of apps) {
    if (lower.includes(app.key)) {
      return `Ji zaroor, main aapke liye ${app.name} open kar rahi hoon! ACTION_OPEN_APP_${app.name}`;
    }
  }

  if (lower.includes('kaun ho') || lower.includes('who are you') || lower.includes('naam kya hai') || lower.includes('who made you') || lower.includes('malik')) {
    return 'Namaste! Main Mayra hoon, ek polite aur helpful AI Assistant. Mere aadaraniya malik ka naam Jay Prajapati hai. Main aapke aadesh par mobile actions bhi perform kar sakti hoon!';
  }

  if (lower.includes('namaste') || lower.includes('hello') || lower.includes('hi') || lower.includes('kese ho') || lower.includes('kaise ho')) {
    return 'Namaste ji! Main Mayra hoon aur main bilkul theek hoon. Aapka aashirwaad hai. Bataiye Jay sir ya aapki main kya seva kar sakti hoon?';
  }

  return 'Ji, main aapki baat sun rahi hoon. Main Mayra hoon, Jay Prajapati ji dwara banayi gayi AI assistant. Aap mujhe camera kholne, torch on/off karne, call lagane ya koi app open karne ka aadesh de sakte hain.';
}

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Use fallback handler
      const reply = generateFallbackResponse(message);
      return res.json({ reply, model: 'offline-rule-engine' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format previous messages for conversation context
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item.sender === 'user') {
          formattedContents.push({
            role: 'user',
            parts: [{ text: item.text }],
          });
        } else if (item.sender === 'mayra') {
          formattedContents.push({
            role: 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const replyText = response.text || generateFallbackResponse(message);
    return res.json({ reply: replyText, model: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    // Graceful fallback to avoid leaving user hanging
    const fallback = generateFallbackResponse(req.body?.message || '');
    return res.json({ reply: fallback, fallbackUsed: true });
  }
});

// Permanent ElevenLabs Voice ID for Mayra assistant
export const PERMANENT_ELEVENLABS_VOICE_ID = 'ZEvjs17jNQ2fH5FxAat2';

app.get('/api/tts/config', (_req: Request, res: Response) => {
  res.json({
    voiceId: PERMANENT_ELEVENLABS_VOICE_ID,
    hasApiKey: Boolean(process.env.ELEVENLABS_API_KEY),
    provider: 'ElevenLabs',
  });
});

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Permanently use ZEvjs17jNQ2fH5FxAat2 for all TTS synthesis
    const targetVoiceId = PERMANENT_ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        voiceId: targetVoiceId,
        message: 'No ElevenLabs API key found. Using Web Speech API fallback.',
      });
    }

    // Strip mobile action codes and markdown symbols before synthesizing
    const cleanSpeech = text
      .replace(/ACTION_[A-Z0-9_]+/g, '')
      .replace(/[*_#`~[\]]/g, '')
      .trim();

    if (!cleanSpeech) {
      return res.status(200).json({ fallback: true, message: 'Empty text to speak' });
    }

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: cleanSpeech,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.8,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errDetail = await elevenResponse.text();
      console.warn(`ElevenLabs error (${elevenResponse.status}):`, errDetail);
      return res.status(200).json({
        fallback: true,
        voiceId: targetVoiceId,
        error: `ElevenLabs status ${elevenResponse.status}: ${errDetail}`,
      });
    }

    const audioArrayBuffer = await elevenResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-ElevenLabs-Voice-Id', targetVoiceId);
    return res.send(Buffer.from(audioArrayBuffer));
  } catch (err: any) {
    console.error('Error in /api/tts:', err?.message || err);
    return res.status(200).json({
      fallback: true,
      voiceId: PERMANENT_ELEVENLABS_VOICE_ID,
      error: err?.message || 'TTS generation failed',
    });
  }
});

// Start Express server and connect Vite in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Mayra AI Assistant running on http://0.0.0.0:${port}`);
  });
}

startServer();
