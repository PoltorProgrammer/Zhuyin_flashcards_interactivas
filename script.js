// Zhuyin Flashcards Application
class ZhuyinFlashcards {
    constructor() {
        this.data = null;
        this.currentCards = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.audioBasePath = 'zhuyin_audios/';
        this.currentAudio = null;
        
        // Expanded overlay state
        this.expandedCard = null;
        this.isExpandedFlipped = false;
        
        // Settings
        this.settings = {
            showPinyin: true,
            overviewMode: false
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
        
        // Settings event listeners
        document.getElementById('showPinyin').addEventListener('change', (e) => {
            this.settings.showPinyin = e.target.checked;
            this.updatePinyinVisibility();
            this.saveSettings();
        });
        
        document.getElementById('overviewMode').addEventListener('change', (e) => {
            this.settings.overviewMode = e.target.checked;
            this.toggleOverviewMode();
            this.saveSettings();
        });
        
        // Expanded overlay event listeners
        this.setupExpandedOverlayEventListeners();
        
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

    setupExpandedOverlayEventListeners() {
        // Close button
        const expandedCloseBtn = document.getElementById('expandedCloseBtn');
        if (expandedCloseBtn) {
            expandedCloseBtn.addEventListener('click', () => this.closeExpandedOverlay());
        }
        
        // Expanded flashcard flip
        const expandedFlashcard = document.getElementById('expandedFlashcard');
        if (expandedFlashcard) {
            expandedFlashcard.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.flipExpandedCard();
                }
            });
        }
        
