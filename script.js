// Zhuyin Flashcards Application
class ZhuyinFlashcards {
    constructor() {
        this.data = null;
        this.currentCards = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.audioBasePath = 'zhuyin_audios/';
        this.currentAudio = null;
        
        // Settings
        this.settings = {
            showPinyin: true
        };
        
        // Initialize the application
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.setupCards();
            this.hideLoading();
            this.loadSettings();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError();
        }
    }

    async loadData() {
        try {
            const response = await fetch('zhuyin_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading JSON data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Card navigation
        document.getElementById('prevCard').addEventListener('click', () => this.previousCard());
        document.getElementById('nextCard').addEventListener('click', () => this.nextCard());
        
        // Card flipping
        const flashcard = document.getElementById('flashcard');
        flashcard.addEventListener('click', (e) => {
            // Only flip if clicked area is not a button
            if (!e.target.closest('button')) {
                this.flipCard();
            }
        });
        
        // Flip button on back
        const flipBtn = document.querySelector('.flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.flipCard();
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterCards(e.target.dataset.filter));
        });
        
        // Action buttons
        document.getElementById('shuffleCards').addEventListener('click', () => this.shuffleCards());
        
        // Audio button - Front
        const zhuyinSoundBtn = document.getElementById('playZhuyinSound');
        if (zhuyinSoundBtn) {
            zhuyinSoundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playZhuyinSound();
            });
        }
        
        // Audio buttons - Back (will be set up when cards are displayed)
        this.setupBackAudioButtons();
        
        // Settings
        document.getElementById('settingsToggle').addEventListener('click', () => this.toggleSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('showPinyin').addEventListener('change', (e) => {
            this.settings.showPinyin = e.target.checked;
            this.updatePinyinVisibility();
            this.saveSettings();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            const settingsPanel = document.getElementById('settingsPanel');
            const settingsToggle = document.getElementById('settingsToggle');
            
            if (!settingsPanel.contains(e.target) && 
                !settingsToggle.contains(e.target)) {
                this.closeSettings();
            }
        });
    }

    setupBackAudioButtons() {
        // These will be set up each time the back content is updated
        const playWordBtn = document.getElementById('playWord');
        const playSentenceBtn = document.getElementById('playSentence');
        
        if (playWordBtn) {
            playWordBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playWordAudio();
            });
        }
        
        if (playSentenceBtn) {
            playSentenceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSentenceAudio();
            });
        }
    }

    setupCards() {
        this.currentCards = this.getAllCards();
        this.updateDisplay();
        this.updateProgress();
    }

    getAllCards() {
        const cards = [];
        
        // Add consonants
        if (this.data.zhuyin_system.consonants) {
            this.data.zhuyin_system.consonants.forEach(item => {
                cards.push({
                    type: 'consonants',
                    ...item
                });
            });
        }
        
        // Add vowels
        if (this.data.zhuyin_system.vowels) {
            this.data.zhuyin_system.vowels.forEach(item => {
                cards.push({
                    type: 'vowels',
                    ...item
                });
            });
        }
        
        // Add tones
        if (this.data.zhuyin_system.tones) {
            this.data.zhuyin_system.tones.forEach(item => {
                cards.push({
                    type: 'tones',
                    zhuyin: item.mark,
                    pinyin: `Tono ${item.tone_number}`,
                    example_word: item.example,
                    example_sentence: {
                        characters: `Ejemplo del ${item.description.toLowerCase()}`,
                        words: [item.example]
                    }
                });
            });
        }
        
        return cards;
    }

    filterCards(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Filter cards
        if (filter === 'all') {
            this.currentCards = this.getAllCards();
        } else {
            this.currentCards = this.getAllCards().filter(card => card.type === filter);
        }
        
        this.currentIndex = 0;
        this.isFlipped = false;
        this.updateDisplay();
        this.updateProgress();
    }

    shuffleCards() {
        for (let i = this.currentCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentCards[i], this.currentCards[j]] = [this.currentCards[j], this.currentCards[i]];
        }
        this.currentIndex = 0;
        this.isFlipped = false;
        this.updateDisplay();
        this.updateProgress();
    }

    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.isFlipped = false;
            this.updateDisplay();
            this.updateProgress();
        }
    }

    nextCard() {
        if (this.currentIndex < this.currentCards.length - 1) {
            this.currentIndex++;
            this.isFlipped = false;
            this.updateDisplay();
            this.updateProgress();
        }
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.getElementById('flashcard');
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
            this.updateBackContent();
        } else {
            flashcard.classList.remove('flipped');
        }
    }

    updateDisplay() {
        if (!this.currentCards.length) return;
        
        const currentCard = this.currentCards[this.currentIndex];
        
        // Update front content
        document.getElementById('zhuyinChar').textContent = currentCard.zhuyin;
        document.getElementById('pinyinEquiv').textContent = currentCard.pinyin;
        
        // Update counter
        document.getElementById('currentCard').textContent = this.currentIndex + 1;
        document.getElementById('totalCards').textContent = this.currentCards.length;
        
        // Reset flip state
        document.getElementById('flashcard').classList.remove('flipped');
        this.isFlipped = false;
        
        // Update pinyin visibility
        this.updatePinyinVisibility();
    }

    updateBackContent() {
        const currentCard = this.currentCards[this.currentIndex];
        
        if (currentCard.example_word) {
            document.getElementById('exampleChars').textContent = currentCard.example_word.characters;
            document.getElementById('examplePinyin').textContent = currentCard.example_word.pinyin;
            document.getElementById('exampleMeaning').textContent = currentCard.example_word.meaning;
            
            // Show zhuyin typing if available
            const zhuyinTyping = document.getElementById('exampleZhuyin');
            if (currentCard.example_word.zhuyin_typing) {
                zhuyinTyping.textContent = currentCard.example_word.zhuyin_typing;
                zhuyinTyping.style.display = 'block';
            } else {
                zhuyinTyping.style.display = 'none';
            }
        }
        
        if (currentCard.example_sentence) {
            document.getElementById('sentenceChars').textContent = currentCard.example_sentence.characters;
            this.updateSentenceTranslation(currentCard.example_sentence);
            this.updateWordBreakdown(currentCard.example_sentence.words);
        }
        
        // Re-setup audio buttons for the back
        this.setupBackAudioButtons();
    }

    updateSentenceTranslation(sentence) {
        if (sentence.words) {
            const translation = sentence.words.map(word => word.meaning).join(' ');
            document.getElementById('sentenceTranslation').textContent = translation;
        }
    }

    updateWordBreakdown(words) {
        const container = document.getElementById('wordBreakdown');
        container.innerHTML = '';
        
        if (words) {
            words.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                wordItem.innerHTML = `
                    <div>
                        <span class="word-chars">${word.characters}</span>
                        <span class="word-pinyin">${word.pinyin}</span>
                    </div>
                    <div class="word-meaning">${word.meaning}</div>
                    <button class="word-audio" data-chars="${word.characters}" data-pinyin="${word.pinyin}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                `;
                
                // Add event listener with stopPropagation
                const audioBtn = wordItem.querySelector('.word-audio');
                audioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.playIndividualWordAudio(word.characters, word.pinyin);
                });
                
                container.appendChild(wordItem);
            });
        }
    }

    updatePinyinVisibility() {
        const pinyinElement = document.querySelector('.pinyin-equivalent');
        if (pinyinElement) {
            pinyinElement.style.display = this.settings.showPinyin ? 'block' : 'none';
        }
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.currentCards.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    // Audio Methods
    playZhuyinSound() {
        const currentCard = this.currentCards[this.currentIndex];
        const audioPath = this.getZhuyinSoundPath(currentCard);
        this.playAudio(audioPath, 'playZhuyinSound');
    }

    playWordAudio() {
        const currentCard = this.currentCards[this.currentIndex];
        if (currentCard.example_word) {
            const audioPath = this.getWordAudioPath(currentCard);
            this.playAudio(audioPath, 'playWord');
        }
    }

    playSentenceAudio() {
        const currentCard = this.currentCards[this.currentIndex];
        if (currentCard.example_sentence) {
            const audioPath = this.getSentenceAudioPath(currentCard);
            this.playAudio(audioPath, 'playSentence');
        }
    }

    playIndividualWordAudio(characters, pinyin) {
        const audioPath = `${this.audioBasePath}individual_words/${this.sanitizeFilename(characters)}_${pinyin}.mp3`;
        this.playAudio(audioPath);
    }

    getZhuyinSoundPath(card) {
        // For individual zhuyin character sound
        let pinyinClean = card.pinyin.split(' ')[0]; // In case it has spaces
        return `${this.audioBasePath}zhuyin_sounds/${this.sanitizeFilename(card.zhuyin)}_${pinyinClean}.mp3`;
    }

    getWordAudioPath(card) {
        const word = card.example_word;
        const category = card.type === 'tones' ? 'tones/examples' : `${card.type}/words`;
        
        if (card.type === 'tones') {
            return `${this.audioBasePath}${category}/tono_${card.example_word.tone_number || '0'}_${this.sanitizeFilename(word.characters)}_${word.pinyin}.mp3`;
        } else {
            return `${this.audioBasePath}${category}/${this.sanitizeFilename(card.zhuyin)}_${this.sanitizeFilename(word.characters)}_${word.pinyin}.mp3`;
        }
    }

    getSentenceAudioPath(card) {
        const sentence = card.example_sentence;
        const category = card.type === 'tones' ? 'tones/examples' : `${card.type}/sentences`;
        const truncatedSentence = sentence.characters.substring(0, 10);
        return `${this.audioBasePath}${category}/${this.sanitizeFilename(card.zhuyin)}_${this.sanitizeFilename(truncatedSentence)}.mp3`;
    }

    async playAudio(audioPath, buttonId = null) {
        try {
            // Stop any currently playing audio
            this.stopCurrentAudio();
            
            // Create new audio instance
            this.currentAudio = new Audio(audioPath);
            
            // Add button visual feedback
            if (buttonId) {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.classList.add('playing');
                    
                    this.currentAudio.addEventListener('ended', () => {
                        button.classList.remove('playing');
                    });
                    
                    this.currentAudio.addEventListener('error', () => {
                        button.classList.remove('playing');
                        console.warn(`Audio file not found: ${audioPath}`);
                    });
                }
            }
            
            await this.currentAudio.play();
        } catch (error) {
            console.warn(`Could not play audio: ${audioPath}`, error);
            if (buttonId) {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.classList.remove('playing');
                }
            }
        }
    }

    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        
        // Remove playing class from all audio buttons
        document.querySelectorAll('.audio-btn.playing, .front-audio-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
        });
    }

    sanitizeFilename(text) {
        return text.replace(/[<>:"/\\|?*]/g, '').replace(/[\s.,!?;:，。！？；：]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    // Settings management
    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.toggle('open');
    }

    closeSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.remove('open');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('zhuyinFlashcardsSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Error loading settings:', e);
        }
        
        // Apply loaded settings
        const showPinyinCheckbox = document.getElementById('showPinyin');
        if (showPinyinCheckbox) {
            showPinyinCheckbox.checked = this.settings.showPinyin;
        }
        
        this.updatePinyinVisibility();
    }

    saveSettings() {
        try {
            localStorage.setItem('zhuyinFlashcardsSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Error saving settings:', e);
        }
    }

    // Keyboard navigation
    handleKeyboard(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousCard();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextCard();
                break;
            case ' ':
                event.preventDefault();
                this.flipCard();
                break;
            case 'Enter':
                event.preventDefault();
                if (this.isFlipped) {
                    this.playWordAudio();
                } else {
                    this.playZhuyinSound();
                }
                break;
        }
    }

    // Utility methods
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError() {
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loading) {
            loading.style.display = 'none';
        }
        
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ZhuyinFlashcards();
});

// Add touch gestures for mobile devices
class TouchGestureHandler {
    constructor(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;
        this.startX = 0;
        this.startY = 0;
        this.threshold = 50; // Minimum distance for swipe
        
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }
    
    handleTouchStart(event) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    }
    
    handleTouchEnd(event) {
        if (!this.startX || !this.startY) return;
        
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        
        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        
        // Check if horizontal swipe is dominant
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.threshold) {
            if (deltaX > 0) {
                this.callbacks.swipeRight();
            } else {
                this.callbacks.swipeLeft();
            }
        }
        
        // Reset
        this.startX = 0;
        this.startY = 0;
    }
}

// Initialize touch gestures when app is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const flashcard = document.getElementById('flashcard');
        if (flashcard && window.app) {
            new TouchGestureHandler(flashcard, {
                swipeLeft: () => window.app.nextCard(),
                swipeRight: () => window.app.previousCard()
            });
        }
    }, 1000);
});