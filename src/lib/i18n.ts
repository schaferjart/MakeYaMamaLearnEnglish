import { supabase } from './integrations/supabase/client';

export const translations = {
  de: {
    // Navigation & General
    "app.title": "Make Ya Mama Learn English",
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
    
    // Authentication
    "auth.title": "Anmeldung",
    "auth.welcome": "Viele Mamas haben ihr lebenslang im Haushalt geaerbeitet und deswegen nie Englisch gebraucht und gelernt. Diese Mamas sind nun gefickt wenn sie in die Feerien gehen weil sie nichts verstehen.",
    "auth.description": "Die ersste App überhaupt für Mamas die endlich in die Ferien gehen wollen!",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.confirmPassword": "Passwort bestätigen",
    "auth.signIn": "Anmelden",
    "auth.signUp": "Registrieren",
    "auth.signOut": "Abmelden",
    
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
  },
  
  en: {
    // Navigation & General
    "app.title": "Make Ya Mama Learn English",
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
    
    // Authentication
    "auth.title": "Sign In",
    "auth.welcome": "Welcome to MamaLearnEnglish",
    "auth.description": "Improve your English through reading, listening and speaking",
    "auth.email": "Email",
    "auth.password": "Password", 
    "auth.confirmPassword": "Confirm Password",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.signOut": "Sign Out",
    
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
  },

  fr: {
    // Navigation & General
    "app.title": "Make Ya Mama Learn English",
    "app.subtitle": "Parlez l'anglais des immigrés en un rien de temps",
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

    // Tutor/Conversation
    "tutor.start": "Démarrer la conversation",
    "tutor.thinking": "Réflexion...",
    "tutor.typeResponse": "Tapez votre réponse...",
    "tutor.send": "Envoyer",

    // Authentication
    "auth.title": "Se connecter",
    "auth.welcome": "Bienvenue sur MamaLearnEnglish",
    "auth.description": "Améliorez votre anglais en lisant, en écoutant et en parlant",
    "auth.email": "E-mail",
    "auth.password": "Mot de passe",
    "auth.confirmPassword": "Confirmer le mot de passe",
    "auth.signIn": "Se connecter",
    "auth.signUp": "S'inscrire",
    "auth.signOut": "Se déconnecter",

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

  // Persist locale to user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.auth.updateUser({
      data: {
        language: locale,
      },
    });
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
  }
};