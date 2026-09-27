/**
 * Mayra - AI Mobile Assistant
 * Created for Jay Prajapati
 * Respectful, Polite Hindi (Hinglish) with real Mobile Action Command Generation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Camera,
  Flashlight,
  Phone,
  LayoutGrid,
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Minimize2,
  Info,
  Sparkles,
  RefreshCw,
  Clock,
  Wifi,
  Battery,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

import { ChatMessage, MobileAction, ActionType } from './types/actions';
import { parseAssistantResponse } from './utils/commandParser';
import { voice } from './utils/voiceService';
import { sound } from './utils/soundEffects';
import { CameraViewfinder } from './components/CameraViewfinder';
import { TorchEffect } from './components/TorchEffect';
import { CallModal } from './components/CallModal';
import { AppLauncherModal } from './components/AppLauncherModal';
import { MayraCore } from './components/MayraCore';
import { CommandCheatSheet } from './components/CommandCheatSheet';

export default function App() {
  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'mayra',
      text: 'Namaste! Main Mayra hoon, aapki AI Assistant. Mere malik ka naam Jay Prajapati hai.\n\nMain aapki madad ke liye hamesha hazir hoon. Aap mujhse koi bhi sawal pooch sakte hain ya mobile actions (jaise camera kholna, torch on/off karna, call lagana ya koi app open karna) ke liye keh sakte hain.\n\nBataiye Jay sir, aaj main aapki kya sahayata kar sakti hoon?',
      cleanText: 'Namaste! Main Mayra hoon, aapki AI Assistant. Mere malik ka naam Jay Prajapati hai. Main aapki madad ke liye hamesha hazir hoon.',
      timestamp: new Date(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coreState, setCoreState] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');

  // Interactive Actions State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [callTarget, setCallTarget] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [lastExecutedAction, setLastExecutedAction] = useState<MobileAction | null>(null);

  // Settings & View
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync sounds & speech setting
  useEffect(() => {
    sound.enabled = soundFxEnabled;
  }, [soundFxEnabled]);

  useEffect(() => {
    voice.voiceEnabled = voiceSpeechEnabled;
    if (!voiceSpeechEnabled) {
      voice.stopSpeaking();
    }
  }, [voiceSpeechEnabled]);

  // Digital clock for phone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Execute parsed mobile action
  const executeAction = (action: MobileAction) => {
    sound.playActionSuccess();
    setLastExecutedAction(action);

    switch (action.type) {
      case 'OPEN_CAMERA':
        setIsCameraOpen(true);
        break;
      case 'TORCH_ON':
        setIsTorchOn(true);
        break;
      case 'TORCH_OFF':
        setIsTorchOn(false);
        break;
      case 'CALL_PHONE':
        setCallTarget(action.parameter || 'Jay Prajapati');
        break;
      case 'OPEN_APP':
        setActiveApp(action.parameter || 'App');
        break;
      default:
        break;
    }
  };

  // Send message to Mayra
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    sound.playTorchClick(true);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setCoreState('processing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const replyRaw = data.reply || 'Ji, main aapka aadesh samajh gayi hoon.';

      // Parse Action Commands
      const parsed = parseAssistantResponse(replyRaw);

      const mayraMsg: ChatMessage = {
        id: `mayra-${Date.now()}`,
        sender: 'mayra',
        text: replyRaw,
        cleanText: parsed.cleanText,
        action: parsed.action,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, mayraMsg]);
      sound.playChime();

      // If action detected, execute it!
      if (parsed.hasAction && parsed.action) {
        setTimeout(() => {
          executeAction(parsed.action!);
        }, 600);
      }

      // Speak polite reply aloud
      if (voiceSpeechEnabled) {
        setCoreState('speaking');
        voice.speak(
          parsed.cleanText || replyRaw,
          () => setCoreState('speaking'),
          () => setCoreState('idle')
        );
      } else {
        setCoreState('idle');
      }
    } catch (err) {
      console.error(err);
      // Fallback response
      const fallbackReply =
        'Ji Jay sir, main hamesha aapki seva me hazir hoon. Bataiye agla aadesh kya hai?';
      const fallbackMsg: ChatMessage = {
        id: `mayra-${Date.now()}`,
        sender: 'mayra',
        text: fallbackReply,
        cleanText: fallbackReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setCoreState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Voice Recognition
  const toggleSpeechRecognition = () => {
    if (coreState === 'speaking') {
      voice.stopSpeaking();
      setCoreState('idle');
      return;
    }

    if (coreState === 'listening') {
      voice.stopListening();
      setCoreState('idle');
      return;
    }

    sound.playChime();
    setCoreState('listening');

    voice.startListening(
      (transcript, isFinal) => {
        setInputPrompt(transcript);
        if (isFinal) {
          handleSendMessage(transcript);
        }
      },
      (err) => {
        console.warn('Voice recognition notice:', err);
        setCoreState('idle');
      },
      () => {
        setCoreState('idle');
      }
    );
  };

  // Quick Action Chips in Hindi
  const quickChips = [
    { label: '📸 Camera kholo', prompt: 'Camera open karo' },
    { label: '🔦 Torch on karo', prompt: 'Torch chalu karo' },
    { label: '📞 Jay Prajapati ko call', prompt: 'Jay Prajapati ko call lagao (9876543210)' },
    { label: '💬 WhatsApp kholo', prompt: 'WhatsApp open karo' },
    { label: '🎬 YouTube open karo', prompt: 'YouTube open karo' },
    { label: '🧮 Calculator kholo', prompt: 'Calculator open karo' },
    { label: '🔦 Torch band karo', prompt: 'Torch band karo' },
    { label: '👑 Malik kaun hai?', prompt: 'Aap kaun ho aur aapka malik kaun hai?' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 overflow-x-hidden font-sans">
      {/* Background Futuristic Grid Lines */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Real Torch / Flashlight Overlay */}
      <TorchEffect isOn={isTorchOn} onToggle={setIsTorchOn} />

      {/* Camera Live Viewfinder */}
      <CameraViewfinder isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      {/* Phone Call Screen */}
      {callTarget && (
        <CallModal target={callTarget} onClose={() => setCallTarget(null)} />
      )}

      {/* App Launcher Screen */}
      {activeApp && (
        <AppLauncherModal appName={activeApp} onClose={() => setActiveApp(null)} />
      )}

      {/* Command Cheat Sheet */}
      <CommandCheatSheet
        isOpen={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      {/* Top Application Bar (Full view controls) */}
      <header className="w-full max-w-4xl px-4 py-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-md shadow-cyan-500/30 flex items-center justify-center">
            <span className="font-extrabold text-slate-950 text-sm">M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-wide text-white">MAYRA</h1>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                v2.5 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Malik: <span className="text-cyan-400 font-medium">Jay Prajapati</span>
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Torch Quick Toggle */}
          <button
            onClick={() => setIsTorchOn(!isTorchOn)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isTorchOn
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/40 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Torch On / Off"
          >
            <Flashlight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isTorchOn ? 'Torch ON' : 'Torch'}</span>
          </button>

          {/* Camera Quick Launch */}
          <button
            onClick={() => setIsCameraOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all text-xs flex items-center gap-1.5"
            title="Camera Vision"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Camera</span>
          </button>

          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
            className={`p-2 rounded-xl border transition-all ${
              voiceSpeechEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={voiceSpeechEnabled ? 'Voice Output ON' : 'Voice Output Muted'}
          >
            {voiceSpeechEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Format Cheatsheet */}
          <button
            onClick={() => setShowCheatSheet(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-slate-800 transition-all"
            title="Command Format Spec"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Phone Frame vs Full Frame Mode */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all"
            title={isPhoneFrame ? 'Expand to Full View' : 'Switch to Phone View'}
          >
            {isPhoneFrame ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Phone Frame or Responsive Full Width */}
      <main
        className={`relative w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-md h-[94vh] sm:h-[860px] bg-slate-950 sm:rounded-[44px] border sm:border-slate-800/80 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden sm:ring-8 sm:ring-slate-900'
            : 'max-w-4xl h-[92vh] bg-slate-950/80 rounded-3xl border border-cyan-500/20 backdrop-blur-xl shadow-2xl overflow-hidden'
        }`}
      >
        {/* Phone Dynamic Island & Status Bar (if phone frame) */}
        {isPhoneFrame && (
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 select-none z-20">
            <span className="font-semibold text-white tracking-wider">{currentTime || '10:28'}</span>

            {/* Simulated Dynamic Island Pill */}
            <div className="h-5 w-24 bg-black rounded-full border border-slate-800 flex items-center justify-center gap-1.5 px-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isTorchOn
                    ? 'bg-amber-400 animate-pulse'
                    : isCameraOpen
                    ? 'bg-emerald-400 animate-pulse'
                    : coreState === 'listening'
                    ? 'bg-rose-400 animate-pulse'
                    : 'bg-cyan-500'
                }`}
              />
              <span className="text-[9px] font-mono text-slate-300">
                {isTorchOn
                  ? 'TORCH'
                  : isCameraOpen
                  ? 'CAM'
                  : coreState === 'listening'
                  ? 'LISTENING'
                  : 'MAYRA'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Mayra Holographic Core Banner */}
        <div className="border-b border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 via-slate-950 to-slate-950 pt-2 pb-3 px-4 flex flex-col items-center">
          <MayraCore state={coreState} onTap={toggleSpeechRecognition} />

          {/* Last Executed Action Badge */}
          {lastExecutedAction && (
            <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 animate-pulse">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>Executed: {lastExecutedAction.rawCommand}</span>
            </div>
          )}
        </div>

        {/* Chat Stream / Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMayra = msg.sender === 'mayra';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMayra ? 'items-start mr-8' : 'items-end ml-8'
                } group`}
              >
                {/* Sender Tag */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-mono">
                  {isMayra ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="font-bold text-cyan-300">Mayra (Assistant)</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-300">Jay Prajapati (Malik)</span>
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                    </>
                  )}
                  <span className="text-[10px] text-slate-500">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isMayra
                      ? 'bg-slate-900 border border-cyan-500/30 text-slate-100 rounded-tl-sm shadow-md shadow-cyan-950/20'
                      : 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-sm shadow-md shadow-cyan-600/20'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.cleanText || msg.text}</p>

                  {/* Generated Mobile Action Command Badge */}
                  {msg.action && (
                    <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/50 text-cyan-300 font-bold border border-cyan-500/40">
                          {msg.action.rawCommand}
                        </span>
                      </div>

                      <button
                        onClick={() => executeAction(msg.action!)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/40 transition-colors"
                      >
                        <span>Re-Execute</span>
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono py-2 px-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Mayra aadesh process kar rahi hain...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Action Chips Carousel */}
        <div className="px-3 py-2 border-t border-slate-800 bg-slate-950 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-cyan-300 font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-slate-900 border-t border-cyan-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Button with state reactive pulse */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                coreState === 'listening'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'
              }`}
              title="Speak in Hindi/Hinglish"
            >
              {coreState === 'listening' ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Mayra ko aadesh dein (e.g. 'camera kholo', 'torch on karo')..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              title="Send Command"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-mono">
            <span>Mayra • AI Assistant for Jay Prajapati</span>
            <span className="flex items-center gap-1 text-cyan-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              TTS Voice ID: {voice.elevenLabsVoiceId}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
