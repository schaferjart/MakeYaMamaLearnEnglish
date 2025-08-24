export const translations = {
  de: {
    // Navigation & General
    "app.title": "Englisch Lernen",
    "app.subtitle": "Durch Lesen und Sprechen",
    "library": "Bibliothek",
    "reading": "Lesen",
    "vocabulary": "Vokabeln",
    "progress": "Fortschritt",
    "settings": "Einstellungen",
     
    // Library
    "library.title": "Meine Bücher",
    "library.noBooks": "Noch keine Bücher vorhanden",
    "library.addBooks": "Bücher hinzufügen",
    "library.progress": "Fortschritt: {{percent}}%",
    "library.wordsLearned": "{{count}} Wörter gelernt",
    "library.continue": "Weiterlesen",
    "library.start": "Beginnen",
    
    // Reading Session  
    "session.timer": "Lesezeit",
    "session.minutes": "Minuten",
    "session.start": "Session beginnen",
    "session.pause": "Pausieren",
    "session.resume": "Fortsetzen",
    "session.timeRemaining": "Verbleibende Zeit: {{time}}",
    "session.timeUp": "Zeit ist um!",
    
    // Vocabulary
    "vocab.lookup": "Nachschlagen",
    "vocab.definition": "Definition",
    "vocab.synonyms": "Synonyme", 
    "vocab.translation": "Übersetzung",
    "vocab.save": "Speichern",
    "vocab.saved": "Gespeichert!",
    "vocab.example": "Beispiel",
    "vocab.learned": "Gelernte Wörter",
    "vocab.difficulty": "Schwierigkeit",
    
    // Reading Controls
    "reader.play": "Abspielen",
    "reader.pause": "Pausieren", 
    "reader.stop": "Stoppen",
    "reader.speed": "Geschwindigkeit",
    "reader.fontSize": "Schriftgröße",
    "reader.theme": "Design",
    
    // Tutor/Conversation
    "tutor.start": "Gespräch beginnen",
    "tutor.thinking": "Denkt nach...",
    "tutor.typeResponse": "Ihre Antwort eingeben...",
    "tutor.send": "Senden",
    
    // Common Actions
    "close": "Schließen",
    "save": "Speichern", 
    "cancel": "Abbrechen",
    "next": "Weiter",
    "previous": "Zurück",
    "loading": "Lädt..."
  },
  
  en: {
    // Navigation & General
    "app.title": "Learn English",
    "app.subtitle": "Through Reading and Speaking", 
    "library": "Library",
    "reading": "Reading",
    "vocabulary": "Vocabulary",
    "progress": "Progress",
    "settings": "Settings",
    
    // Library
    "library.title": "My Books",
    "library.noBooks": "No books yet",
    "library.addBooks": "Add Books",
    "library.progress": "Progress: {{percent}}%", 
    "library.wordsLearned": "{{count}} words learned",
    "library.continue": "Continue Reading",
    "library.start": "Start Reading",
    
    // Reading Session
    "session.timer": "Reading Time",
    "session.minutes": "Minutes",
    "session.start": "Start Session", 
    "session.pause": "Pause",
    "session.resume": "Resume",
    "session.timeRemaining": "Time remaining: {{time}}",
    "session.timeUp": "Time's up!",
    
    // Vocabulary
    "vocab.lookup": "Look up",
    "vocab.definition": "Definition", 
    "vocab.synonyms": "Synonyms",
    "vocab.translation": "Translation",
    "vocab.save": "Save",
    "vocab.saved": "Saved!",
    "vocab.example": "Example",
    "vocab.learned": "Learned Words",
    "vocab.difficulty": "Difficulty",
    
    // Reading Controls
    "reader.play": "Play",
    "reader.pause": "Pause",
    "reader.stop": "Stop", 
    "reader.speed": "Speed",
    "reader.fontSize": "Font Size",
    "reader.theme": "Theme",
    
    // Tutor/Conversation
    "tutor.start": "Start Conversation",
    "tutor.thinking": "Thinking...",
    "tutor.typeResponse": "Type your response...",
    "tutor.send": "Send",
    
    // Common Actions
    "close": "Close",
    "save": "Save",
    "cancel": "Cancel", 
    "next": "Next",
    "previous": "Previous", 
    "loading": "Loading..."
  }
};

export type TranslationKey = keyof typeof translations.de;
export type Locale = keyof typeof translations;

let currentLocale: Locale = 'de';

export const setLocale = (locale: Locale) => {
  currentLocale = locale;
};

export const getLocale = () => currentLocale;

export const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
  let text = translations[currentLocale][key] || translations.de[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{{${param}}}`, String(value));
    });
  }
  
  return text;
};