import React from 'react';
import { X, Terminal, Camera, Flashlight, Phone, LayoutGrid, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface CommandCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const CommandCheatSheet: React.FC<CommandCheatSheetProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  if (!isOpen) return null;

  const commands = [
    {
      action: 'Camera Open Karna',
      code: 'ACTION_OPEN_CAMERA',
      icon: Camera,
      examplePrompt: 'Mayra, camera open karo',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30',
    },
    {
      action: 'Torch Turn On Karna',
      code: 'ACTION_TORCH_ON',
      icon: Flashlight,
      examplePrompt: 'Torch chalu karo',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
    },
    {
      action: 'Torch Turn Off Karna',
      code: 'ACTION_TORCH_OFF',
      icon: Flashlight,
      examplePrompt: 'Torch band karo',
      color: 'text-slate-300 border-slate-700 bg-slate-900/60',
    },
    {
      action: 'Phone Call Lagana',
      code: 'ACTION_CALL_[Number]',
      icon: Phone,
      examplePrompt: 'Jay Prajapati ko call lagao (9876543210)',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
    },
    {
      action: 'App Open Karna (WhatsApp, YouTube, etc.)',
      code: 'ACTION_OPEN_APP_[AppName]',
      icon: LayoutGrid,
      examplePrompt: 'WhatsApp open karo',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-cyan-500/40 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Mayra Command Protocol</h3>
              <p className="text-xs text-cyan-400 font-mono">
                Malik: Jay Prajapati • Assistant: Mayra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Info Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200/90 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <User className="w-4 h-4" />
            <span>Assistant Persona Configuration</span>
          </div>
          <p>
            Mayra hamesha respectful, polite aur helpful tone me Latin Hindi (Hinglish) me jawab deti hain.
            Jab bhi aap mobile action karne ko kehte hain, Mayra specific command code generate karti hain jise system automatically execute karta hai!
          </p>
          <div className="pt-1 flex items-center justify-between font-mono text-[11px] text-cyan-300">
            <span>ElevenLabs Voice:</span>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-cyan-500/30 text-cyan-200">
              ZEvjs17jNQ2fH5FxAat2
            </span>
          </div>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Standard Command Formats
          </p>

          {commands.map((cmd, idx) => {
            const Icon = cmd.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border ${cmd.color} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-semibold text-sm text-white">{cmd.action}</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/40 border border-white/10 font-bold">
                    {cmd.code}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-300 italic">
                    "{cmd.examplePrompt}"
                  </span>
                  <button
                    onClick={() => {
                      onSelectPrompt(cmd.examplePrompt);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Try Now</span>
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cyan-500/20 text-center text-xs text-slate-400">
          Tip: Aap mic button daba kar bol bhi sakte hain!
        </div>
      </div>
    </div>
  );
};
