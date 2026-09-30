/**
 * Text-to-Speech service using Web Speech API (window.speechSynthesis)
 */

export function speakText(text) {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis is not supported in this browser.');
        return false;
    }

    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        window.speechSynthesis.speak(utterance);
        return true;
    } catch (error) {
        console.error('Speech synthesis error:', error);
        return false;
    }
}
