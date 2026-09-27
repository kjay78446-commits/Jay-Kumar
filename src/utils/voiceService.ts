/**
 * Speech Recognition and ElevenLabs TTS (Voice ID: ZEvjs17jNQ2fH5FxAat2)
 * Permanently configured in application logic
 */

export const ELEVENLABS_VOICE_ID = 'ZEvjs17jNQ2fH5FxAat2' as const;

class VoiceService {
  private recognition: any = null;
  public isListening: boolean = false;
  public isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private activeAudioUrl: string | null = null;
  public voiceEnabled: boolean = true;
  public readonly elevenLabsVoiceId: string = ELEVENLABS_VOICE_ID;
  public ttsEngine: 'elevenlabs' | 'webspeech' = 'elevenlabs';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'hi-IN'; // Default to Hindi
      }
    }
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition is not supported in this browser.'));
      return;
    }

    try {
      this.isListening = true;
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  async speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (!this.voiceEnabled) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    // Clean any mobile action codes and symbols from speech
    const cleanSpeech = text
      .replace(/ACTION_[A-Z0-9_]+/g, '')
      .replace(/[*_#`~[\]]/g, '')
      .trim();

    if (!cleanSpeech) {
      if (onEnd) onEnd();
      return;
    }

    // Try ElevenLabs TTS first (Permanent Voice ID: ZEvjs17jNQ2fH5FxAat2)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanSpeech,
          voiceId: ELEVENLABS_VOICE_ID,
        }),
      });

      const contentType = response.headers.get('Content-Type') || '';

      if (response.ok && contentType.includes('audio/mpeg')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        this.activeAudioUrl = audioUrl;

        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onplay = () => {
          this.isSpeaking = true;
          this.ttsEngine = 'elevenlabs';
          if (onStart) onStart();
        };

        audio.onended = () => {
          this.cleanupAudio();
          if (onEnd) onEnd();
        };

        audio.onerror = () => {
          this.cleanupAudio();
          // Fall back to Web Speech
          this.speakWebSpeech(cleanSpeech, onStart, onEnd);
        };

        await audio.play();
        return;
      }
    } catch {
      // Network or API failure -> proceed to fallback
    }

    // Fallback to browser SpeechSynthesis
    this.speakWebSpeech(cleanSpeech, onStart, onEnd);
  }

  private speakWebSpeech(text: string, onStart?: () => void, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.ttsEngine = 'webspeech';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Sweet, polite feminine tone

    // Try finding Hindi voice or sweet Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang.startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('lekha')
    );

    const indianVoice = voices.find(
      (v) =>
        v.lang === 'en-IN' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('heera')
    );

    const femaleVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('zira')
    );

    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = hindiVoice.lang;
    } else if (indianVoice) {
      utterance.voice = indianVoice;
      utterance.lang = indianVoice.lang;
    } else if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private cleanupAudio() {
    this.isSpeaking = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.activeAudioUrl) {
      URL.revokeObjectURL(this.activeAudioUrl);
      this.activeAudioUrl = null;
    }
  }

  stopSpeaking() {
    this.cleanupAudio();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const voice = new VoiceService();
