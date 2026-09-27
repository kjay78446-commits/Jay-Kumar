import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Grid, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface CallModalProps {
  target: string; // Number or name
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ target, onClose }) => {
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [enteredDigits, setEnteredDigits] = useState<string>('');

  const displayName = target
    .replace(/_/g, ' ')
    .replace(/^([a-z])/, (m) => m.toUpperCase());

  const isOwner =
    displayName.toLowerCase().includes('jay') ||
    displayName.toLowerCase().includes('prajapati') ||
    displayName.toLowerCase().includes('malik');

  const cleanDigits = target.replace(/[^0-9+*#]/g, '');

  // Play dial tone & transition to connected
  useEffect(() => {
    sound.playDialTone();
    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 2800);

    return () => clearTimeout(connectTimer);
  }, []);

  // Call timer
  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    sound.playActionSuccess();
    onClose();
  };

  const handleKeypadPress = (digit: string) => {
    sound.playTorchClick(true);
    setEnteredDigits((prev) => prev + digit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-cyan-500/30 shadow-2xl p-6 flex flex-col items-center justify-between min-h-[580px]">
        {/* Top Status & Brand */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400/80">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MAYRA CALL SERVICE
          </span>
          <span>{callState === 'calling' ? 'Ringing...' : 'Encrypted HD'}</span>
        </div>

        {/* Contact Avatar & Info */}
        <div className="flex flex-col items-center my-6 text-center space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-cyan-300">
                <User className="w-12 h-12" />
              </div>
            </div>
            {isOwner && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-md" title="Malik / Owner">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
            {callState === 'calling' && (
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-40 pointer-events-none" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              {displayName}
            </h3>
            {isOwner && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                Owner / Malik: Jay Prajapati
              </span>
            )}
            <p className="text-sm font-mono text-cyan-300/80 mt-1">
              {callState === 'calling' ? 'Calling...' : formatTimer(duration)}
            </p>
          </div>
        </div>

        {/* Interactive Keypad Overlay if opened */}
        {showKeypad ? (
          <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-cyan-500/20 my-2">
            <div className="text-center font-mono text-cyan-300 text-sm h-6 mb-2 tracking-widest overflow-hidden">
              {enteredDigits || 'Enter digits'}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleKeypadPress(d)}
                  className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-900/40 text-white font-bold text-base border border-slate-700 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowKeypad(false)}
              className="w-full mt-3 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 text-center"
            >
              Hide Keypad
            </button>
          </div>
        ) : (
          /* Controls Grid */
          <div className="w-full grid grid-cols-3 gap-3 my-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
              <span className="text-[11px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setShowKeypad(true)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all"
            >
              <Grid className="w-5 h-5 mb-1 text-cyan-400" />
              <span className="text-[11px] font-medium">Keypad</span>
            </button>

            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                isSpeaker
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-5 h-5 mb-1" /> : <VolumeX className="w-5 h-5 mb-1" />}
              <span className="text-[11px] font-medium">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
            </button>
          </div>
        )}

        {/* Real Device Dialer Quick Link if phone digits found */}
        {cleanDigits && (
          <a
            href={`tel:${cleanDigits}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-900/40 text-xs transition-colors mb-4"
          >
            <span>Dial on Mobile SIM ({cleanDigits})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* End Call Button */}
        <div className="w-full flex justify-center pt-2">
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-95 transition-all"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
