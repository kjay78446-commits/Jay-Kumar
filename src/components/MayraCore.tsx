import React from 'react';
import { Mic, Volume2, Sparkles, Loader2 } from 'lucide-react';

interface MayraCoreProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing';
  onTap: () => void;
}

export const MayraCore: React.FC<MayraCoreProps> = ({ state, onTap }) => {
  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Interactive Orb */}
      <div
        onClick={onTap}
        className="relative cursor-pointer group flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 transition-transform active:scale-95"
        title="Tap to speak or interact with Mayra"
      >
        {/* Outer ambient aura ring */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
            state === 'listening'
              ? 'bg-rose-500/40 scale-125 animate-pulse'
              : state === 'speaking'
              ? 'bg-cyan-400/40 scale-125 animate-pulse'
              : state === 'processing'
              ? 'bg-violet-500/40 scale-110'
              : 'bg-cyan-500/20 group-hover:bg-cyan-500/35'
          }`}
        />

        {/* Orbiting particle ring */}
        <div
          className={`absolute -inset-2 rounded-full border border-dashed transition-all duration-500 ${
            state === 'listening'
              ? 'border-rose-400 animate-spin duration-3000'
              : state === 'speaking'
              ? 'border-cyan-400 animate-spin duration-4000'
              : state === 'processing'
              ? 'border-violet-400 animate-spin duration-1000'
              : 'border-cyan-500/30'
          }`}
        />

        {/* Core sphere */}
        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 shadow-rose-500/50'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 shadow-cyan-500/50'
              : state === 'processing'
              ? 'bg-gradient-to-tr from-violet-700 via-indigo-600 to-cyan-500 shadow-violet-500/50'
              : 'bg-gradient-to-tr from-slate-900 via-cyan-950 to-slate-900 border border-cyan-400/50 shadow-cyan-500/25 group-hover:border-cyan-400'
          }`}
        >
          {/* Inner waveform / icons */}
          {state === 'listening' ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-9 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-7 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : state === 'speaking' ? (
            <div className="flex items-center gap-1">
              <Volume2 className="w-8 h-8 text-white animate-pulse" />
            </div>
          ) : state === 'processing' ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <div className="flex flex-col items-center justify-center text-cyan-300 group-hover:text-white transition-colors">
              <Sparkles className="w-7 h-7 animate-pulse text-cyan-400" />
            </div>
          )}
        </div>
      </div>

      {/* State label badge */}
      <div className="mt-2 text-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide uppercase transition-all ${
            state === 'listening'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : state === 'speaking'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : state === 'processing'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'bg-slate-900/80 text-cyan-400/90 border border-cyan-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              state === 'listening'
                ? 'bg-rose-400 animate-ping'
                : state === 'speaking'
                ? 'bg-cyan-400 animate-ping'
                : state === 'processing'
                ? 'bg-violet-400 animate-spin'
                : 'bg-cyan-400'
            }`}
          />
          {state === 'listening'
            ? 'Sun Rahi Hoon... (Listening)'
            : state === 'speaking'
            ? 'Bol Rahi Hoon... (Speaking)'
            : state === 'processing'
            ? 'Soch Rahi Hoon... (Processing)'
            : 'Mayra AI • Tap to Speak'}
        </span>
      </div>
    </div>
  );
};
