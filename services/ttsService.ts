/**
 * ─────────────────────────────────────────────────────────────────────────────
 * VERDIX CONSULTANT TTS SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Premium Text-to-Speech for VERDIX Consultant OS.
 *
 * Strategy (in priority order):
 *   1. OpenAI TTS-HD via server route (/api/ai/tts) - consistent, warm, human
 *      voice (nova) regardless of client OS or browser.
 *   2. Browser Web Speech API - falls back if server is unavailable or returns
 *      an error. Picks the best available English voice.
 *
 * Voice preference persists to localStorage ('bw_voice': 'on'|'off').
 * Volume-normalised output (audio element + Web Speech both at full volume).
 *
 * Usage:
 *   ttsService.speak(text)      - speak a string (strips markdown)
 *   ttsService.stop()           - cancel any playing audio
 *   ttsService.setEnabled(bool) - toggle on/off (persisted)
 *   ttsService.isEnabled()      - check current state
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TTS_SERVER_ENDPOINT = '/api/ai/tts';

// Voice preference names tried in order for browser fallback
const PREFERRED_BROWSER_VOICES = [
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Aria Online (Natural)',
  'Samantha',
  'Karen',
  'Daniel',
  'Moira',
  'Fiona',
];

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/•\s/g, '')
    .trim();
}

function pickBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  for (const name of PREFERRED_BROWSER_VOICES) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
    if (v) return v;
  }
  return voices.find(v => v.lang.startsWith('en')) ?? null;
}

class TTSService {
  private _enabled: boolean;
  private _usePremium = true;  // disabled after first server failure this session
  private _audio: HTMLAudioElement | null = null;
  private _audioUrl: string | null = null;

  constructor() {
    this._enabled =
      typeof window !== 'undefined'
        ? localStorage.getItem('bw_voice') !== 'off'
        : true;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  setEnabled(val: boolean): void {
    this._enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bw_voice', val ? 'on' : 'off');
    }
    if (!val) this.stop();
  }

  /**
   * Returns the per-character delay (ms) that makes TypewriterText
   * finish at roughly the same time as the TTS voice finishes speaking.
   *
   * OpenAI nova ≈ 190 WPM, browser Web Speech at rate 0.93 ≈ 160 WPM.
   * Average word ≈ 5.5 chars (including trailing space).
   */
  getTypingSpeedMs(): number {
    const wpm = this._usePremium ? 190 : 160;
    const charsPerSec = (wpm * 5.5) / 60;
    return Math.round(1000 / charsPerSec);   // ≈ 53 ms (premium) or ≈ 68 ms (browser)
  }

  async speak(text: string): Promise<void> {
    if (!this._enabled) return;
    const clean = stripMarkdown(text);
    if (!clean) return;

    this.stop();

    if (this._usePremium) {
      try {
        await this._speakPremium(clean);
        return;
      } catch (err) {
        // Server unavailable - fall back to browser for this session
        console.warn('[TTS] Premium unavailable, switching to browser Speech API', err);
        this._usePremium = false;
      }
    }

    this._speakBrowser(clean);
  }

  stop(): void {
    if (this._audio) {
      this._audio.pause();
      this._audio.src = '';
      this._audio = null;
    }
    if (this._audioUrl) {
      URL.revokeObjectURL(this._audioUrl);
      this._audioUrl = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  private async _speakPremium(text: string): Promise<void> {
    const response = await fetch(TTS_SERVER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 4096) }),
    });

    if (!response.ok) {
      throw new Error(`TTS server returned ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    this._audioUrl = url;

    const audio = new Audio(url);
    audio.volume = 1;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      this._audioUrl = null;
      this._audio = null;
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      this._audioUrl = null;
      this._audio = null;
    };

    this._audio = audio;
    await audio.play();
  }

  private _speakBrowser(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickBrowserVoice();
    if (voice) utter.voice = voice;
    utter.rate = 0.93;
    utter.pitch = 1.02;
    utter.volume = 1;

    window.speechSynthesis.speak(utter);
  }
}

export const ttsService = new TTSService();
