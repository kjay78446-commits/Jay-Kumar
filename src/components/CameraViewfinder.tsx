import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Sparkles, Image as ImageIcon, Download, Trash2 } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface CameraViewfinderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [photos, setPhotos] = useState<string[]>([]);
  const [flashActive, setFlashActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update digital clock in viewfinder
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Camera stream
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setErrorMsg(null);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isMounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        if (isMounted) {
          setErrorMsg('Camera access unavailable or permission denied. Simulation active.');
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Connect video element when stream is ready
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const capturePhoto = () => {
    sound.playShutter();
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);

    if (videoRef.current && videoRef.current.videoWidth) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          // Mirror horizontally for selfie
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotos((prev) => [dataUrl, ...prev]);
        return;
      }
    }

    // Fallback simulation capture if video not available
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#0284c7');
      gradient.addColorStop(1, '#06b6d4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace';
      ctx.fillText('Mayra Camera Snapshot', 180, 220);
      ctx.fillText(new Date().toLocaleString(), 180, 260);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotos((prev) => [dataUrl, ...prev]);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      {/* Screen flash on capture */}
      {flashActive && <div className="fixed inset-0 z-50 bg-white opacity-95 transition-opacity" />}

      <div className="relative w-full max-w-lg h-[92vh] max-h-[820px] bg-slate-950 rounded-3xl overflow-hidden border border-cyan-500/40 shadow-2xl flex flex-col">
        {/* Top Control Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wider">
              MAYRA VISION • {currentTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFacingMode}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
              title="Switch Camera (Front/Rear)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-all active:scale-95"
              title="Close Camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Main View */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="text-center p-6 space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400">
                <Camera className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-sm text-slate-300">{errorMsg}</p>
              <p className="text-xs text-cyan-400 font-mono">
                Simulation mode enabled. You can still test captures!
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
          )}

          {/* Futuristic HUD crosshair / scanner framing */}
          <div className="absolute inset-8 pointer-events-none border border-cyan-500/20 rounded-2xl flex flex-col justify-between p-4">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
            </div>
            {/* Center target circle */}
            <div className="self-center w-16 h-16 rounded-full border border-cyan-400/40 border-dashed animate-spin flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
            </div>
          </div>
        </div>

        {/* Bottom Shutter & Gallery Controls */}
        <div className="p-6 bg-gradient-to-t from-black via-slate-950/90 to-transparent flex items-center justify-around z-20 border-t border-cyan-500/20">
          {/* Gallery Button */}
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="relative p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/50 transition-all"
            title="Captured Photos"
          >
            <ImageIcon className="w-5 h-5" />
            {photos.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                {photos.length}
              </span>
            )}
          </button>

          {/* Shutter Button */}
          <button
            onClick={capturePhoto}
            className="w-18 h-18 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-400 p-1 shadow-lg shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all group"
            title="Take Photo"
          >
            <div className="w-full h-full rounded-full border-4 border-slate-950 bg-white/90 group-hover:bg-white flex items-center justify-center transition-colors">
              <Camera className="w-6 h-6 text-slate-950" />
            </div>
          </button>

          {/* Quick AI Info / filter */}
          <div className="flex flex-col items-center gap-1 text-[11px] text-cyan-400/80 font-mono">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>AI HD</span>
          </div>
        </div>

        {/* Captured Photos Gallery Modal / Drawer */}
        {showGallery && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
              <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Mayra Captured Photos ({photos.length})
              </h3>
              <button
                onClick={() => setShowGallery(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {photos.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  Abhi koi photo capture nahi ki gayi hai. Shutter button press karke photo lijiye!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-900"
                    >
                      <img
                        src={photo}
                        alt={`Capture ${index + 1}`}
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={photo}
                          download={`mayra-capture-${index + 1}.jpg`}
                          className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                          className="p-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
