# Future Enhancements - MamaLearnsEnglish

## TTS Voice Availability Issue

**Date**: January 27, 2025  
**GitHub Version**: b391a1c  
**Priority**: Medium  
**Category**: Cross-Platform Compatibility  

### Issue Description
The Web Speech API only uses system-installed TTS voices. On systems without English voices installed (e.g., German Windows systems), the application falls back to German or other non-English voices, degrading the learning experience for English language learners.

### Current Status
- ✅ **ReadAlongInterface**: Enhanced voice selection with priority list
- ✅ **ConversationTutor**: Basic voice selection (needs enhancement)
- ❌ **No fallback**: Systems without English voices use German/other languages
- ✅ **Detection**: Console shows "No English voice found, using default"

### Affected Files
- `src/components/ReadAlongInterface.tsx` (lines 245-282)
- `src/components/ConversationTutor.tsx` (lines 52-58)

### Proposed Solutions

#### 1. User Notification System (MVP - Current Priority)
- Add toast notification when no English voices detected
- Provide OS-specific instructions for installing English TTS voices
- Guide users through: Settings > Time & Language > Speech > Add voices

#### 2. Cloud TTS Fallback (Future)
- Implement fallback to cloud TTS when no English voices available
- Options: Google Cloud TTS, Azure Cognitive Services, Amazon Polly
- Free tiers available: 4M chars/month (Google), 500K chars/month (Azure)

#### 3. Offline TTS Integration (Advanced)
- Integrate lightweight TTS models (Kokoro-82M, CosyVoice 2, Edge-TTS)
- Bundle English voices with application
- Larger app size but guaranteed English voice availability

### Implementation Notes
- Web Speech API limitation is fundamental - cannot be circumvented
- Different platforms have different voice ecosystems:
  - **macOS**: Excellent English voices (Samantha, Alex, Victoria)
  - **Windows**: Requires manual installation (Zira, David)
  - **Linux**: Limited voice options
  - **Chrome OS**: Google voices available

### User Impact
- **High**: Non-English systems cannot use app effectively without manual setup
- **Medium**: Technical users can install voices
- **Low**: Systems with English voices work perfectly

### Next Steps
1. Add notification system for MVP
2. Create user guide for voice installation
3. Evaluate cloud TTS options for v2.0
4. Consider offline TTS bundling for enterprise version

---

## Other Future Enhancements

### Reading Experience
- [ ] Chapter-based progress tracking
- [ ] Bookmark system
- [ ] Reading speed analytics
- [ ] EPUB metadata display

### Vocabulary System  
- [ ] Spaced repetition algorithm
- [ ] Export vocabulary lists
- [ ] Pronunciation practice mode
- [ ] Visual vocabulary progress

### Conversation Features
- [ ] Conversation history review
- [ ] Speaking accuracy scoring
- [ ] Custom conversation topics
- [ ] Multi-turn conversation complexity

### Technical Improvements
- [ ] Offline mode support
- [ ] Progressive Web App (PWA)
- [ ] Mobile app versions
- [ ] Performance optimizations
