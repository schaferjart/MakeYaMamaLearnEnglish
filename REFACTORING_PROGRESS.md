# Codebase Refactoring Documentation

## Overview
This document tracks the systematic refactoring of the MamaLearnsEnglish codebase to improve maintainability, testability, and code organization through modularization and separation of concerns.

## Refactoring Principles Applied

### 1. Single Responsibility Principle
Each module/hook should have one clear purpose and handle one specific concern.

### 2. DRY (Don't Repeat Yourself)
Extract common functionality into reusable hooks and utilities.

### 3. Testability
Isolated modules are easier to test. Each extracted hook includes comprehensive tests.

### 4. Minimal Changes
Refactoring is done incrementally with minimal risk. Each change is independently tested.

## Completed Refactorings

### Phase 1: Session Timer Hook (Completed)

#### Created: `src/hooks/useSessionTimer.tsx`
**Lines**: 83 (including documentation and tests)
**Purpose**: Reusable countdown timer with expiry callbacks
**Test Coverage**: 6 test cases
- Timer initialization
- Time formatting
- Start/stop functionality
- Countdown behavior
- Expiry callback invocation
- Dynamic time updates

**API**:
```typescript
const { 
  remainingTime,      // Current time remaining (seconds)
  isTimerActive,      // Whether timer is running
  startTimer,         // Start countdown
  stopTimer,          // Stop countdown
  formatTime          // Format seconds as mm:ss
} = useSessionTimer({ 
  initialTime: 300,   // 5 minutes
  onTimeExpired: () => { /* callback */ }
});
```

**Benefits**:
- ✅ Fully tested in isolation
- ✅ Reusable across components
- ✅ Handles cleanup automatically
- ✅ Simple, clear API
- ✅ TypeScript type safety

#### Refactored: `src/components/ReadAlongInterface.tsx`
**Before**: 530 lines
**After**: 506 lines
**Reduction**: 24 lines (4.5%)

**Changes Made**:
1. Replaced local timer implementation with `useSessionTimer` hook
2. Removed duplicate timer logic:
   - `formatTime` function (now from hook)
   - `startTimer` callback (now from hook)
   - `stopTimer` callback (now from hook)
   - `timerRef` ref (managed by hook)
   - Timer expiry useEffect (handled by hook callback)
3. Simplified state management:
   - Removed `isTimerActive` state (from hook)
   - Removed `remainingTime` state (from hook)
4. Updated session time buttons to work with hook's reactive `initialTime`

**Impact**:
- ✅ Less code in component
- ✅ Timer logic now independently testable
- ✅ Same timer can be reused in ConversationTutor
- ✅ Clearer component structure
- ✅ No functionality changes
- ✅ All tests passing
- ✅ Build successful

## Potential Future Refactorings

### High Priority: Additional Hook Extractions

#### 1. Apply useSessionTimer to ConversationTutor
**File**: `src/components/ConversationTutor.tsx` (580 lines)
**Opportunity**: Has duplicate timer logic similar to ReadAlongInterface
**Complexity**: Medium (tracks elapsed time too)
**Impact**: ~20-30 line reduction, consistency across components

#### 2. Extract TTS Logic
**Files**: ReadAlongInterface, ConversationTutor
**Opportunity**: Both components have custom TTS implementations
**Note**: `useTextToSpeech` hook exists but doesn't support all needed features
**Options**:
- Extend existing `useTextToSpeech` hook
- Create new `useReadAlongTTS` hook with rate/volume/voice controls
**Impact**: ~50-70 line reduction per component

#### 3. Extract STT (Speech-to-Text) Logic
**File**: `src/components/ConversationTutor.tsx`
**Opportunity**: STT logic is embedded in component
**Impact**: ~40-60 line reduction, reusable for future features

### Medium Priority: Component Decomposition

#### 1. Break Down ReadAlongInterface (506 lines)
**Sub-components to extract**:
- ReadingControls (play/pause/stop/skip buttons)
- TimerPanel (session timer display and controls)
- SentenceNavigator (sentence display and navigation)
- TTSControls (speed, volume sliders)

**Estimated impact**: Component reduced to ~200-250 lines

#### 2. Break Down ConversationTutor (580 lines)
**Sub-components to extract**:
- MessageList (conversation history display)
- InputControls (text input + voice recording)
- ConversationTimer (timer display)
- AudioRecorder (recording controls and visualization)

**Estimated impact**: Component reduced to ~250-300 lines

#### 3. Modularize Index.tsx (408 lines)
**Sub-components to extract**:
- BookLibrary (book grid/list display)
- DashboardView (stats and quick actions)
- ReadingView (reading session management)

**Estimated impact**: Component reduced to ~150-200 lines

### Lower Priority: Utility Extractions

#### 1. Sentence Processing Utilities
**File**: ReadAlongInterface
**Opportunity**: ~50 lines of sentence parsing logic
**Extract to**: `src/lib/sentenceParser.ts`
**Benefits**: Testable in isolation, reusable for other text processing

#### 2. Voice Selection Logic
**Files**: ReadAlongInterface, ConversationTutor
**Opportunity**: Duplicate voice selection code
**Extract to**: `src/lib/voiceSelection.ts`
**Benefits**: Consistent voice selection across app

## Guidelines for Future Refactoring

### When to Extract a Hook
- Logic is reused or could be reused in multiple components
- Logic has clear inputs and outputs
- Logic manages state independently
- Logic would benefit from isolated testing

### When to Extract a Component
- UI section has clear visual boundaries
- Section could be reused elsewhere
- Section has its own local state
- Parent component exceeds ~300 lines

### When NOT to Refactor
- Code is working and not changing frequently
- Extraction would make code harder to understand
- Component is already small and focused
- No clear reusability or testability benefit

## Testing Strategy

### For Each Hook Extraction
1. Create comprehensive unit tests for the hook
2. Ensure hook works in isolation
3. Refactor component to use hook
4. Verify all existing tests still pass
5. Build and check for TypeScript errors
6. Manual testing of affected functionality

### For Each Component Extraction
1. Extract component with minimal changes
2. Ensure props interface is clear
3. Test component in isolation
4. Test component in parent context
5. Verify accessibility
6. Check responsive behavior

## Metrics

### Current State (After Phase 1)
- **Large files (>300 lines)**: 4
  - ConversationTutor.tsx: 580 lines
  - ReadAlongInterface.tsx: 506 lines (reduced from 530)
  - Index.tsx: 408 lines
  - useReadingProgress.tsx: 295 lines

- **New reusable hooks**: 1
  - useSessionTimer.tsx: 83 lines (with tests)

- **Test coverage**: All tests passing (14/14)
- **Build status**: Successful
- **Bundle size**: 985.68 KB (gzipped: 296.88 KB)

### Success Criteria
- ✅ No regression in functionality
- ✅ All tests passing
- ✅ Build successful
- ✅ Code more modular and testable
- ✅ Clear improvement in maintainability

## Conclusion

The refactoring is proceeding incrementally with a focus on minimal risk and maximum benefit. Each change is independently tested and verified. The extraction of `useSessionTimer` demonstrates the approach and sets a pattern for future extractions.

**Next Steps**: Continue with Option A (extract more hooks) or proceed to component decomposition based on project priorities.