        // Expanded flip button
        const expandedFlipBtn = document.getElementById('expandedFlipBtn');
        if (expandedFlipBtn) {
            expandedFlipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.flipExpandedCard();
            });
        }
        
        // Expanded audio buttons
        const expandedPlayZhuyinSound = document.getElementById('expandedPlayZhuyinSound');
        if (expandedPlayZhuyinSound) {
            expandedPlayZhuyinSound.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playExpandedZhuyinSound();
            });
        }
        
        const expandedPlayWord = document.getElementById('expandedPlayWord');
        if (expandedPlayWord) {
            expandedPlayWord.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playExpandedWordAudio();
            });
        }
        
        const expandedPlaySentence = document.getElementById('expandedPlaySentence');
        if (expandedPlaySentence) {
            expandedPlaySentence.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playExpandedSentenceAudio();
            });
        }
        
        // Close overlay when clicking background
        const expandedOverlay = document.getElementById('expandedOverlay');
        if (expandedOverlay) {
            expandedOverlay.addEventListener('click', (e) => {
                if (e.target === expandedOverlay || e.target.classList.contains('expanded-overlay-background')) {
                    this.closeExpandedOverlay();
                }
            });
        }
        
        // Handle Escape key for closing overlay
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.expandedCard) {
                this.closeExpandedOverlay();
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
        if (this.settings.overviewMode) {
            this.updateOverviewDisplay();
        } else {
            this.updateDisplay();
            this.updateProgress();
        }
    }

    getAllCards() {
        const cards = [];
        
        // Add consonants
        if (this.data.zhuyin_system.consonants) {
            this.data.zhuyin_system.consonants.forEach(item => {
                cards.push({
                    type: 'consonants',
                    zhuyin: item.zhuyin,
                    pinyin: item.pinyin,
                    example_word: item.example_word,
                    example_sentence: item.example_sentence,
                    note: item.note,
                    mnemotecnia: item.mnemotecnia
                });
            });
        }
        
        // Add vowels
        if (this.data.zhuyin_system.vowels) {
            this.data.zhuyin_system.vowels.forEach(item => {
                cards.push({
                    type: 'vowels',
                    zhuyin: item.zhuyin,
                    pinyin: item.pinyin,
                    example_word: item.example_word,
                    example_sentence: item.example_sentence,
                    note: item.note,
                    mnemotecnia: item.mnemotecnia
                });
            });
        }
        
        // Add tones - CORRECTED STRUCTURE
        if (this.data.zhuyin_system.tones) {
            this.data.zhuyin_system.tones.forEach(item => {
                cards.push({
                    type: 'tones',
                    // Use mark as the character to display
                    zhuyin: item.mark,
                    // Create descriptive pinyin equivalent
                    pinyin: `Tono ${item.tone_number}`,
                    // Map the tone example to example_word structure
                    example_word: {
                        characters: item.example.characters,
                        pinyin: item.example.pinyin,
                        meaning: item.example.meaning,
                        zhuyin_typing: item.example.zhuyin_typing
                    },
                    // Store tone-specific data
                    tone_number: item.tone_number,
                    tone_mark: item.mark,
                    description: item.description,
                    // No example_sentence for tones - will be handled differently
                    example_sentence: null,
                    // No notes/mnemotecnia for tones
                    note: null,
                    mnemotecnia: null
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
        
        if (this.settings.overviewMode) {
            this.updateOverviewDisplay();
        } else {
            this.updateDisplay();
            this.updateProgress();
        }
    }

    shuffleCards() {
        for (let i = this.currentCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentCards[i], this.currentCards[j]] = [this.currentCards[j], this.currentCards[i]];
        }
        this.currentIndex = 0;
        this.isFlipped = false;
        
        if (this.settings.overviewMode) {
            this.updateOverviewDisplay();
        } else {
            this.updateDisplay();
            this.updateProgress();
        }
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
        
        // Handle tone-specific front display
        const toneDescription = document.getElementById('toneDescription');
        const toneDescText = document.getElementById('toneDescText');
        
        if (currentCard.type === 'tones') {
            // Show tone description for tone cards
            if (toneDescription && toneDescText) {
                toneDescText.textContent = currentCard.description;
                toneDescription.style.display = 'block';
            }
        } else {
            // Hide tone description for non-tone cards
            if (toneDescription) {
                toneDescription.style.display = 'none';
            }
        }
        
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
        
        // Show/hide sections based on card type
        const wordSection = document.getElementById('wordSection');
        const sentenceSection = document.getElementById('sentenceSection');
        const breakdownSection = document.getElementById('breakdownSection');
        const notesSection = document.getElementById('notesSection');
        
        if (currentCard.type === 'tones') {
            // For tone cards, show only word example, hide notes
            if (wordSection) wordSection.style.display = 'block';
            if (sentenceSection) sentenceSection.style.display = 'none';
            if (breakdownSection) breakdownSection.style.display = 'none';
            if (notesSection) notesSection.style.display = 'none';
            
            // Update word example
            this.updateWordExample(currentCard);
        } else {
            // For consonant and vowel cards, show all sections including notes
            if (wordSection) wordSection.style.display = 'block';
            if (sentenceSection) sentenceSection.style.display = 'block';
            if (breakdownSection) breakdownSection.style.display = 'block';
            if (notesSection) notesSection.style.display = 'block';
            
            // Update word example
            this.updateWordExample(currentCard);
            
            // Update sentence example
            if (currentCard.example_sentence) {
                document.getElementById('sentenceChars').textContent = currentCard.example_sentence.characters;
                this.updateSentenceTranslation(currentCard.example_sentence);
                this.updateWordBreakdown(currentCard.example_sentence.words);
            }
            
            // Update notes and mnemotecnia
            this.updateNotesAndMnemotecnia(currentCard);
        }
        
        // Re-setup audio buttons for the back
        this.setupBackAudioButtons();
    }

    updateWordExample(card) {
        if (card.example_word) {
            document.getElementById('exampleChars').textContent = card.example_word.characters;
            document.getElementById('examplePinyin').textContent = card.example_word.pinyin;
            document.getElementById('exampleMeaning').textContent = card.example_word.meaning;
            
            // Show zhuyin typing if available
            const zhuyinTyping = document.getElementById('exampleZhuyin');
            if (card.example_word.zhuyin_typing) {
                zhuyinTyping.textContent = card.example_word.zhuyin_typing;
                zhuyinTyping.style.display = 'block';
            } else {
                zhuyinTyping.style.display = 'none';
            }
        }
    }

    updateSentenceTranslation(sentence) {
        // Use spanish_translation directly instead of concatenating meanings
        const sentenceTranslationElement = document.getElementById('sentenceTranslation');
        if (sentence.spanish_translation) {
            sentenceTranslationElement.textContent = sentence.spanish_translation;
        } else {
            // Fallback to concatenating meanings if spanish_translation is not available
            if (sentence.words) {
                const translation = sentence.words.map(word => word.meaning).join(' ');
                sentenceTranslationElement.textContent = translation;
            }
        }
    }

    updateWordBreakdown(words) {
        const container = document.getElementById('wordBreakdown');
        container.innerHTML = '';
        
        if (words) {
            words.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                
                // Build the word information display
                let wordInfoHtml = `
                    <div>
                        <span class="word-chars">${word.characters}</span>
                        <span class="word-pinyin">${word.pinyin}</span>
                `;
                
                // Add zhuyin_typing if available
                if (word.zhuyin_typing) {
                    wordInfoHtml += `<span class="word-zhuyin">${word.zhuyin_typing}</span>`;
                }
                
                wordInfoHtml += `
                    </div>
                    <div class="word-meaning">${word.meaning}</div>
                    <button class="word-audio" data-chars="${word.characters}" data-pinyin="${word.pinyin}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                `;
                
                wordItem.innerHTML = wordInfoHtml;
                
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

    updateNotesAndMnemotecnia(card) {
        const noteText = document.getElementById('noteText');
        const mnemotecniaText = document.getElementById('mnemotecniaText');
        
        // Update note content
        if (card.note && noteText) {
            noteText.innerHTML = this.processMarkdown(card.note);
        }
        
        // Update mnemotecnia content
        if (card.mnemotecnia && mnemotecniaText) {
            mnemotecniaText.innerHTML = this.processMarkdown(card.mnemotecnia);
        }
    }

    processMarkdown(text) {
        // Convert **bold** to <strong>bold</strong>
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    // Overview Mode Methods
    toggleOverviewMode() {
        const flashcardContainer = document.getElementById('flashcardContainer');
        const overviewContainer = document.getElementById('overviewContainer');
        const navigationControls = document.querySelector('.navigation-controls');
        const progressContainer = document.querySelector('.progress-container');
        
        if (this.settings.overviewMode) {
            // Show overview, hide individual flashcard
            flashcardContainer.style.display = 'none';
            overviewContainer.style.display = 'block';
            navigationControls.style.display = 'none';
            progressContainer.style.display = 'none';
            
            this.updateOverviewDisplay();
        } else {
            // Show individual flashcard, hide overview
            flashcardContainer.style.display = 'flex';
            overviewContainer.style.display = 'none';
            navigationControls.style.display = 'flex';
            progressContainer.style.display = 'block';
            
            this.updateDisplay();
            this.updateProgress();
        }
    }
    
    updateOverviewDisplay() {
        const overviewGrid = document.getElementById('overviewGrid');
        const overviewTitle = document.getElementById('overviewTitle');
        const overviewCount = document.getElementById('overviewCount');
        
        // Clear existing content
        overviewGrid.innerHTML = '';
        
        // Update title based on current filter
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const filterNames = {
            'all': 'Todos',
            'consonants': 'Consonantes', 
            'vowels': 'Vocales',
            'tones': 'Tonos'
        };
        
        overviewTitle.textContent = `Vista General - ${filterNames[activeFilter]}`;
        overviewCount.textContent = `${this.currentCards.length} elementos`;
        
        // Create mini-cards for each card
        this.currentCards.forEach((card, index) => {
            const miniCard = this.createMiniCard(card, index);
            overviewGrid.appendChild(miniCard);
        });
    }
    
    createMiniCard(card, index) {
        const miniCard = document.createElement('div');
        miniCard.className = 'mini-card';
        miniCard.dataset.index = index;
        
        // Create front face
        const frontFace = document.createElement('div');
        frontFace.className = 'mini-card-front';
        
        // Create expand button for front
        const frontExpandBtn = document.createElement('button');
        frontExpandBtn.className = 'mini-expand-btn';
        frontExpandBtn.innerHTML = '<i class="fas fa-expand"></i>';
        frontExpandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showExpandedOverlay(card);
        });
        frontFace.appendChild(frontExpandBtn);
        
        const zhuyinChar = document.createElement('div');
        zhuyinChar.className = 'mini-zhuyin';
        zhuyinChar.textContent = card.zhuyin;
        
        const pinyinEquiv = document.createElement('div');
        pinyinEquiv.className = 'mini-pinyin';
        pinyinEquiv.textContent = card.pinyin;
        pinyinEquiv.style.display = this.settings.showPinyin ? 'block' : 'none';
        
        // Tone description for tone cards
        if (card.type === 'tones') {
            const toneDesc = document.createElement('div');
            toneDesc.className = 'mini-tone-desc';
            toneDesc.textContent = card.description;
            frontFace.appendChild(toneDesc);
        }
        
        const audioBtn = document.createElement('button');
        audioBtn.className = 'mini-audio-btn';
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playMiniCardAudio(card);
        });
        
        frontFace.appendChild(zhuyinChar);
        frontFace.appendChild(pinyinEquiv);
        frontFace.appendChild(audioBtn);
        
        // Create back face
        const backFace = document.createElement('div');
        backFace.className = 'mini-card-back';
        
        // Create expand button for back
        const backExpandBtn = document.createElement('button');
        backExpandBtn.className = 'mini-expand-btn';
        backExpandBtn.innerHTML = '<i class="fas fa-expand"></i>';
        backExpandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showExpandedOverlay(card);
        });
        backFace.appendChild(backExpandBtn);
        
        if (card.example_word) {
            const wordChars = document.createElement('div');
            wordChars.className = 'mini-word-chars';
            wordChars.textContent = card.example_word.characters;
            
            const wordPinyin = document.createElement('div');
            wordPinyin.className = 'mini-word-pinyin';
            wordPinyin.textContent = card.example_word.pinyin;
            
            const wordMeaning = document.createElement('div');
            wordMeaning.className = 'mini-word-meaning';
            wordMeaning.textContent = card.example_word.meaning;
            
            backFace.appendChild(wordChars);
            backFace.appendChild(wordPinyin);
            backFace.appendChild(wordMeaning);
            
            // Add zhuyin typing if available
            if (card.example_word.zhuyin_typing) {
                const wordZhuyin = document.createElement('div');
                wordZhuyin.className = 'mini-zhuyin-typing';
                wordZhuyin.textContent = card.example_word.zhuyin_typing;
                backFace.appendChild(wordZhuyin);
            }
            
            const wordAudioBtn = document.createElement('button');
            wordAudioBtn.className = 'mini-audio-btn';
            wordAudioBtn.innerHTML = '<i class="fas fa-play"></i>';
            wordAudioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playMiniCardWordAudio(card);
            });
            
            backFace.appendChild(wordAudioBtn);
        }
        
        // Add both faces to mini-card
        miniCard.appendChild(frontFace);
        miniCard.appendChild(backFace);
        
        // Add flip functionality
        miniCard.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                miniCard.classList.toggle('flipped');
            }
        });
        
        return miniCard;
    }

    // Expanded overlay methods
    showExpandedOverlay(card) {
        this.expandedCard = card;
        this.isExpandedFlipped = false;
        
        const overlay = document.getElementById('expandedOverlay');
        const expandedFlashcard = document.getElementById('expandedFlashcard');
        
        // Reset flip state
        expandedFlashcard.classList.remove('flipped');
        
        // Update card content
        this.updateExpandedCard();
        
        // Show overlay
        overlay.style.display = 'flex';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeExpandedOverlay() {
        const overlay = document.getElementById('expandedOverlay');
        
        // Hide overlay
        overlay.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
        
        // Clear expanded card state
        this.expandedCard = null;
        this.isExpandedFlipped = false;
        
        // Stop any playing audio
        this.stopCurrentAudio();
    }

    flipExpandedCard() {
        this.isExpandedFlipped = !this.isExpandedFlipped;
        const expandedFlashcard = document.getElementById('expandedFlashcard');
        
        if (this.isExpandedFlipped) {
            expandedFlashcard.classList.add('flipped');
            this.updateExpandedBackContent();
        } else {
            expandedFlashcard.classList.remove('flipped');
        }
    }

    updateExpandedCard() {
        if (!this.expandedCard) return;
        
        const card = this.expandedCard;
        
        // Update front content
        document.getElementById('expandedZhuyinChar').textContent = card.zhuyin;
        document.getElementById('expandedPinyinEquiv').textContent = card.pinyin;
        
        // Handle tone-specific front display
        const toneDescription = document.getElementById('expandedToneDescription');
        const toneDescText = document.getElementById('expandedToneDescText');
        
        if (card.type === 'tones') {
            // Show tone description for tone cards
            if (toneDescription && toneDescText) {
                toneDescText.textContent = card.description;
                toneDescription.style.display = 'block';
            }
        } else {
            // Hide tone description for non-tone cards
            if (toneDescription) {
                toneDescription.style.display = 'none';
            }
        }
        
        // Update pinyin visibility based on settings
        const pinyinElement = document.getElementById('expandedPinyinEquiv').parentElement;
        if (pinyinElement) {
            pinyinElement.style.display = this.settings.showPinyin ? 'block' : 'none';
        }
    }

    updateExpandedBackContent() {
        const card = this.expandedCard;
        if (!card) return;
        
        // Show/hide sections based on card type
        const wordSection = document.getElementById('expandedWordSection');
        const sentenceSection = document.getElementById('expandedSentenceSection');
        const breakdownSection = document.getElementById('expandedBreakdownSection');
        const notesSection = document.getElementById('expandedNotesSection');
        
        if (card.type === 'tones') {
            // For tone cards, show only word example, hide notes
            if (wordSection) wordSection.style.display = 'block';
            if (sentenceSection) sentenceSection.style.display = 'none';
            if (breakdownSection) breakdownSection.style.display = 'none';
            if (notesSection) notesSection.style.display = 'none';
            
            // Update word example
            this.updateExpandedWordExample(card);
        } else {
            // For consonant and vowel cards, show all sections including notes
            if (wordSection) wordSection.style.display = 'block';
            if (sentenceSection) sentenceSection.style.display = 'block';
            if (breakdownSection) breakdownSection.style.display = 'block';
            if (notesSection) notesSection.style.display = 'block';
            
            // Update word example
            this.updateExpandedWordExample(card);
            
            // Update sentence example
            if (card.example_sentence) {
                document.getElementById('expandedSentenceChars').textContent = card.example_sentence.characters;
                this.updateExpandedSentenceTranslation(card.example_sentence);
                this.updateExpandedWordBreakdown(card.example_sentence.words);
            }
            
            // Update notes and mnemotecnia
            this.updateExpandedNotesAndMnemotecnia(card);
        }
    }

    updateExpandedWordExample(card) {
        if (card.example_word) {
            document.getElementById('expandedExampleChars').textContent = card.example_word.characters;
            document.getElementById('expandedExamplePinyin').textContent = card.example_word.pinyin;
            document.getElementById('expandedExampleMeaning').textContent = card.example_word.meaning;
            
            // Show zhuyin typing if available
            const zhuyinTyping = document.getElementById('expandedExampleZhuyin');
            if (card.example_word.zhuyin_typing) {
                zhuyinTyping.textContent = card.example_word.zhuyin_typing;
                zhuyinTyping.style.display = 'block';
            } else {
                zhuyinTyping.style.display = 'none';
            }
        }
    }

    updateExpandedSentenceTranslation(sentence) {
        // Use spanish_translation directly instead of concatenating meanings
        const sentenceTranslationElement = document.getElementById('expandedSentenceTranslation');
        if (sentence.spanish_translation) {
            sentenceTranslationElement.textContent = sentence.spanish_translation;
        } else {
            // Fallback to concatenating meanings if spanish_translation is not available
            if (sentence.words) {
                const translation = sentence.words.map(word => word.meaning).join(' ');
                sentenceTranslationElement.textContent = translation;
            }
        }
    }

    updateExpandedWordBreakdown(words) {
        const container = document.getElementById('expandedWordBreakdown');
        container.innerHTML = '';
        
        if (words) {
            words.forEach((word, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                
                // Build the word information display
                let wordInfoHtml = `
                    <div>
                        <span class="word-chars">${word.characters}</span>
                        <span class="word-pinyin">${word.pinyin}</span>
                `;
                
                // Add zhuyin_typing if available
                if (word.zhuyin_typing) {
                    wordInfoHtml += `<span class="word-zhuyin">${word.zhuyin_typing}</span>`;
                }
                
                wordInfoHtml += `
                    </div>
                    <div class="word-meaning">${word.meaning}</div>
                    <button class="word-audio" data-chars="${word.characters}" data-pinyin="${word.pinyin}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                `;
                
                wordItem.innerHTML = wordInfoHtml;
                
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

    updateExpandedNotesAndMnemotecnia(card) {
        const noteText = document.getElementById('expandedNoteText');
        const mnemotecniaText = document.getElementById('expandedMnemotecniaText');
        
        // Update note content
        if (card.note && noteText) {
            noteText.innerHTML = this.processMarkdown(card.note);
        }
        
        // Update mnemotecnia content
        if (card.mnemotecnia && mnemotecniaText) {
            mnemotecniaText.innerHTML = this.processMarkdown(card.mnemotecnia);
        }
    }

    // Expanded audio methods
    playExpandedZhuyinSound() {
        const card = this.expandedCard;
        if (!card) return;
        
        let audioPath;
        
        if (card.type === 'tones') {
            // For tones, play the example word directly
            audioPath = this.getToneExampleAudioPath(card);
        } else {
            // For consonants and vowels, play the zhuyin sound
            audioPath = this.getZhuyinSoundPath(card);
        }
        
        this.playAudio(audioPath, 'expandedPlayZhuyinSound');
    }

    playExpandedWordAudio() {
        const card = this.expandedCard;
        if (!card || !card.example_word) return;
        
        const audioPath = this.getWordAudioPath(card);
        this.playAudio(audioPath, 'expandedPlayWord');
    }

    playExpandedSentenceAudio() {
        const card = this.expandedCard;
        if (!card || !card.example_sentence) return;
        
        const audioPath = this.getSentenceAudioPath(card);
        this.playAudio(audioPath, 'expandedPlaySentence');
    }
    
    playMiniCardAudio(card) {
        let audioPath;
        
        if (card.type === 'tones') {
            // For tones, play the example word directly
            audioPath = this.getToneExampleAudioPath(card);
        } else {
            // For consonants and vowels, play the zhuyin sound
            audioPath = this.getZhuyinSoundPath(card);
        }
        
        this.playAudio(audioPath);
    }
    
    playMiniCardWordAudio(card) {
        if (card.example_word) {
            const audioPath = this.getWordAudioPath(card);
            this.playAudio(audioPath);
        }
    }

    updatePinyinVisibility() {
        // Update main flashcard pinyin
        const pinyinElement = document.querySelector('.pinyin-equivalent');
        if (pinyinElement) {
            pinyinElement.style.display = this.settings.showPinyin ? 'block' : 'none';
        }
        
        // Update mini-cards pinyin if in overview mode
        if (this.settings.overviewMode) {
            const miniPinyinElements = document.querySelectorAll('.mini-pinyin');
            miniPinyinElements.forEach(element => {
                element.style.display = this.settings.showPinyin ? 'block' : 'none';
            });
        }
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.currentCards.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    // Audio Methods
    playZhuyinSound() {
        const currentCard = this.currentCards[this.currentIndex];
        let audioPath;
        
        if (currentCard.type === 'tones') {
            // For tones, play the example word directly
            audioPath = this.getToneExampleAudioPath(currentCard);
        } else {
            // For consonants and vowels, play the zhuyin sound
            audioPath = this.getZhuyinSoundPath(currentCard);
        }
        
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
        
        if (card.type === 'tones') {
            return `${this.audioBasePath}tones/examples/tono_${card.tone_number}_${this.sanitizeFilename(word.characters)}_${word.pinyin}.mp3`;
        } else {
            const category = `${card.type}/words`;
            return `${this.audioBasePath}${category}/${this.sanitizeFilename(card.zhuyin)}_${this.sanitizeFilename(word.characters)}_${word.pinyin}.mp3`;
        }
    }

    getToneExampleAudioPath(card) {
        const word = card.example_word;
        return `${this.audioBasePath}tones/examples/tono_${card.tone_number}_${this.sanitizeFilename(word.characters)}_${word.pinyin}.mp3`;
    }

    getSentenceAudioPath(card) {
        const sentence = card.example_sentence;
        const category = `${card.type}/sentences`;
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
        document.querySelectorAll('.audio-btn.playing, .front-audio-btn.playing, .mini-audio-btn.playing').forEach(btn => {
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
        
        const overviewModeCheckbox = document.getElementById('overviewMode');
        if (overviewModeCheckbox) {
            overviewModeCheckbox.checked = this.settings.overviewMode;
        }
        
        this.updatePinyinVisibility();
        
        // Apply overview mode if enabled
        if (this.settings.overviewMode) {
            this.toggleOverviewMode();
        }
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
        // Only handle keyboard in individual card mode, unless it's escape for closing overlay
        if (event.key === 'Escape' && this.expandedCard) {
            this.closeExpandedOverlay();
            return;
        }
        
        if (this.settings.overviewMode) return;
        
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
                swipeLeft: () => {
                    if (!window.app.settings.overviewMode) {
                        window.app.nextCard();
                    }
                },
                swipeRight: () => {
                    if (!window.app.settings.overviewMode) {
                        window.app.previousCard();
                    }
                }
            });
        }
    }, 1000);
});