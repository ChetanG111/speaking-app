# Product Requirements Document (PRD) — MVP

## Product Name
AI Structured Speaking Trainer (Working Title)

---

## 1. Objective

Validate that users feel measurable improvement in speech clarity, structure, and articulation after up to 5 guided speaking sessions.

Core Validation Question:
> Does structured, AI-guided speaking practice + timestamp-level feedback make users feel more articulate and organized while speaking?

If not validated → pivot or kill.

---

## 2. Target Users

**Primary Segment**
Students and early professionals (16–28) who:
- Struggle to structure thoughts while speaking
- Ramble or lose train of thought
- Want to improve articulation for interviews, debates, presentations, or content creation

**Explicit Non-Target**
- Clinical stuttering cases
- Accent training users
- Speech therapy use cases

---

## 3. Core Hypothesis

If users:
- Are guided with structured AI-generated speaking points
- Are placed under timed speaking constraints
- Receive timestamp-based corrective feedback

Then they will:
- Speak more linearly
- Reduce filler words
- Feel more confident and articulate

---

## 4. User Flow (MVP)

### 4.1 Authentication

- Google OAuth only
- Firebase Authentication
- No email/password
- Free usage
- Maximum 5 recordings per user (hard backend limit)

---

### 4.2 Onboarding (One-Time Only)

User selects predefined topic preferences (e.g., tech, business, daily life, abstract thinking, debate, etc.).

Constraints:
- Preferences cannot be edited in V1
- Preferences stored in Firebase
- Used for AI topic generation

No profile editing in V1.

---

### 4.3 Session Flow

#### Step 1 — Start
- User presses “Start”

#### Step 2 — Topic Generation
- AI generates topic list based on onboarding preferences
- User selects one topic

#### Step 3 — Structure Generation
- AI generates structured ordered points (example):
  - Hook
  - Point 1
  - Point 2
  - Conclusion

#### Step 4 — Countdown
- Fixed countdown timer runs
- Recording auto-starts after countdown

#### Step 5 — Recording
- Fixed duration recording
- User can:
  - Stop manually
  - Or auto-stop after time limit

---

## 5. AI Processing

After recording:

System performs:
- Speech-to-text transcription
- Filler word detection
- Words-per-minute (WPM) calculation
- Pause detection
- Structure adherence analysis

---

## 6. Feedback Screen

### 6.1 Section A — Visual Metrics (Minimalist)

Displayed in clean, bold format:

- Filler Word Count
- Speaking Speed (WPM)
- Pause Density
- Structure Completion Score

No long explanations.

---

### 6.2 Section B — Timestamp Feedback

List format:

Examples:
- 00:17 — Filler word spike
- 00:42 — Strong transition
- 01:05 — Long hesitation

Clicking a timestamp:
- Playback jumps to that moment

---

### 6.3 Section C — Transcript View (Collapsible)

Collapsed by default.

When expanded:
- Red highlights → filler words, hesitation, weak structure
- Green highlights → strong transitions, clarity

Clicking highlighted word:
- Tooltip appears
- Short explanation + micro tip

No long essays.

---

## 7. Technical Scope (V1)

### 7.1 Authentication
- Google OAuth via Firebase

### 7.2 Database
- Firebase Firestore

Stored Data:
- User ID
- Onboarding preferences
- Recording metadata
- Transcript
- Metrics
- Timestamp feedback
- Raw analysis stats

No progress dashboard in V1.

---

## 8. Usage Limits

- 5 recordings maximum per user
- Limit enforced on backend

---

## 9. Non-Goals (Strictly Excluded from V1)

- Preference editing
- Gamification
- Streaks
- Social sharing
- Community features
- Subscription system
- Leaderboards
- Progress graphs
- Advanced personalization

This MVP is a validation engine — not a full product.

---

## 10. Success Metrics

### Quantitative
- 50%+ users complete at least 3 recordings
- 30%+ users complete all 5 recordings
- High engagement with timestamp playback

### Qualitative
Users report:
- Clear, actionable feedback
- Increased confidence
- Improved structure in speech

If feedback feels generic or improvement is not perceived → reassess positioning and feedback engine.