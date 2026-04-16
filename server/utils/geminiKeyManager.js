require('dotenv').config();

class GeminiKeyManager {
    constructor() {
        this.keys = this.loadKeys();
        this.currentIndex = 0;
    }

    loadKeys() {
        const rawKeys = process.env.GEMINI_KEYS || "";
        
        // Try parsing as JSON array first
        try {
            const parsed = JSON.parse(rawKeys);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            // Not a JSON array, fall back to comma-separated string
        }

        // Split by comma and filter out empty strings
        return rawKeys.split(',').map(k => k.trim()).filter(k => k !== "");
    }

    getNextKey() {
        if (this.keys.length === 0) {
            console.warn("No Gemini keys found in environment variables.");
            return null;
        }
        
        const key = this.keys[this.currentIndex];
        
        // Log current key being used (masked for security)
        const maskedKey = key.substring(0, 6) + "..." + key.substring(key.length - 4);
        console.log(`Using Gemini API Key [Index: ${this.currentIndex}]: ${maskedKey}`);

        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    }

    getKeyCount() {
        return this.keys.length;
    }
}

module.exports = new GeminiKeyManager();
