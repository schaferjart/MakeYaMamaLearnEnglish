// This shows the notification code to add to both ReadAlongInterface.tsx and ConversationTutor.tsx

// For ReadAlongInterface.tsx - replace lines 280-282:
if (selectedVoice) {
  console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
  utterance.voice = selectedVoice;
} else {
  console.log('No English voice found, using default');
  toast({
    title: "No English Voice Available",
    description: "Please install English TTS voices in your system settings for the best experience. Go to Settings > Time & Language > Speech > Add voices.",
    variant: "destructive",
  });
}

// For ConversationTutor.tsx - replace the voice selection section:
// Priority list of known good English voices
const preferredVoices = [
  'Samantha', 'Alex', 'Victoria', 'Karen', 'Susan', // macOS
  'Microsoft Zira - English (United States)', 'Microsoft David - English (United States)', // Windows
  'Google US English', 'Google UK English Female', 'Google UK English Male', // Chrome
  'English United States', 'English (US)', // Generic
];

// First try to find a preferred voice
let selectedVoice = voices.find(voice => 
  voice.lang.startsWith('en') && 
  preferredVoices.some(preferred => voice.name.includes(preferred))
);

// Fallback: any English voice that's not German-accented
if (!selectedVoice) {
  selectedVoice = voices.find(voice => 
    voice.lang.startsWith('en') && 
    !voice.name.toLowerCase().includes('german') &&
    !voice.name.toLowerCase().includes('deutsch')
  );
}

// Last resort: any English voice
if (!selectedVoice) {
  selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
}

if (selectedVoice) {
  console.log(`Selected conversation voice: ${selectedVoice.name} (${selectedVoice.lang})`);
  utterance.voice = selectedVoice;
} else {
  console.log('No English voice found for conversation, using default');
  // Note: toast would need to be imported in ConversationTutor.tsx
}
