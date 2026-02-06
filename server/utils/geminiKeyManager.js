require('dotenv').config();

class GeminiKeyManager {
    constructor() {
        try {
            this.keys = JSON.parse(process.env.GEMINI_KEYS || "[]");
        } catch (e) {
            console.error("Failed to parse GEMINI_KEYS from .env. Ensure it is a valid JSON array.");
            this.keys = [];
        }
        this.currentIndex = 0;
    }

    getNextKey() {
        if (this.keys.length === 0) {
            console.warn("No Gemini keys found in environment variables.");
            return null;
        }
        
        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    }
}

module.exports = new GeminiKeyManager();
