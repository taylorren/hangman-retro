/**
 * Audio service for game sound effects
 * Provides retro-style sound feedback for user interactions
 */

export class AudioService {
  private audioContext: AudioContext | null = null
  private isEnabled: boolean = true

  constructor() {
    // Initialize audio context when first needed
    this.initAudioContext()
  }

  private initAudioContext() {
    try {
      // Create audio context (with fallback for older browsers)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Audio context not supported:', error)
      this.isEnabled = false
    }
  }

  /**
   * Play a beep sound with specified frequency and duration
   */
  private playBeep(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.audioContext || !this.isEnabled) return

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      // Create oscillator for the beep sound
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Configure oscillator
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = 'square' // Retro square wave sound

      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

      // Play the sound
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.warn('Error playing beep:', error)
    }
  }

  /**
   * Play sound for correct letter guess
   */
  playCorrectGuess() {
    // Higher pitched, pleasant sound for correct guesses
    this.playBeep(800, 0.2, 0.15)
    
    // Add a second harmonic for richness
    setTimeout(() => {
      this.playBeep(1200, 0.15, 0.1)
    }, 50)
  }

  /**
   * Play sound for incorrect letter guess
   */
  playIncorrectGuess() {
    // Lower pitched, more somber sound for incorrect guesses
    this.playBeep(200, 0.3, 0.2)
  }

  /**
   * Play sound for letter selection (key press)
   */
  playLetterSelect() {
    // Quick, subtle click sound for letter selection
    this.playBeep(600, 0.1, 0.08)
  }

  /**
   * Play sound for game victory
   */
  playVictory() {
    // Victory fanfare - ascending notes
    const notes = [523, 659, 784, 1047] // C, E, G, C (one octave higher)
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.playBeep(frequency, 0.4, 0.2)
      }, index * 150)
    })
  }

  /**
   * Play sound for game defeat
   */
  playDefeat() {
    // Defeat sound - descending notes
    const notes = [400, 350, 300, 250] // Descending frequencies
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.playBeep(frequency, 0.3, 0.15)
      }, index * 200)
    })
  }

  /**
   * Play sound for button clicks
   */
  playButtonClick() {
    // Quick button click sound
    this.playBeep(800, 0.05, 0.1)
  }

  /**
   * Enable or disable audio
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null
  }
}

// Singleton instance
let audioServiceInstance: AudioService | null = null

/**
 * Get the audio service instance
 */
export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService()
  }
  return audioServiceInstance
}