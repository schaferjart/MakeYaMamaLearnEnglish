# Make Ya Mama Learn English V2

Some Mamas have worked all their lifes in carework. 

Thank you Mamas - and damn you society for this unfair setting. 

But when going on vacation these Mamas are fucked because these Mamas they speak no English and have never learned it - so, my Mama told me. 

When I told her to watch a series with subtitles she said, that this does not work for her because of slang and speed.
When I gave her my phone after telling ChatGPT to be a benevolent English tutor she screamed at me to tell my phone to speak slower. 

So I asked her what she likes and she said reading books. Maybe your Mama does too.
So probably 20 years after the last self made present:

No drawing, recipe for a spicy tomato sauce or origami birds - all stuff that lies around - but technology to move smoother around!

This applications core idea is to read and engage with the content of a book, creating first and foremost comfort in speaking: 
Reading while listening matches sound to written form and the following conversation is leading the user to use the language in a low stake setting. 

The user is able to define the speed of lecture, duration of sessions, can search for a words translation and save unkown vocabulary to engage with it at a later time. 

---

Initially the MVP targeted German speaking Mamas. The interface is now internationalized and supports German (de), English (en), French (fr) and Hindi (hi). Additional languages can be added by extending the translation dictionaries and database columns.

The Application uses WEB Speech API - installed on system. Meaning your Mama neds to have an English package installed on her Phone or Computer - otherwise the voice will be phonetically wrong. 

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

- The text is read aloud using a UK-accented AI voice.
    
- As the voice reads, the current word or sentence is highlighted for synchronization.
    
- Users can pause, resume, or skip ahead.
    

### 4. Vocabulary Assistance

- A user can click on a single word or highlight multiple words:
    

- The app shows definition, synonyms, and a German translation.
    
- Translations and explanations are displayed in a simple pop-up.
    

- Every selected word/phrase is added to a personal vocabulary list, along with metadata (lemma, location in book, difficulty, etc.).
    

### 5. AI-Assisted Comprehension (Conversation Mode)

- After the reading timer ends (e.g., 15 minutes), the app switches to a conversation mode.
    
- An AI tutor engages the user in a short conversation (~5 minutes):
    

- It asks comprehension questions about the text just read.
    
- Questions are adjusted to the user's English level (CEFR A1–C2).
    
- Example prompts: "What happened in this part?", "What did the character decide?", "Where is the story set?"
    

- The tutor:
    

- Responds empathetically and patiently.
    
- Corrects mistakes gently.
    
- Provides German hints/explanations if the user struggles.
    
- Keeps the conversation within a timebox (ratio 3:1 reading to speaking).
    

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
    
- German-first interface: All menus, instructions, and UI text are in German to reduce entry barriers.
    
- Encouragement: The AI tutor is designed to feel like the "best teacher ever": curious, supportive, and patient.
    
- Consistency: Styling and theming are centralized, ensuring clean and accessible design across all screens.
    

---

## Example Session Flow

1. Open app → Choose a book.
    
2. Set reading duration → Begin reading with audio + highlighting.
    
3. Tap/Highlight words for translation/definition.
    
4. Reading timer ends → AI tutor starts conversation.
    
5. User answers questions → Tutor corrects gently and asks follow-ups.
    
6. Session ends → Progress and words saved → Return to library/dashboard.
    
