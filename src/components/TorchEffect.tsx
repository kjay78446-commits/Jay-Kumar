import React, { useEffect, useRef, useState } from 'react';
import { Flashlight, Zap, X, ShieldAlert, Sparkles, SunMedium } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface TorchEffectProps {
  isOn: boolean;
  onToggle: (on: boolean) => void;
}

export const TorchEffect: React.FC<TorchEffectProps> = ({ isOn, onToggle }) => {
  const [brightness, setBrightness] = useState<number>(100);
  const [strobeMode, setStrobeMode] = useState<boolean>(false);
  const [hardwareTorchAvailable, setHardwareTorchAvailable] = useState<boolean | null>(null);
  const [showFullOverlay, setShowFullOverlay] = useState<boolean>(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const strobeIntervalRef = useRef<any>(null);

  // Hardware torch handling
  useEffect(() => {
    async function manageTorch() {
      if (isOn) {
        sound.playTorchClick(true);
        try {
          if (!trackRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
            });
            const track = stream.getVideoTracks()[0];
            trackRef.current = track;
          }

          const capabilities = (trackRef.current as any).getCapabilities?.();
          if (capabilities && 'torch' in capabilities) {
            await (trackRef.current as any).applyConstraints({
              advanced: [{ torch: true }],
            });
            setHardwareTorchAvailable(true);
          } else {
            setHardwareTorchAvailable(false);
          }
        } catch {
          setHardwareTorchAvailable(false);
        }
      } else {
        sound.playTorchClick(false);
        if (trackRef.current) {
          try {
            await (trackRef.current as any).applyConstraints({
              advanced: [{ torch: false }],
            });
            trackRef.current.stop();
          } catch {}
          trackRef.current = null;
        }
        setStrobeMode(false);
      }
    }

    manageTorch();

    return () => {
      if (trackRef.current) {
        trackRef.current.stop();
        trackRef.current = null;
      }
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
      }
    };
  }, [isOn]);

  // Strobe flashing effect
  useEffect(() => {
    if (strobeMode && isOn) {
      strobeIntervalRef.current = setInterval(() => {
        setBrightness((prev) => (prev > 50 ? 5 : 100));
      }, 100);
    } else {
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
        strobeIntervalRef.current = null;
      }
      if (isOn) setBrightness(100);
    }

    return () => {
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
      }
    };
  }, [strobeMode, isOn]);

  if (!isOn) return null;

  return (
    <>
      {/* Background illumination aura on the entire app viewport */}
      <div
        className="fixed inset-0 pointer-events-none z-30 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at 50% 20%, rgba(255, 255, 255, ${
            (brightness / 100) * 0.4
          }) 0%, rgba(254, 240, 138, ${(brightness / 100) * 0.25}) 40%, transparent 80%)`,
        }}
      />

      {/* Floating Active Torch Floating Widget */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowFullOverlay(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-lg shadow-amber-500/30 hover:bg-amber-500/30 transition-all animate-pulse"
        >
          <Flashlight className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Torch Active</span>
        </button>

        <button
          onClick={() => onToggle(false)}
          className="p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-950 text-rose-300 border border-rose-500/30 backdrop-blur-md transition-all"
          title="Turn Torch Off"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full Screen High-Intensity Flashlight Modal */}
      {showFullOverlay && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-200"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${brightness / 100})`,
            color: brightness > 50 ? '#020617' : '#f8fafc',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-bold">Mayra Torch Control</h2>
            </div>
            <button
              onClick={() => setShowFullOverlay(false)}
              className="p-2 rounded-full bg-black/10 hover:bg-black/20 text-current transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Glow Orb Indicator */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div
                className="w-40 h-40 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 shadow-2xl flex items-center justify-center border-4 border-white transition-transform active:scale-95 cursor-pointer"
                onClick={() => onToggle(false)}
                title="Tap to turn off"
              >
                <Flashlight className="w-20 h-20 text-amber-600 fill-amber-500" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-amber-300/50 animate-ping pointer-events-none" />
            </div>

            <div className="text-center">
              <p className="font-semibold text-base">
                {hardwareTorchAvailable
                  ? 'Device Hardware Flashlight ON'
                  : 'Screen Flashlight Ultra-Glow Active'}
              </p>
              <p className="text-xs opacity-75 mt-1">Tap circle to turn off torch</p>
            </div>
          </div>

          {/* Bottom Settings */}
          <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto w-full space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <SunMedium className="w-4 h-4" />
                Brightness: {brightness}%
              </span>
              <button
                onClick={() => setStrobeMode(!strobeMode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  strobeMode
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/20 hover:bg-black/30'
                }`}
              >
                {strobeMode ? 'SOS Strobe ON' : 'Strobe Mode'}
              </button>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              disabled={strobeMode}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex justify-between items-center pt-1">
              <button
                onClick={() => setShowFullOverlay(false)}
                className="text-xs font-medium underline opacity-80 hover:opacity-100"
              >
                Keep torch on & return to chat
              </button>
              <button
                onClick={() => {
                  onToggle(false);
                  setShowFullOverlay(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Turn Torch OFF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
