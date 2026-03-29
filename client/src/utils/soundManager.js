class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.isInitialized = false;
    this.volume = 0.6;
    this.isMuted = false;
    this.engineOscillators = [];
    this.engineGain = null;
    this.isEnginePlaying = false;
  }

  async init() {
    if (this.isInitialized) return true;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.engineGain = this.audioContext.createGain();
      this.engineGain.connect(this.audioContext.destination);
      this.engineGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      
      this.isInitialized = true;
      console.log('✅ Audio context initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return false;
    }
  }
  
  async startEngineSound(multiplier = 1) {
    console.log('🔊 startEngineSound called, isInitialized:', this.isInitialized, 'isMuted:', this.isMuted, 'isEnginePlaying:', this.isEnginePlaying);
    if (!this.isInitialized || this.isMuted || this.isEnginePlaying) return;
    
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isEnginePlaying = true;
      
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80 + (multiplier * 10), this.audioContext.currentTime);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120 + (multiplier * 15), this.audioContext.currentTime);
      
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(5, this.audioContext.currentTime);
      lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.engineGain);
      
      this.engineGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.5);
      
      osc1.start();
      osc2.start();
      lfo.start();
      
      this.engineOscillators = [osc1, osc2, lfo];
      console.log('Engine sound started');
    } catch (error) {
      console.error('Error starting engine sound:', error);
    }
  }
  
  async updateEngineSound(multiplier) {
    if (!this.isEnginePlaying || !this.engineOscillators.length) return;
    
    try {
      const baseFreq = 80 + (multiplier * 15);
      this.engineOscillators[0].frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
      this.engineOscillators[1].frequency.setValueAtTime(baseFreq * 1.5, this.audioContext.currentTime);
    } catch (error) {
      console.error('Error updating engine sound:', error);
    }
  }
  
  async stopEngineSound() {
    if (!this.isEnginePlaying) return;
    
    try {
      this.engineGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
      
      this.engineOscillators.forEach(osc => {
        try {
          osc.stop(this.audioContext.currentTime + 0.3);
        } catch (e) {}
      });
      
      this.engineOscillators = [];
      this.isEnginePlaying = false;
      console.log('Engine sound stopped');
    } catch (error) {
      console.error('Error stopping engine sound:', error);
    }
  }

  async playPlaneSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      // Create oscillator for engine sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Engine sound: start low, increase frequency as plane rises
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 2);
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 1);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 2);
      
      return oscillator;
    } catch (error) {
      console.error('Error playing plane sound:', error);
    }
  }

  async playTakeoffSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      // Rising tone for takeoff
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing takeoff sound:', error);
    }
  }

  async playCrashSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      // Crash sound with noise and descending tone
      const bufferSize = this.audioContext.sampleRate * 0.5;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      noise.start();
      noise.stop(this.audioContext.currentTime + 0.5);
      
      // Add descending tone
      const oscillator = this.audioContext.createOscillator();
      const oscGain = this.audioContext.createGain();
      
      oscillator.connect(oscGain);
      oscGain.connect(this.audioContext.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
      
      oscGain.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing crash sound:', error);
    }
  }

  async playCashoutSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      // Success sound - rising arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.3);
        }, index * 100);
      });
    } catch (error) {
      console.error('Error playing cashout sound:', error);
    }
  }

  async playBetSound() {
    if (!this.isInitialized || this.isMuted) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Error playing bet sound:', error);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
  }
}

// Singleton instance
const soundManager = new SoundManager();

// React hook for using sound manager
export const useSound = () => {
  const init = () => soundManager.init();
  const playPlaneSound = () => soundManager.playPlaneSound();
  const startEngineSound = (multiplier) => soundManager.startEngineSound(multiplier);
  const updateEngineSound = (multiplier) => soundManager.updateEngineSound(multiplier);
  const stopEngineSound = () => soundManager.stopEngineSound();
  const playTakeoffSound = () => soundManager.playTakeoffSound();
  const playCrashSound = () => soundManager.playCrashSound();
  const playCashoutSound = () => soundManager.playCashoutSound();
  const playBetSound = () => soundManager.playBetSound();
  const setVolume = (volume) => soundManager.setVolume(volume);
  const toggleMute = () => soundManager.toggleMute();
  const setMuted = (muted) => soundManager.setMuted(muted);
  
  return {
    init,
    playPlaneSound,
    startEngineSound,
    updateEngineSound,
    stopEngineSound,
    playTakeoffSound,
    playCrashSound,
    playCashoutSound,
    playBetSound,
    setVolume,
    toggleMute,
    setMuted,
    isMuted: () => soundManager.isMuted,
    getVolume: () => soundManager.volume
  };
};

export default soundManager;