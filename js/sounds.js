/* ============================================
   HABBI3 STREAM ALERTS - SOUND SYNTHESIZER
   Web Audio API for Epic Alert Sounds
   ============================================ */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterVolume = 0.6;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 Sound system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    // Ensure audio context is running
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // ============================================
    // FOLLOW SOUND - Quick melodic chime
    // ============================================
    playFollow() {
        this.init();
        this.resume();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Two-note ascending chime
        this.playTone(880, now, 0.15, 'sine', 0.3);      // A5
        this.playTone(1318.5, now + 0.1, 0.2, 'sine', 0.4); // E6
        
        // Sparkle overlay
        this.playTone(2637, now + 0.05, 0.1, 'sine', 0.15);  // E7 sparkle
    }

    // ============================================
    // SUBSCRIPTION SOUND - Triumphant fanfare
    // ============================================
    playSubscription() {
        this.init();
        this.resume();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Rising triumphant chord
        this.playTone(523.25, now, 0.3, 'sine', 0.35);      // C5
        this.playTone(659.25, now + 0.08, 0.3, 'sine', 0.35); // E5
        this.playTone(783.99, now + 0.16, 0.35, 'sine', 0.4); // G5
        this.playTone(1046.5, now + 0.24, 0.4, 'sine', 0.45); // C6
        
        // Shimmer effect
        this.playTone(2093, now + 0.2, 0.15, 'sine', 0.12);
        this.playTone(2637, now + 0.25, 0.15, 'sine', 0.1);
        
        // Sub bass punch
        this.playTone(65.41, now, 0.2, 'sine', 0.5);  // C2
    }

    // ============================================
    // DONATION SOUND - Epic impact + melody
    // ============================================
    playDonation() {
        this.init();
        this.resume();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Epic impact
        this.playNoise(now, 0.08, 0.6);  // Initial hit
        this.playTone(55, now, 0.3, 'sine', 0.7);  // Deep bass drop
        this.playTone(110, now, 0.25, 'sine', 0.5);
        
        // Rising power chord
        this.playTone(329.63, now + 0.1, 0.4, 'sawtooth', 0.25);  // E4
        this.playTone(415.30, now + 0.1, 0.4, 'sawtooth', 0.25);  // G#4
        this.playTone(493.88, now + 0.1, 0.4, 'sawtooth', 0.25);  // B4
        
        // Triumphant melody
        this.playTone(659.25, now + 0.2, 0.25, 'sine', 0.4);  // E5
        this.playTone(783.99, now + 0.35, 0.25, 'sine', 0.4); // G5
        this.playTone(987.77, now + 0.5, 0.5, 'sine', 0.5);   // B5
        
        // Sparkle cascade
        for (let i = 0; i < 6; i++) {
            const freq = 1500 + Math.random() * 2000;
            this.playTone(freq, now + 0.3 + i * 0.05, 0.1, 'sine', 0.08);
        }
        
        // Reverb tail simulation
        this.playTone(987.77, now + 0.7, 0.8, 'sine', 0.15);
        this.playTone(659.25, now + 0.75, 0.7, 'sine', 0.1);
    }

    // ============================================
    // BITS SOUND - Coin cascade + magic
    // ============================================
    playBits() {
        this.init();
        this.resume();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Coin sounds - descending then ascending
        const coinFreqs = [2200, 2000, 1800, 2000, 2200, 2400, 2800];
        coinFreqs.forEach((freq, i) => {
            this.playTone(freq, now + i * 0.06, 0.08, 'square', 0.15);
        });
        
        // Magic shimmer
        this.playTone(1396.91, now + 0.2, 0.3, 'sine', 0.3);  // F6
        this.playTone(1760, now + 0.3, 0.35, 'sine', 0.35);   // A6
        this.playTone(2093, now + 0.4, 0.4, 'sine', 0.4);     // C7
        
        // Sparkle overlay
        for (let i = 0; i < 8; i++) {
            const freq = 2000 + Math.random() * 2500;
            this.playTone(freq, now + 0.2 + i * 0.04, 0.06, 'sine', 0.1);
        }
        
        // Sub punch
        this.playTone(80, now + 0.1, 0.15, 'sine', 0.4);
    }

    // ============================================
    // RAID SOUND - War horn + army march
    // ============================================
    playRaid() {
        this.init();
        this.resume();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // War horn - deep brass
        this.playTone(146.83, now, 0.6, 'sawtooth', 0.35);     // D3
        this.playTone(220, now, 0.6, 'sawtooth', 0.3);         // A3
        this.playTone(293.66, now + 0.05, 0.55, 'sawtooth', 0.25); // D4
        
        // Horn rise
        this.playTone(293.66, now + 0.4, 0.3, 'sawtooth', 0.3);  // D4
        this.playTone(369.99, now + 0.5, 0.3, 'sawtooth', 0.35); // F#4
        this.playTone(440, now + 0.6, 0.5, 'sawtooth', 0.4);     // A4
        
        // Impact drums
        this.playNoise(now + 0.1, 0.1, 0.5);
        this.playTone(60, now + 0.1, 0.2, 'sine', 0.6);  // Kick
        this.playNoise(now + 0.35, 0.08, 0.35);
        this.playTone(55, now + 0.35, 0.15, 'sine', 0.5);
        
        // Victory sparkles
        for (let i = 0; i < 5; i++) {
            this.playTone(1200 + i * 200, now + 0.8 + i * 0.05, 0.1, 'sine', 0.15);
        }
    }

    // ============================================
    // HELPER: Play a tone
    // ============================================
    playTone(frequency, startTime, duration, type = 'sine', volume = 0.3) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * this.masterVolume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    }

    // ============================================
    // HELPER: Play noise burst (for impacts)
    // ============================================
    playNoise(startTime, duration, volume = 0.3) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, startTime);
        filter.frequency.exponentialRampToValueAtTime(200, startTime + duration);
        
        gain.gain.setValueAtTime(volume * this.masterVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        noise.start(startTime);
        noise.stop(startTime + duration);
    }

    // ============================================
    // Play sound by type
    // ============================================
    play(type) {
        switch (type) {
            case 'follow':
                this.playFollow();
                break;
            case 'subscription':
            case 'resub':
                this.playSubscription();
                break;
            case 'donation':
                this.playDonation();
                break;
            case 'bits':
                this.playBits();
                break;
            case 'raid':
            case 'host':
                this.playRaid();
                break;
            default:
                this.playFollow();
        }
    }
}

// Export
window.SoundManager = SoundManager;
