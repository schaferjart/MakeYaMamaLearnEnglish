# Make Ya Mama Learn English

Some Mamas have worked all their lifes in carework. 

Thank you Mamas - and damn you society for this unfair setting. 

But when going on vacation these Mamas are fucked because these Mamas they speak no English and have never learned it - so, my Mama told me. 

When I told her to watch a series with subtitles she said, that this does not work for her because of slang and speed.
When I gave her my phone after telling ChatGPT to be a benevolent English tutor she screamed at me to tell my phone to speak slower. 

So I asked her what she likes and she said reading books. Maybe your Mama does too...
So probably 20 years after the last self made present:

No drawing, recipe for a spicy tomato sauce or origami birds - all stuff that lies around - but technology to move smoother!

This applications core idea is to read and engage with the content of a book, creating first and foremost comfort in speaking: 
Reading while listening matches sound to written form and the following conversation is leading the user to use the language in a low stake setting. 

The user is able to define the speed of lecture, duration of sessions, can search for a words translation and save unkown vocabulary to engage with it at a later time. 

---

## Version v1.01-i19n

**NEW FEATURES:**
- **Multi-Language Support**: Learn any language from any other language
- **Language Detection**: Books automatically detected by language
- **TTS Accents**: Text-to-speech uses correct accent for each book's language
- **AI Tutor Language Matching**: AI tutor responds in the book's language
- **Speech Recognition**: Voice input understands the book's language
- **Settings Page**: Centralized language preferences management
- **Language-Aware Vocabulary**: All vocabulary features respect book language

**TECHNICAL IMPROVEMENTS:**
- Complete TTS language consistency across entire platform
- Dynamic voice selection based on book language
- Language-aware speech recognition (browser + Whisper API)
- Simplified language system (single native language for translations)
- Enhanced database schema with language support
- Comprehensive language mapping for 12+ languages

**SUPPORTED LANGUAGES:**
German (de), English (en), French (fr), Hindi (hi), Italian (it), Spanish (es), Portuguese (pt), Russian (ru), Japanese (ja), Korean (ko), Chinese (zh), Arabic (ar)

---

Initially the MVP targeted German speaking Mamas. The interface is now internationalized and supports German (de), English (en), French (fr) and Hindi (hi). Additional languages can be added by extending the translation dictionaries and database columns.

The Application uses WEB Speech API - installed on system. Meaning your Mama needs to have the appropriate language package installed on her Phone or Computer - otherwise the voice will be phonetically wrong. 

For Requests regarding uploading particular books, text me. 


**https://makeyamamalearnenglishv2.lovable.app**

---

## Flow & User Experience

### 1. Library & Book Selection

- On opening the app, the user sees a library of books displayed with covers, author, year of publishing, and a short AI-generated description.
    
- The available books are sourced from non-copyrighted EPUBs (e.g., Standard Ebooks).
    
- The user selects a book:
    

- If it's the first time, reading starts at the beginning.
    
- If already in progress, the app shows percentage read and words learned so far.
    

### 2. Reading Session Setup

- The user sets the duration of the reading session using a slider (5–60 minutes).
    
- Once started, the book text is displayed in a clean reader interface.
    
- The user can switch between light/dark mode and adjust text size.
    

### 3. Reading with Audio & Highlighting

- The text is read aloud using the correct accent for the book's language (e.g., Italian accent for Italian books).
    
- As the voice reads, the current word or sentence is highlighted for synchronization.
    
- Users can pause, resume, or skip ahead.
    

### 4. Vocabulary Assistance

- A user can click on a single word or highlight multiple words:
    

- The app shows definition, synonyms, and translation to the user's interface language.
    
- Translations and explanations are displayed in a simple pop-up.
    
- **NEW**: Word pronunciation uses the book's language accent for authentic learning.
    

- Every selected word/phrase is added to a personal vocabulary list, along with metadata (lemma, location in book, difficulty, etc.).
    

### 5. AI-Assisted Comprehension (Conversation Mode)

- After the reading timer ends (e.g., 15 minutes), the app switches to a conversation mode.
    
- An AI tutor engages the user in a short conversation (~5 minutes):
    

- It asks comprehension questions about the text just read **in the book's language**.
    
- Questions are adjusted to the user's language level (CEFR A1–C2).
    
- Example prompts: "What happened in this part?", "What did the character decide?", "Where is the story set?"
    

- The tutor:
    

- Responds empathetically and patiently **in the book's language**.
    
- Corrects mistakes gently.
    
- Provides hints/explanations in the user's interface language if they struggle.
    
- Keeps the conversation within a timebox (ratio 3:1 reading to speaking).
    
- **NEW**: Speech recognition understands the book's language for natural conversation.
    

### 6. Progress & Review

- At the end of each session, progress is saved:
    

- Book position (so reading can continue later).
    
- Words learned.
    
- Conversation history (saved as transcript).
    

- The user can review:
    

- Vocabulary list (with filtering by difficulty/newness).
    
- Past conversation sessions.
    
- Percentage of book completed.
    

---

## Key UX Principles

- Simplicity first: Users should be able to start reading/listening immediately without technical hurdles.
    
- **NEW**: Multi-language interface: Users can choose their preferred interface language while learning any target language.
    
- **NEW**: Language-aware experience: All audio, AI responses, and speech recognition automatically adapt to the book's language.
    
- Encouragement: The AI tutor is designed to feel like the "best teacher ever": curious, supportive, and patient.
    
- Consistency: Styling and theming are centralized, ensuring clean and accessible design across all screens.
    
- **NEW**: Authentic pronunciation: TTS uses native accents for each language, providing authentic learning experience.
    

---

## Example Session Flow

1. Open app → Choose interface language in Settings → Choose a book (any language).
    
2. Set reading duration → Begin reading with **authentic language accent** + highlighting.
    
3. Tap/Highlight words for translation to your interface language + **pronunciation in book's accent**.
    
4. Reading timer ends → AI tutor starts conversation **in the book's language**.
    
5. User answers questions **in the book's language** → Tutor corrects gently and asks follow-ups.
    
6. Session ends → Progress and words saved → Return to library/dashboard.

**NEW Multi-Language Example:**
- German user reads Italian book → Interface in German, audio in Italian accent, AI tutor speaks Italian, translations to German
- English user reads French book → Interface in English, audio in French accent, AI tutor speaks French, translations to English

---

## Technical Implementation (v1.01-i18n)

### Language System Architecture
- **Interface Language**: User's preferred language for UI, menus, and translations (managed via Settings page)
- **Book Language**: Automatically detected language of the content being read
- **TTS Language**: Always matches the book's language for authentic pronunciation
- **AI Tutor Language**: Always responds in the book's language
- **Speech Recognition**: Configured for the book's language

### Database Schema
- `books.language_code`: Stores the detected language of each book
- `vocabulary.source_language` & `vocabulary.target_language`: Language pair for vocabulary entries
- Enhanced RLS policies for multi-language support

### API Enhancements
- **Whisper STT**: Language-aware speech-to-text processing
- **AI Tutor**: Dynamic language prompts based on book language
- **DeepL Translation**: Context-aware translations
- **Wordnik Lookup**: Language-specific word definitions

### Frontend Components
- **Settings Page**: Centralized language preference management
- **Language-Aware TTS**: Dynamic voice selection based on book language
- **Smart Vocabulary Panel**: Book language for pronunciation, interface language for translations
- **Conversation Interface**: Seamless language switching between reading and conversation modes

### Supported Language Codes
```typescript
'de' | 'en' | 'fr' | 'hi' | 'it' | 'es' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar'
```
    
