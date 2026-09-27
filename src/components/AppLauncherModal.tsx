import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  MessageCircle,
  Video,
  Instagram,
  Calculator as CalcIcon,
  Compass,
  Music,
  Globe,
  Settings,
  Image as ImageIcon,
  Send,
  Delete,
  CheckCheck
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface AppLauncherModalProps {
  appName: string;
  onClose: () => void;
}

export const AppLauncherModal: React.FC<AppLauncherModalProps> = ({ appName, onClose }) => {
  const normName = appName.toLowerCase().trim();

  // Calculator State
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<string>('');
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // WhatsApp State
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'me' | 'jay'; text: string; time: string }>>([
    { sender: 'jay', text: 'Namaste Mayra! Kya sab theek chal raha hai?', time: '10:14 AM' },
    { sender: 'me', text: 'Ji Jay sir! Main aapke aadesh ka palan kar rahi hoon.', time: '10:15 AM' },
  ]);
  const [waInput, setWaInput] = useState('');

  // YouTube search state
  const [ytQuery, setYtQuery] = useState('');

  const handleCalcNum = (num: string) => {
    sound.playTorchClick(true);
    setCalcInput((prev) => (prev === '0' ? num : prev + num));
  };

  const handleCalcOp = (op: string) => {
    sound.playTorchClick(true);
    setCalcPrev(calcInput);
    setCalcOp(op);
    setCalcInput('0');
  };

  const handleCalcEquals = () => {
    sound.playActionSuccess();
    const prev = parseFloat(calcPrev);
    const curr = parseFloat(calcInput);
    let result = 0;
    if (calcOp === '+') result = prev + curr;
    else if (calcOp === '-') result = prev - curr;
    else if (calcOp === '×' || calcOp === '*') result = prev * curr;
    else if (calcOp === '÷' || calcOp === '/') result = curr !== 0 ? prev / curr : 0;
    else result = curr;

    setCalcInput(String(Number(result.toFixed(6))));
    setCalcPrev('');
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    setCalcInput('0');
    setCalcPrev('');
    setCalcOp(null);
  };

  const sendWaMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!waInput.trim()) return;

    sound.playActionSuccess();
    const newMsg = {
      sender: 'me' as const,
      text: waInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setWaMessages((prev) => [...prev, newMsg]);
    setWaInput('');

    // Auto reply from Jay Prajapati
    setTimeout(() => {
      setWaMessages((prev) => [
        ...prev,
        {
          sender: 'jay',
          text: 'Bahut badhiya Mayra! Shaabash.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  // Render app specific content
  const renderAppContent = () => {
    if (normName.includes('calc')) {
      return (
        <div className="flex flex-col h-full max-w-xs mx-auto">
          {/* Display */}
          <div className="bg-slate-900/90 rounded-2xl p-4 mb-4 border border-cyan-500/20 text-right">
            <div className="text-xs text-slate-400 h-4 font-mono">
              {calcPrev} {calcOp}
            </div>
            <div className="text-3xl font-bold font-mono text-cyan-300 truncate">
              {calcInput}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 flex-1">
            <button
              onClick={handleCalcClear}
              className="p-3.5 rounded-xl bg-rose-950/60 text-rose-300 font-bold border border-rose-500/30 hover:bg-rose-900/60 active:scale-95"
            >
              C
            </button>
            <button
              onClick={() => handleCalcOp('÷')}
              className="p-3.5 rounded-xl bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30 hover:bg-cyan-900/60 active:scale-95"
            >
              ÷
            </button>
            <button
              onClick={() => handleCalcOp('×')}
              className="p-3.5 rounded-xl bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30 hover:bg-cyan-900/60 active:scale-95"
            >
              ×
            </button>
            <button
              onClick={() => setCalcInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))}
              className="p-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 active:scale-95"
            >
              ⌫
            </button>

            {['7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => handleCalcNum(n)}
                className="p-3.5 rounded-xl bg-slate-800/90 text-white font-semibold text-lg hover:bg-slate-700 active:scale-95"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleCalcOp('-')}
              className="p-3.5 rounded-xl bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30 hover:bg-cyan-900/60 active:scale-95"
            >
              -
            </button>

            {['4', '5', '6'].map((n) => (
              <button
                key={n}
                onClick={() => handleCalcNum(n)}
                className="p-3.5 rounded-xl bg-slate-800/90 text-white font-semibold text-lg hover:bg-slate-700 active:scale-95"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleCalcOp('+')}
              className="p-3.5 rounded-xl bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/30 hover:bg-cyan-900/60 active:scale-95"
            >
              +
            </button>

            {['1', '2', '3'].map((n) => (
              <button
                key={n}
                onClick={() => handleCalcNum(n)}
                className="p-3.5 rounded-xl bg-slate-800/90 text-white font-semibold text-lg hover:bg-slate-700 active:scale-95"
              >
                {n}
              </button>
            ))}
            <button
              onClick={handleCalcEquals}
              className="row-span-2 p-3.5 rounded-xl bg-gradient-to-b from-cyan-500 to-sky-600 text-slate-950 font-extrabold text-xl shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-sky-500 active:scale-95 flex items-center justify-center"
            >
              =
            </button>

            <button
              onClick={() => handleCalcNum('0')}
              className="col-span-2 p-3.5 rounded-xl bg-slate-800/90 text-white font-semibold text-lg hover:bg-slate-700 active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => {
                if (!calcInput.includes('.')) handleCalcNum('.');
              }}
              className="p-3.5 rounded-xl bg-slate-800/90 text-white font-semibold text-lg hover:bg-slate-700 active:scale-95"
            >
              .
            </button>
          </div>
        </div>
      );
    }

    if (normName.includes('whatsapp')) {
      return (
        <div className="flex flex-col h-full bg-[#0b141a] rounded-2xl overflow-hidden border border-emerald-500/30">
          {/* Chat Header */}
          <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                JP
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Jay Prajapati (Malik)</h4>
                <p className="text-[11px] text-emerald-400">Online</p>
              </div>
            </div>
            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-400 hover:underline px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30"
            >
              <span>Open Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c1317]">
            {waMessages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[80%] rounded-2xl p-3 text-sm ${
                  m.sender === 'me'
                    ? 'ml-auto bg-[#005c4b] text-white rounded-tr-none'
                    : 'mr-auto bg-[#202c33] text-slate-100 rounded-tl-none'
                }`}
              >
                <span>{m.text}</span>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-300 mt-1">
                  <span>{m.time}</span>
                  {m.sender === 'me' && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={sendWaMessage} className="bg-[#202c33] p-2 flex items-center gap-2">
            <input
              type="text"
              value={waInput}
              onChange={(e) => setWaInput(e.target.value)}
              placeholder="Type message to Jay..."
              className="flex-1 bg-[#2a3942] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              type="submit"
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      );
    }

    if (normName.includes('youtube')) {
      return (
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ytQuery}
              onChange={(e) => setYtQuery(e.target.value)}
              placeholder="Search YouTube videos..."
              className="flex-1 bg-slate-900 border border-red-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-400"
            />
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                ytQuery || 'Hindi songs'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Search</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Featured Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto">
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 hover:border-red-500/40 transition-colors">
              <div className="h-28 bg-gradient-to-tr from-red-950 to-slate-900 rounded-lg flex items-center justify-center text-red-500">
                <Video className="w-10 h-10 animate-pulse" />
              </div>
              <h5 className="font-semibold text-sm text-white mt-2">Latest Trending Hindi Music</h5>
              <p className="text-xs text-slate-400 mt-0.5">Top 50 Bollywood Beats</p>
              <a
                href="https://www.youtube.com/feed/trending"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-red-400 hover:underline"
              >
                Watch on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 hover:border-red-500/40 transition-colors">
              <div className="h-28 bg-gradient-to-tr from-cyan-950 to-slate-900 rounded-lg flex items-center justify-center text-cyan-400">
                <Video className="w-10 h-10" />
              </div>
              <h5 className="font-semibold text-sm text-white mt-2">AI & Tech Innovations</h5>
              <p className="text-xs text-slate-400 mt-0.5">Next-gen Mobile Assistant Tech</p>
              <a
                href="https://www.youtube.com/results?search_query=artificial+intelligence"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                Watch on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Default / Other App view with direct launch link
    const appLinks: Record<string, string> = {
      instagram: 'https://instagram.com',
      chrome: 'https://google.com',
      google: 'https://google.com',
      map: 'https://maps.google.com',
      maps: 'https://maps.google.com',
      spotify: 'https://open.spotify.com',
      gallery: '#',
      facebook: 'https://facebook.com',
      twitter: 'https://x.com',
      telegram: 'https://web.telegram.org',
    };

    const targetUrl =
      Object.entries(appLinks).find(([k]) => normName.includes(k))?.[1] ||
      `https://www.google.com/search?q=${encodeURIComponent(appName)}`;

    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-5 p-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
          <Globe className="w-10 h-10 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-white">{appName}</h4>
          <p className="text-sm text-cyan-300/80 mt-1 max-w-sm">
            Mayra ne aapke aadesh par <span className="font-semibold text-white">{appName}</span> application launch kar diya hai.
          </p>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
        >
          <span>Launch {appName} in Browser / App</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6">
      <div className="relative w-full max-w-lg h-[85vh] max-h-[720px] bg-slate-950 rounded-3xl border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Top App Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-sm text-cyan-300 tracking-wide uppercase">
              MAYRA APP LAUNCHER • {appName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-hidden">{renderAppContent()}</div>
      </div>
    </div>
  );
};
