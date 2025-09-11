import { supabase } from '@/integrations/supabase/client';

export const translations = {
  de: {
    // Navigation & General
  "app.title": "MakeYaMamaLearnEnglish",
    "app.subtitle": "Natürlich mit Akzent",
    "dashboard": "Dashboard",
    "library": "Bibliothek",
    "vocabulary": "Vokabular",
    "conversations": "Gespräche",
    "reading": "Lesen",
    "session": "Session",
    "progress": "Fortschritt",
    "settings": "Einstellungen",
    "help": "Hilfe",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.description": "Verfolge deinen Lesefortschritt und Vokabelzuwachs",
    "dashboard.quickActions.title": "Quick Actions",
    "dashboard.quickActions.browseLibrary": "Browse Library",
    "dashboard.quickActions.reviewVocabulary": "Review Vocabulary",
    "dashboard.quickActions.viewStatistics": "View Statistics",
    "dashboard.recentActivity.title": "Recent Activity",
    "dashboard.recentActivity.noActivity": "No recent activity",
    "dashboard.recentActivity.startReadingPrompt": "Start reading to see your progress here",
    "dashboard.recentActivity.itemCount": "{{count}} items",
    "dashboard.recentActivity.readingActivity": "Read {{words}} words in {{minutes}} min",
    "dashboard.recentActivity.vocabularyActivity": "Learned \"{{word}}\"",
    "dashboard.recentActivity.sessionCompleted": "Completed reading session",
    "dashboard.stats.booksStarted": "Books Started",
    "dashboard.stats.wordsRead": "Words Read",
    "dashboard.stats.readingTime": "Reading Time",
    "dashboard.stats.vocabulary": "Vocabulary",
    "dashboard.stats.todaysProgress": "Today's Progress",
    "dashboard.stats.wordsReadGoal": "Words read: {{count}} / {{goal}}",
    "dashboard.stats.minutesReading": "{{count}} min reading",
    "dashboard.stats.dayStreak": "{{count}} day streak",
    "dashboard.stats.readingJourney": "Reading journey",
    "dashboard.stats.totalProgress": "Total progress",
    "dashboard.stats.wpmAvg": "{{count}} WPM avg",
    "dashboard.stats.wordsLearned": "Words learned",
    "dashboard.vocabulary.wordsByDifficulty": "Words by difficulty:",
    "dashboard.vocabulary.noWords": "No vocabulary saved yet",
    "dashboard.vocabulary.startReadingPrompt": "Start reading and save words to see progress",
    "dashboard.vocabulary.overview": "Vocabulary Overview",
    "dashboard.vocabulary.weeklyWords": "+{{count}} this week",
    "dashboard.vocabulary.easy": "Easy (1-2)",
    "dashboard.vocabulary.medium": "Medium (3-4)",
    "dashboard.vocabulary.hard": "Hard (5+)",
    "dashboard.vocabulary.byBook": "Words by Book",
    "dashboard.vocabulary.recentWords": "Recent Words",
    "dashboard.vocabulary.fromBook": "from {{bookTitle}}",
     
    // Library
    "library.title": "Meine Bücher",
  "library.noBooks": "Noch keine Bücher vorhanden",
    "library.addBooks": "Bücher hinzufügen",
    "library.progress": "Fortschritt: {{percent}}%",
    "library.wordsLearned": "{{count}} Wörter gelernt",
    "library.continue": "Weiterlesen",
    "library.start": "Beginnen",
    "library.booksAvailable": "{{count}} Bücher zum Lesen verfügbar",
    "library.noBooksFound": "Keine Bücher gefunden. Klicken Sie auf Synchronisieren, um Bücher aus dem Speicher zu laden.",
    "library.syncing": "Synchronisiere...",
    "library.syncBooks": "Bücher synchronisieren",
    "library.noBooksFoundTitle": "Keine Bücher gefunden",
    "library.noBooksFoundDescription": "Klicken Sie auf \"Bücher synchronisieren\", um Bücher aus Ihrem Speicher-Bucket zu laden.",

    // API Status
    "api.title": "API-Integrationsstatus",
    "api.description": "Um die volle Funktionalität (KI-Tutor, Vokabel-API, TTS) zu aktivieren, konfigurieren Sie Ihre API-Schlüssel in den Supabase Edge Function-Geheimnissen.",
    "api.wordnik": "Wordnik API",
    "api.deepl": "DeepL-Übersetzung",
    "api.tts": "Text-to-Speech",
    "api.progress": "Fortschrittsverfolgung",

    // Conversations
    "conversations.title": "Gespräche",
    "conversations.description": "Deine Unterhaltungen mit dem AI Tutor",
    "conversations.noConversations": "Noch keine Gespräche",
    "conversations.noConversationsDescription": "Starte eine Unterhaltung mit dem AI Tutor während des Lesens!",
    "conversations.toLibrary": "Zur Bibliothek",
  "conversations.headerTitle": "Gespräche mit dem AI Tutor",
  "conversations.sessions": "{{count}} Sessions",
  "conversations.session": "Session",
  "conversations.noSession": "Ohne Session",
  "conversations.messages": "{{count}} Nachrichten",
  "conversations.moreMessages": "... und {{count}} weitere Nachrichten",
  "conversations.you": "Du",
  "conversations.aiTutor": "AI Tutor",
  "conversations.unknown": "Unbekannt",

    // Toasts
    "toast.error.loadingBooks.title": "Fehler beim Laden der Bücher",
    "toast.error.loadingBooks.description": "Bitte versuchen Sie es später noch einmal.",
    "toast.success.syncingBooks.title": "Bücher erfolgreich synchronisiert",
    "toast.success.syncingBooks.description": "{{count}} Dateien verarbeitet",
    "toast.error.syncingBooks.title": "Fehler beim Synchronisieren der Bücher",
    "toast.error.syncingBooks.description": "Bitte versuchen Sie es später noch einmal.",
    
    // Reading Session  
  "session.timer": "Lesezeit",
    "session.minutes": "Minuten",
  "session.start": "Session beginnen",
    "session.pause": "Pausieren",
    "session.resume": "Fortsetzen",
    "session.timeRemaining": "Verbleibende Zeit: {{time}}",
    "session.timeUp": "Zeit ist um!",
    "session.timeUpPrompt": "Time for a short chat about what you've read!",
    
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
    "reader.bookNotFound": "Book not found",
    "reader.progress.title": "Reading Progress",
    "reader.sessionTimer.title": "Session Timer",
    "reader.sessionTimer.remaining": "remaining",
    "reader.playback.title": "Playback Controls",
    "reader.playback.volume": "Volume",
    "reader.tts.title": "Text-to-Speech",
    "reader.progress.timeRead": "Time Read",
    "reader.progress.timeLeft": "Time Left",
    "reader.sentenceProgress": "Sentence {{current}} of {{total}}",
    "reader.chapterComplete": "Chapter complete!",
    "reader.tts.readingAloud": "Reading aloud with browser voice",
    "reader.tts.generating": "Generating speech with browser...",
    "reader.progress.tracking": "Tracking",
    "reader.progress.percentComplete": "{{percent}}% Complete",
    "reader.progress.wordCount": "{{current}} / {{total}} words",
    "reader.progress.lessThanAMinute": "Less than 1 minute",
    "reader.progress.minutesLeft": "{{count}} minutes",
    "reader.progress.hoursLeft": "{{count}} hours",
    "reader.progress.daysLeft": "{{count}} days",
    "reader.progress.quarterDone": "Quarter Done",
    "reader.progress.halfwayThere": "Halfway There",
    "reader.progress.almostDone": "Almost Done",
    "reader.progress.completed": "Completed!",
    "reader.progress.lastRead": "Last read: {{date}} at {{time}}",

    // Tutor/Conversation
    "tutor.start": "Gespräch beginnen",
    "tutor.thinking": "Denkt nach...",
    "tutor.typeResponse": "Ihre Antwort eingeben...",
  "tutor.send": "Senden",
  "tutor.ready": "Ich bin bereit, über das Gelesene zu sprechen.",
  "tutor.duration": "Dauer:",
  "tutor.quick.dontKnow": "Ich weiß es nicht",
  "tutor.quick.hintPlease": "Hinweis bitte",
  "tutor.quick.nextQuestion": "Nächste Frage",
  "tutor.record.start": "🎤 Aufnehmen",
  "tutor.record.stop": "Aufnahme stoppen",
  "tutor.record.startHint": "Zum Starten der Aufnahme klicken",
  "tutor.record.stopHint": "Zum Stoppen der Aufnahme klicken",
  "tutor.error.title": "Fehler",
  "tutor.unavailable": "Der Tutor ist vorübergehend nicht verfügbar.",
    
    // Authentication
    "auth.title": "Anmeldung",
  "auth.welcome": "Willkommen bei {{app}}",
    "auth.description": "Die ersste App überhaupt für Mamas die endlich in die Ferien gehen wollen!",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.confirmPassword": "Passwort bestätigen",
    "auth.signIn": "Anmelden",
    "auth.signUp": "Registrieren",
    "auth.signOut": "Abmelden",
  "auth.or": "Oder",
  "auth.emailPlaceholder": "ihre@email.de",
  "auth.passwordMismatch": "Passwörter stimmen nicht überein",
  "auth.signupSuccess": "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.",
  "auth.googleSignIn": "Mit Google anmelden",
  "auth.googleSigningIn": "Anmelden...",
  "auth.language.en": "English",
  "auth.language.de": "Deutsch",
  "auth.language.fr": "Français",
    
    // Common Actions
    "close": "Schließen",
    "save": "Speichern", 
    "cancel": "Abbrechen",
    "next": "Weiter",
    "previous": "Zurück",
    "loading": "Lädt...",

    // Onboarding
    "onboarding.welcome": "Willkommen bei deinem Lese-Begleiter!",
    "onboarding.tour": "Hier ist eine schnelle Tour durch die Anwendung.",
    "onboarding.dashboard.title": "1. Das Dashboard",
    "onboarding.dashboard.description": "Dein Dashboard gibt dir einen schnellen Überblick über deinen Lesefortschritt, deine letzten Aktivitäten und deine Vokabelstärke.",
    "onboarding.reader.title": "2. Der Reader",
    "onboarding.reader.description": "Öffne ein beliebiges Buch und beginne zu lesen. Nutze die Mitlesefunktion und klicke auf ein beliebiges Wort, um dessen Definition zu erhalten.",
    "onboarding.vocabulary.title": "3. Vokabeltrainer",
    "onboarding.vocabulary.description": "Alle Wörter, die du nachschlägst, werden in deiner Vokabelliste gespeichert. Du kannst sie jederzeit wiederholen und sogar Quizfragen beantworten.",
    "onboarding.getStarted": "Loslegen",

    // Settings
    "settings.title": "Einstellungen",
    "settings.backToDashboard": "Zurück zum Dashboard",
    "settings.language.title": "Sprache",
    "settings.language.description": "Wähle deine bevorzugte Sprache für die Benutzeroberfläche.",
    
  // Vocabulary Pages & Components
  "vocab.page.title": "Vokabular-Bibliothek",
  "vocab.page.count": "{{count}} Wörter gespeichert",
  "vocab.searchPlaceholder": "Wörter suchen...",
  "vocab.modes.library": "Bibliothek",
  "vocab.modes.cards": "Lernkarten",
  "vocab.modes.quiz": "Quiz",
  "vocab.empty.title": "Noch keine Wörter gelernt",
  "vocab.empty.description": "Starte mit dem Lesen und speichere deine ersten Wörter!",
  "vocab.unknownBook": "Unbekanntes Buch",
  "vocab.book.titleAndAuthor": "{{title}} von {{author}}",
  "vocab.book.untitledWithId": "Buch {{id}}...",
  "vocab.wordCount": "{{count}} Wörter",
  "vocab.synonymLabel": "Synonym",
  "vocab.savedLabel": "Gespeichert",
  "vocab.noTranslation": "Keine Übersetzung",
    
  // Quiz
  "vocab.quiz.notEnoughTitle": "Nicht genug Wörter für Quiz",
  "vocab.quiz.notEnoughDescription": "Du benötigst mindestens 4 Wörter für ein Quiz. Lerne mehr Wörter und komm zurück!",
  "vocab.quiz.completeTitle": "Quiz abgeschlossen!",
  "vocab.quiz.nextQuestion": "Nächste Frage",
  "vocab.quiz.showResults": "Ergebnis anzeigen",
  "vocab.quiz.translateQuestion": "Was bedeutet dieses Wort?",
  "vocab.quiz.definitionQuestion": "Welches Wort passt zu dieser Definition?",
  "vocab.quiz.progressLabel": "Fortschritt",
  "vocab.quiz.questionCount": "{{current}} von {{total}} Fragen",
  "vocab.quiz.points": "Punkte: {{score}}/{{max}}",
  "vocab.quiz.score.excellent": "Hervorragend! Du kennst deine Wörter sehr gut!",
  "vocab.quiz.score.good": "Gut gemacht! Weiter so!",
  "vocab.quiz.score.okay": "Nicht schlecht, aber es gibt Raum für Verbesserungen.",
  "vocab.quiz.score.try": "Übe weiter! Die Wörter werden sich einprägen.",
    
  // Cards
  "vocab.cards.emptyTitle": "Keine Wörter zum Lernen",
  "vocab.cards.emptyDescription": "Füge erst Wörter zu deinem Vokabular hinzu!",
  "vocab.cards.completeTitle": "Lernkarten abgeschlossen!",
  "vocab.cards.known": "Bekannt",
  "vocab.cards.unknown": "Unbekannt",
  "vocab.cards.skipped": "Übersprungen",
  "vocab.cards.clickToFlip": "Klicken zum Umdrehen",
  "vocab.cards.skip": "Überspringen",
  "vocab.cards.unknownBtn": "Nicht gewusst",
  "vocab.cards.knownBtn": "Gewusst",
  "vocab.cards.flipHint": "Klicke auf die Karte, um die Übersetzung zu sehen",
  "vocab.cards.rateHint": "Bewerte dein Wissen über dieses Wort",
    
  // Common extra
  "delete": "Löschen",
  "back": "Zurück",
  "retry": "Wiederholen",

  // Not found
  "notFound.title": "Oops! Page not found",
  },
  
  en: {
    // Navigation & General
  "app.title": "MakeYaMamaLearnEnglish",
    "app.subtitle": "Speak Immigrant English in No Time", 
    "dashboard": "Dashboard",
    "library": "Library",
    "vocabulary": "Vocabulary",
    "conversations": "Conversations",
    "reading": "Reading",
    "session": "Session",
    "progress": "Progress",
    "settings": "Settings",
    "help": "Help",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.description": "Track your reading progress and vocabulary growth",
    "dashboard.quickActions.title": "Quick Actions",
    "dashboard.quickActions.browseLibrary": "Browse Library",
    "dashboard.quickActions.reviewVocabulary": "Review Vocabulary",
    "dashboard.quickActions.viewStatistics": "View Statistics",
    "dashboard.recentActivity.title": "Recent Activity",
    "dashboard.recentActivity.noActivity": "No recent activity",
    "dashboard.recentActivity.startReadingPrompt": "Start reading to see your progress here",
    "dashboard.recentActivity.itemCount": "{{count}} items",
    "dashboard.recentActivity.readingActivity": "Read {{words}} words in {{minutes}} min",
    "dashboard.recentActivity.vocabularyActivity": "Learned \"{{word}}\"",
    "dashboard.recentActivity.sessionCompleted": "Completed reading session",
    "dashboard.stats.booksStarted": "Books Started",
    "dashboard.stats.wordsRead": "Words Read",
    "dashboard.stats.readingTime": "Reading Time",
    "dashboard.stats.vocabulary": "Vocabulary",
    "dashboard.stats.todaysProgress": "Today's Progress",
    "dashboard.stats.wordsReadGoal": "Words read: {{count}} / {{goal}}",
    "dashboard.stats.minutesReading": "{{count}} min reading",
    "dashboard.stats.dayStreak": "{{count}} day streak",
    "dashboard.stats.readingJourney": "Reading journey",
    "dashboard.stats.totalProgress": "Total progress",
    "dashboard.stats.wpmAvg": "{{count}} WPM avg",
    "dashboard.stats.wordsLearned": "Words learned",
    "dashboard.vocabulary.wordsByDifficulty": "Words by difficulty:",
    "dashboard.vocabulary.noWords": "No vocabulary saved yet",
    "dashboard.vocabulary.startReadingPrompt": "Start reading and save words to see progress",
    "dashboard.vocabulary.overview": "Vocabulary Overview",
    "dashboard.vocabulary.weeklyWords": "+{{count}} this week",
    "dashboard.vocabulary.easy": "Easy (1-2)",
    "dashboard.vocabulary.medium": "Medium (3-4)",
    "dashboard.vocabulary.hard": "Hard (5+)",
    "dashboard.vocabulary.byBook": "Words by Book",
    "dashboard.vocabulary.recentWords": "Recent Words",
    "dashboard.vocabulary.fromBook": "from {{bookTitle}}",

    // Library
    "library.title": "My Books",
    "library.noBooks": "No books yet",
    "library.addBooks": "Add Books",
    "library.progress": "Progress: {{percent}}%", 
    "library.wordsLearned": "{{count}} words learned",
    "library.continue": "Continue Reading",
    "library.start": "Start Reading",
    "library.booksAvailable": "{{count}} books available for reading",
    "library.noBooksFound": "No books found. Click sync to load books from storage.",
    "library.syncing": "Syncing...",
    "library.syncBooks": "Sync Books",
    "library.noBooksFoundTitle": "No books found",
    "library.noBooksFoundDescription": "Click \"Sync Books\" to load books from your storage bucket.",

    // API Status
    "api.title": "API Integration Status",
    "api.description": "To enable full functionality (AI tutor, vocabulary API, TTS), configure your API keys in the Supabase Edge Function secrets.",
    "api.wordnik": "Wordnik API",
    "api.deepl": "DeepL Translation",
    "api.tts": "Text-to-Speech",
    "api.progress": "Progress Tracking",

    // Conversations
    "conversations.title": "Conversations",
    "conversations.description": "Your conversations with the AI Tutor",
    "conversations.noConversations": "No conversations yet",
    "conversations.noConversationsDescription": "Start a conversation with the AI Tutor while reading!",
    "conversations.toLibrary": "To the library",
  "conversations.headerTitle": "Conversations with the AI Tutor",
  "conversations.sessions": "{{count}} sessions",
  "conversations.session": "Session",
  "conversations.noSession": "No session",
  "conversations.messages": "{{count}} messages",
  "conversations.moreMessages": "... and {{count}} more messages",
  "conversations.you": "You",
  "conversations.aiTutor": "AI Tutor",
  "conversations.unknown": "Unknown",

    // Toasts
    "toast.error.loadingBooks.title": "Error loading books",
    "toast.error.loadingBooks.description": "Please try again later.",
    "toast.success.syncingBooks.title": "Books synced successfully",
    "toast.success.syncingBooks.description": "Processed {{count}} files",
    "toast.error.syncingBooks.title": "Error syncing books",
    "toast.error.syncingBooks.description": "Please try again later.",

    // Reading Session
    "session.timer": "Reading Time",
    "session.minutes": "Minutes",
    "session.start": "Start Session", 
    "session.pause": "Pause",
    "session.resume": "Resume",
    "session.timeRemaining": "Time remaining: {{time}}",
    "session.timeUp": "Time's up!",
    "session.timeUpPrompt": "Time for a short chat about what you've read!",
    
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
    "reader.bookNotFound": "Book not found",
    "reader.progress.title": "Reading Progress",
    "reader.sessionTimer.title": "Session Timer",
    "reader.sessionTimer.remaining": "remaining",
    "reader.playback.title": "Playback Controls",
    "reader.playback.volume": "Volume",
    "reader.tts.title": "Text-to-Speech",
    "reader.progress.timeRead": "Time Read",
    "reader.progress.timeLeft": "Time Left",
    "reader.sentenceProgress": "Sentence {{current}} of {{total}}",
    "reader.chapterComplete": "Chapter complete!",
    "reader.tts.readingAloud": "Reading aloud with browser voice",
    "reader.tts.generating": "Generating speech with browser...",
    "reader.progress.tracking": "Tracking",
    "reader.progress.percentComplete": "{{percent}}% Complete",
    "reader.progress.wordCount": "{{current}} / {{total}} words",
    "reader.progress.lessThanAMinute": "Less than 1 minute",
    "reader.progress.minutesLeft": "{{count}} minutes",
    "reader.progress.hoursLeft": "{{count}} hours",
    "reader.progress.daysLeft": "{{count}} days",
    "reader.progress.quarterDone": "Quarter Done",
    "reader.progress.halfwayThere": "Halfway There",
    "reader.progress.almostDone": "Almost Done",
    "reader.progress.completed": "Completed!",
    "reader.progress.lastRead": "Last read: {{date}} at {{time}}",
    
    // Tutor/Conversation
    "tutor.start": "Start Conversation",
    "tutor.thinking": "Thinking...",
    "tutor.typeResponse": "Type your response...",
  "tutor.send": "Send",
  "tutor.ready": "I am ready to talk about what you have read.",
  "tutor.duration": "Duration:",
  "tutor.quick.dontKnow": "I don't know",
  "tutor.quick.hintPlease": "Hint, please",
  "tutor.quick.nextQuestion": "Next question",
  "tutor.record.start": "🎤 Record",
  "tutor.record.stop": "Stop Recording",
  "tutor.record.startHint": "Click to start recording",
  "tutor.record.stopHint": "Click to stop recording",
  "tutor.error.title": "Error",
  "tutor.unavailable": "The tutor is temporarily unavailable.",
    
    // Authentication
    "auth.title": "Sign In",
  "auth.welcome": "Welcome to {{app}}",
    "auth.description": "Improve your English through reading, listening and speaking",
    "auth.email": "Email",
    "auth.password": "Password", 
    "auth.confirmPassword": "Confirm Password",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.signOut": "Sign Out",
  "auth.or": "Or",
  "auth.emailPlaceholder": "your@email.com",
  "auth.passwordMismatch": "Passwords do not match",
  "auth.signupSuccess": "Registration successful! Please check your email to confirm.",
  "auth.googleSignIn": "Sign in with Google",
  "auth.googleSigningIn": "Signing in...",
  "auth.language.en": "English",
  "auth.language.de": "Deutsch",
  "auth.language.fr": "Français",
    
    // Common Actions
    "close": "Close",
    "save": "Save",
    "cancel": "Cancel", 
    "next": "Next",
    "previous": "Previous", 
    "loading": "Loading...",

    // Onboarding
    "onboarding.welcome": "Welcome to Your Reading Companion!",
    "onboarding.tour": "Here's a quick tour of the application.",
    "onboarding.dashboard.title": "1. The Dashboard",
    "onboarding.dashboard.description": "Your dashboard gives you a quick overview of your reading progress, recent activity, and vocabulary strength.",
    "onboarding.reader.title": "2. The Reader",
    "onboarding.reader.description": "Open any book and start reading. Use the read-along feature, and click on any word to get its definition.",
    "onboarding.vocabulary.title": "3. Vocabulary Builder",
    "onboarding.vocabulary.description": "All the words you look up are saved in your vocabulary list. You can review them anytime and even take quizzes.",
    "onboarding.getStarted": "Get Started",

    // Settings
    "settings.title": "Settings",
    "settings.backToDashboard": "Back to Dashboard",
    "settings.language.title": "Language",
    "settings.language.description": "Choose your preferred language for the user interface.",
    
  // Vocabulary Pages & Components
  "vocab.page.title": "Vocabulary Library",
  "vocab.page.count": "{{count}} words saved",
  "vocab.searchPlaceholder": "Search words...",
  "vocab.modes.library": "Library",
  "vocab.modes.cards": "Flashcards",
  "vocab.modes.quiz": "Quiz",
  "vocab.empty.title": "No words learned yet",
  "vocab.empty.description": "Start reading and save your first words!",
  "vocab.unknownBook": "Unknown book",
  "vocab.book.titleAndAuthor": "{{title}} by {{author}}",
  "vocab.book.untitledWithId": "Book {{id}}...",
  "vocab.wordCount": "{{count}} words",
  "vocab.synonymLabel": "Synonym",
  "vocab.savedLabel": "Saved",
  "vocab.noTranslation": "No translation",
    
  // Quiz
  "vocab.quiz.notEnoughTitle": "Not enough words for a quiz",
  "vocab.quiz.notEnoughDescription": "You need at least 4 words for a quiz. Learn more words and come back!",
  "vocab.quiz.completeTitle": "Quiz complete!",
  "vocab.quiz.nextQuestion": "Next question",
  "vocab.quiz.showResults": "Show results",
  "vocab.quiz.translateQuestion": "What does this word mean?",
  "vocab.quiz.definitionQuestion": "Which word matches this definition?",
  "vocab.quiz.progressLabel": "Progress",
  "vocab.quiz.questionCount": "{{current}} of {{total}} questions",
  "vocab.quiz.points": "Points: {{score}}/{{max}}",
  "vocab.quiz.score.excellent": "Excellent! You know your words very well!",
  "vocab.quiz.score.good": "Well done! Keep it up!",
  "vocab.quiz.score.okay": "Not bad, but there's room for improvement.",
  "vocab.quiz.score.try": "Keep practicing! The words will stick.",
    
  // Cards
  "vocab.cards.emptyTitle": "No words to study",
  "vocab.cards.emptyDescription": "Add words to your vocabulary first!",
  "vocab.cards.completeTitle": "Flashcards complete!",
  "vocab.cards.known": "Known",
  "vocab.cards.unknown": "Unknown",
  "vocab.cards.skipped": "Skipped",
  "vocab.cards.clickToFlip": "Click to flip",
  "vocab.cards.skip": "Skip",
  "vocab.cards.unknownBtn": "Didn't know",
  "vocab.cards.knownBtn": "Knew it",
  "vocab.cards.flipHint": "Click the card to see the translation",
  "vocab.cards.rateHint": "Rate your knowledge of this word",
    
  // Common extra
  "delete": "Delete",
  "back": "Back",
  "retry": "Retry",

  // Not found
  "notFound.title": "Oops! Page not found",
  },

  fr: {
    // Navigation & General
  "app.title": "Make Steve and Ya Mama Learn English",
  "app.subtitle": `Parler l'anglais des immigré en un rien de temps`,
    "dashboard": "Tableau de bord",
    "library": "Bibliothèque",
    "vocabulary": "Vocabulaire",
    "conversations": "Conversations",
    "reading": "Lecture",
    "session": "Session",
    "progress": "Progrès",
    "settings": "Paramètres",
    "help": "Aide",

    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.description": "Suivez vos progrès de lecture et la croissance de votre vocabulaire",
    "dashboard.quickActions.title": "Quick Actions",
    "dashboard.quickActions.browseLibrary": "Browse Library",
    "dashboard.quickActions.reviewVocabulary": "Review Vocabulary",
    "dashboard.quickActions.viewStatistics": "View Statistics",
    "dashboard.recentActivity.title": "Recent Activity",
    "dashboard.recentActivity.noActivity": "No recent activity",
    "dashboard.recentActivity.startReadingPrompt": "Start reading to see your progress here",
    "dashboard.recentActivity.itemCount": "{{count}} items",
    "dashboard.recentActivity.readingActivity": "Read {{words}} words in {{minutes}} min",
    "dashboard.recentActivity.vocabularyActivity": "Learned \"{{word}}\"",
    "dashboard.recentActivity.sessionCompleted": "Completed reading session",
    "dashboard.stats.booksStarted": "Books Started",
    "dashboard.stats.wordsRead": "Words Read",
    "dashboard.stats.readingTime": "Reading Time",
    "dashboard.stats.vocabulary": "Vocabulary",
    "dashboard.stats.todaysProgress": "Today's Progress",
    "dashboard.stats.wordsReadGoal": "Words read: {{count}} / {{goal}}",
    "dashboard.stats.minutesReading": "{{count}} min reading",
    "dashboard.stats.dayStreak": "{{count}} day streak",
    "dashboard.stats.readingJourney": "Reading journey",
    "dashboard.stats.totalProgress": "Total progress",
    "dashboard.stats.wpmAvg": "{{count}} WPM avg",
    "dashboard.stats.wordsLearned": "Words learned",
    "dashboard.vocabulary.wordsByDifficulty": "Words by difficulty:",
    "dashboard.vocabulary.noWords": "No vocabulary saved yet",
    "dashboard.vocabulary.startReadingPrompt": "Start reading and save words to see progress",
    "dashboard.vocabulary.overview": "Vocabulary Overview",
    "dashboard.vocabulary.weeklyWords": "+{{count}} this week",
    "dashboard.vocabulary.easy": "Easy (1-2)",
    "dashboard.vocabulary.medium": "Medium (3-4)",
    "dashboard.vocabulary.hard": "Hard (5+)",
    "dashboard.vocabulary.byBook": "Words by Book",
    "dashboard.vocabulary.recentWords": "Recent Words",
    "dashboard.vocabulary.fromBook": "from {{bookTitle}}",

    // Library
    "library.title": "Mes livres",
    "library.noBooks": "Aucun livre pour le moment",
    "library.addBooks": "Ajouter des livres",
    "library.progress": "Progrès : {{percent}}%",
    "library.wordsLearned": "{{count}} mots appris",
    "library.continue": "Continuer la lecture",
    "library.start": "Commencer la lecture",
    "library.booksAvailable": "{{count}} livres disponibles pour la lecture",
    "library.noBooksFound": "Aucun livre trouvé. Cliquez sur synchroniser pour charger les livres depuis le stockage.",
    "library.syncing": "Synchronisation...",
    "library.syncBooks": "Synchroniser les livres",
    "library.noBooksFoundTitle": "Aucun livre trouvé",
    "library.noBooksFoundDescription": "Cliquez sur \"Synchroniser les livres\" pour charger les livres depuis votre compartiment de stockage.",

    // API Status
    "api.title": "État de l'intégration de l'API",
    "api.description": "Pour activer toutes les fonctionnalités (tuteur IA, API de vocabulaire, TTS), configurez vos clés API dans les secrets de la fonction Supabase Edge.",
    "api.wordnik": "API Wordnik",
    "api.deepl": "Traduction DeepL",
    "api.tts": "Synthèse vocale",
    "api.progress": "Suivi des progrès",

    // Conversations
    "conversations.title": "Conversations",
    "conversations.description": "Vos conversations avec le tuteur IA",
    "conversations.noConversations": "Aucune conversation pour le moment",
    "conversations.noConversationsDescription": "Commencez une conversation avec le tuteur IA pendant la lecture !",
    "conversations.toLibrary": "À la bibliothèque",
  "conversations.headerTitle": "Conversations avec le tuteur IA",
  "conversations.sessions": "{{count}} sessions",
  "conversations.session": "Session",
  "conversations.noSession": "Sans session",
  "conversations.messages": "{{count}} messages",
  "conversations.moreMessages": "... et {{count}} messages supplémentaires",
  "conversations.you": "Vous",
  "conversations.aiTutor": "Tuteur IA",
  "conversations.unknown": "Inconnu",

    // Toasts
    "toast.error.loadingBooks.title": "Erreur lors du chargement des livres",
    "toast.error.loadingBooks.description": "Veuillez réessayer plus tard.",
    "toast.success.syncingBooks.title": "Livres synchronisés avec succès",
    "toast.success.syncingBooks.description": "{{count}} fichiers traités",
    "toast.error.syncingBooks.title": "Erreur lors de la synchronisation des livres",
    "toast.error.syncingBooks.description": "Veuillez réessayer plus tard.",

    // Reading Session
    "session.timer": "Temps de lecture",
    "session.minutes": "Minutes",
    "session.start": "Démarrer la session",
    "session.pause": "Pause",
    "session.resume": "Reprendre",
    "session.timeRemaining": "Temps restant : {{time}}",
    "session.timeUp": "Le temps est écoulé !",
    "session.timeUpPrompt": "Time for a short chat about what you've read!",

    // Vocabulary
    "vocab.lookup": "Rechercher",
    "vocab.definition": "Définition",
    "vocab.synonyms": "Synonymes",
    "vocab.translation": "Traduction",
    "vocab.save": "Enregistrer",
    "vocab.saved": "Enregistré !",
    "vocab.example": "Exemple",
    "vocab.learned": "Mots appris",
    "vocab.difficulty": "Difficulté",

    // Reading Controls
    "reader.play": "Lire",
    "reader.pause": "Pause",
    "reader.stop": "Arrêter",
    "reader.speed": "Vitesse",
    "reader.fontSize": "Taille de la police",
    "reader.theme": "Thème",
    "reader.bookNotFound": "Book not found",
    "reader.progress.title": "Reading Progress",
    "reader.sessionTimer.title": "Session Timer",
    "reader.sessionTimer.remaining": "remaining",
    "reader.playback.title": "Playback Controls",
    "reader.playback.volume": "Volume",
    "reader.tts.title": "Text-to-Speech",
    "reader.progress.timeRead": "Time Read",
    "reader.progress.timeLeft": "Time Left",
    "reader.sentenceProgress": "Sentence {{current}} of {{total}}",
    "reader.chapterComplete": "Chapter complete!",
    "reader.tts.readingAloud": "Reading aloud with browser voice",
    "reader.tts.generating": "Generating speech with browser...",
    "reader.progress.tracking": "Tracking",
    "reader.progress.percentComplete": "{{percent}}% Complete",
    "reader.progress.wordCount": "{{current}} / {{total}} words",
    "reader.progress.lessThanAMinute": "Less than 1 minute",
    "reader.progress.minutesLeft": "{{count}} minutes",
    "reader.progress.hoursLeft": "{{count}} hours",
    "reader.progress.daysLeft": "{{count}} days",
    "reader.progress.quarterDone": "Quarter Done",
    "reader.progress.halfwayThere": "Halfway There",
    "reader.progress.almostDone": "Almost Done",
    "reader.progress.completed": "Completed!",
    "reader.progress.lastRead": "Last read: {{date}} at {{time}}",

    // Tutor/Conversation
    "tutor.start": "Démarrer la conversation",
    "tutor.thinking": "Réflexion...",
    "tutor.typeResponse": "Tapez votre réponse...",
  "tutor.send": "Envoyer",
  "tutor.ready": "Je suis prêt à parler de ce que vous avez lu.",
  "tutor.duration": "Durée :",
  "tutor.quick.dontKnow": "Je ne sais pas",
  "tutor.quick.hintPlease": "Indice, s'il vous plaît",
  "tutor.quick.nextQuestion": "Question suivante",
  "tutor.record.start": "🎤 Enregistrer",
  "tutor.record.stop": "Arrêter l'enregistrement",
  "tutor.record.startHint": "Cliquez pour commencer l'enregistrement",
  "tutor.record.stopHint": "Cliquez pour arrêter l'enregistrement",
  "tutor.error.title": "Erreur",
  "tutor.unavailable": "Le tuteur est temporairement indisponible.",

    // Authentication
    "auth.title": "Se connecter",
  "auth.welcome": `Pour ceux qui bougent
Pas pour ceux qui s'chient dessus
Qui s’tapent, même quand les plus grands s’font marcher dessus
Pour nos mères qui paniquent dès que ça dit "How you do ?"
Wesh wesh cousin,
avec l’appli, ellent répondent cash : "Fine thanks, and you?"`,
    "auth.description": "UN VERRE UN CHAPITRE ET ON Y VA",
    "auth.email": "E-mail",
    "auth.password": "Mot de passe",
    "auth.confirmPassword": "Confirmer le mot de passe",
    "auth.signIn": "Se connecter",
    "auth.signUp": "S'inscrire",
    "auth.signOut": "Se déconnecter",
  "auth.or": "Ou",
  "auth.emailPlaceholder": "votre@email.fr",
  "auth.passwordMismatch": "Les mots de passe ne correspondent pas",
  "auth.signupSuccess": "Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer.",
  "auth.googleSignIn": "Se connecter avec Google",
  "auth.googleSigningIn": "Connexion...",
  "auth.language.en": "English",
  "auth.language.de": "Deutsch",
  "auth.language.fr": "Français",

    // Common Actions
    "close": "Fermer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "next": "Suivant",
    "previous": "Précédent",
    "loading": "Chargement...",

    // Onboarding
    "onboarding.welcome": "Bienvenue dans votre compagnon de lecture !",
    "onboarding.tour": "Voici une visite rapide de l'application.",
    "onboarding.dashboard.title": "1. Le tableau de bord",
    "onboarding.dashboard.description": "Votre tableau de bord vous donne un aperçu rapide de vos progrès de lecture, de votre activité récente et de la force de votre vocabulaire.",
    "onboarding.reader.title": "2. Le lecteur",
    "onboarding.reader.description": "Ouvrez n'importe quel livre et commencez à lire. Utilisez la fonction de lecture à voix haute et cliquez sur n'importe quel mot pour obtenir sa définition.",
    "onboarding.vocabulary.title": "3. Constructeur de vocabulaire",
    "onboarding.vocabulary.description": "Tous les mots que vous recherchez sont enregistrés dans votre liste de vocabulaire. Vous pouvez les réviser à tout moment et même répondre à des quiz.",
    "onboarding.getStarted": "Commencer",

    // Settings
    "settings.title": "Paramètres",
    "settings.backToDashboard": "Retour au tableau de bord",
    "settings.language.title": "Langue",
    "settings.language.description": "Choisissez votre langue préférée pour l'interface utilisateur.",
    
  // Vocabulary Pages & Components
  "vocab.page.title": "Bibliothèque de vocabulaire",
  "vocab.page.count": "{{count}} mots enregistrés",
  "vocab.searchPlaceholder": "Rechercher des mots...",
  "vocab.modes.library": "Bibliothèque",
  "vocab.modes.cards": "Cartes",
  "vocab.modes.quiz": "Quiz",
  "vocab.empty.title": "Aucun mot appris pour le moment",
  "vocab.empty.description": "Commencez à lire et enregistrez vos premiers mots !",
  "vocab.unknownBook": "Livre inconnu",
  "vocab.book.titleAndAuthor": "{{title}} par {{author}}",
  "vocab.book.untitledWithId": "Livre {{id}}...",
  "vocab.wordCount": "{{count}} mots",
  "vocab.synonymLabel": "Synonyme",
  "vocab.savedLabel": "Enregistré",
  "vocab.noTranslation": "Pas de traduction",
    
  // Quiz
  "vocab.quiz.notEnoughTitle": "Pas assez de mots pour un quiz",
  "vocab.quiz.notEnoughDescription": "Vous avez besoin d'au moins 4 mots pour un quiz. Apprenez plus de mots et revenez !",
  "vocab.quiz.completeTitle": "Quiz terminé !",
  "vocab.quiz.nextQuestion": "Question suivante",
  "vocab.quiz.showResults": "Afficher les résultats",
  "vocab.quiz.translateQuestion": "Que signifie ce mot ?",
  "vocab.quiz.definitionQuestion": "Quel mot correspond à cette définition ?",
  "vocab.quiz.progressLabel": "Progrès",
  "vocab.quiz.questionCount": "{{current}} sur {{total}} questions",
  "vocab.quiz.points": "Points : {{score}}/{{max}}",
  "vocab.quiz.score.excellent": "Excellent ! Vous connaissez très bien vos mots !",
  "vocab.quiz.score.good": "Bien joué ! Continuez !",
  "vocab.quiz.score.okay": "Pas mal, mais il y a place à l'amélioration.",
  "vocab.quiz.score.try": "Continuez à pratiquer ! Les mots finiront par s'ancrer.",
    
  // Cards
  "vocab.cards.emptyTitle": "Aucun mot à étudier",
  "vocab.cards.emptyDescription": "Ajoutez d'abord des mots à votre vocabulaire !",
  "vocab.cards.completeTitle": "Cartes terminées !",
  "vocab.cards.known": "Connu",
  "vocab.cards.unknown": "Inconnu",
  "vocab.cards.skipped": "Ignoré",
  "vocab.cards.clickToFlip": "Cliquez pour retourner",
  "vocab.cards.skip": "Ignorer",
  "vocab.cards.unknownBtn": "Je ne savais pas",
  "vocab.cards.knownBtn": "Je savais",
  "vocab.cards.flipHint": "Cliquez sur la carte pour voir la traduction",
  "vocab.cards.rateHint": "Évaluez vos connaissances sur ce mot",
    
  // Common extra
  "delete": "Supprimer",
  "back": "Retour",
  "retry": "Réessayer",

  // Not found
  "notFound.title": "Oops! Page not found",
  }
};

export type TranslationKey = keyof typeof translations.de;
export type Locale = keyof typeof translations;

let currentLocale: Locale = 'de';

// Create a custom event dispatcher to notify components of locale changes
const localeChangeEvent = new Event('localeChanged');

export const setLocale = async (locale: Locale) => {
  currentLocale = locale;
  window.dispatchEvent(localeChangeEvent);

  // Persist locale locally for unauthenticated users
  try {
    localStorage.setItem('locale', locale);
  } catch {}

  // Persist locale to user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Only update if the value actually changes to avoid 429 rate limits
    const currentLang = user.user_metadata?.language;
    if (currentLang !== locale) {
      try {
        await supabase.auth.updateUser({ data: { language: locale } });
      } catch (e) {
        // Best-effort: ignore rate-limit errors
        console.warn('Skipping locale update (possibly rate-limited):', e);
      }
    }
  }
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

export const initLocale = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const userLang = user?.user_metadata?.language;

  if (userLang && translations[userLang as Locale]) {
    await setLocale(userLang as Locale);
    return;
  }

  // Fallback: load from localStorage for unauthenticated users
  try {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && translations[stored]) {
      await setLocale(stored);
    }
  } catch {}
};