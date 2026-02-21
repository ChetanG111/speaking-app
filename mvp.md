# FluentArena – MVP Product Specification (v0.1)

## 1. Product Definition

FluentArena is a gamified speaking performance training web application (PWA).

The app trains structured spontaneous English speaking by measuring:
- Fluency
- Filler density
- Repetition
- Coherence
- Longest fluent streak

This is a personal-use MVP intended for daily usage. Scope is intentionally limited to validate the core loop.

---

## 2. Platform & Architecture

### Platform
- Web application built using Next.js (App Router).
- Must function as a Progressive Web App (PWA).
- Installable via "Add to Home Screen".
- Fully responsive (mobile-first design).
- Optimized primarily for mobile devices.

### Frontend Stack
- Next.js 
- TailwindCSS
- Framer Motion (animations)
- Web Audio API (recording)
- Lightweight charting library (e.g., Recharts)

### Backend / Services
- Speech-to-text: Whisper API (post-recording processing only).
- Database: Firebase.
- Have access to gemini-api credits for free for testing phases

### Data Storage
Store:
- Transcript
- Computed metrics
- XP
- Streak
- Historical session data

Raw audio:
- Used for processing only.
- Not stored permanently in MVP.

---

## 3. Core Session Flow

1. User lands on Dashboard.
2. User swipes up to start session.
3. Topic and bullet prompts are generated.
4. 45-second preparation timer begins.
5. Recording screen loads automatically after prep.
6. User records speech (minimum 2 minutes).
7. User taps Stop.
8. Audio is processed.
9. Analysis screen is displayed.
10. User selects retry option or new topic.

---

## 4. Core Screens

### 4.1 Dashboard

Displays:
- Current streak
- Total XP
- Level
- Personal best (Longest Fluent Streak)
- Primary CTA: “Start Session”

Gestures:
- Swipe up → Start Session
- Swipe left → Progress Screen

---

### 4.2 Prep Screen

Displays:
- Topic (single sentence)
- 5–10 bullet prompts (each 5–10 words)
- Countdown timer (45 seconds default)

Rules:
- Prep time decreases as user level increases.
- User cannot extend prep time.
- When timer reaches zero → Recording screen loads automatically.

---

### 4.3 Recording Screen

UI Elements:
- Timer (top center)
- Live waveform visualization
- Stop button (bottom center)

Gestures:
- Swipe down → Cancel session
- Tap Stop → End recording

Constraints:
- Minimum speaking duration: 2 minutes.
- No real-time analysis.
- Minimal UI, no distractions.

---

### 4.4 Analysis Screen

Post-recording processing only.

Metrics displayed:

1. Words Per Minute (WPM)
2. Filler Words Per Minute
3. Repetition Score
4. Fluency Score
5. Longest Fluent Streak (seconds)
6. Coherence Score (0–10)

Each metric must display:
- Current value
- Previous session value
- Up/Down indicator (trend)

XP counter animates upward.

Sections:

- Performance Summary
- Top 3 Mistakes
- Strongest Moment
- Suggested Drill

Transcript:
- Hidden by default
- Expandable
- Filler words highlighted
- Repeated phrases highlighted

Buttons:
- Retry Same Topic (new bullet variation)
- Retry Same Topic (No Prep Mode)
- New Topic
- Back to Dashboard

---

### 4.5 Progress Screen

Displays:
- Filler trend graph (last 30 sessions)
- WPM trend graph
- Fluency streak trend
- Current streak (days)

Gestures:
- Swipe right → Dashboard

---

## 5. Topic System

Initial flow:
- User manually selects category.

Categories:
- Technology
- Philosophy
- Business
- Personal Growth
- Abstract Thinking
- Debate

Topic generation:
- AI generates 1 topic.
- AI generates 5–10 bullet prompts.

Difficulty scaling:
- Easy → Familiar concrete topics.
- Medium → Structured argument topics.
- Hard → Abstract or contradictory prompts.

Adaptation:
- AI gradually increases difficulty based on all different past metrics.


---

## 6. Analysis Engine Definitions

### 6.1 Words Per Minute (WPM)
Total words spoken divided by total speaking minutes.

---

### 6.2 Filler Words

Predefined dictionary:
- um
- uh
- like
- you know
- basically
- actually
- literally
- kind of
- sort of
- I mean
- so (when used as filler)
- repeated phrases that make it seem robotic

Outputs:
- Total filler count
- Filler words per minute
- Highlighted in transcript

---

### 6.3 Repetition Score

Detect:
- Repeated 2–5 word n-grams
- Repeated sentence structure patterns
- Redundant recurring phrases

Score:
- Scale 0–10
- Lower repetition = higher score

---

### 6.4 Fluency Score

Based on:
- Average pause duration
- Long hesitation pauses
- Sudden WPM drops

Metrics:
- Average pause length
- Longest hesitation pause
- Longest uninterrupted fluent streak (seconds)

Fluency Score:
- Scale 0–10

---

### 6.5 Coherence Score (0–10)

Rubric:
- Clear introduction (2 points)
- Logical grouping of ideas (3 points)
- Smooth transitions (3 points)
- Clear conclusion (2 points)

AI must justify coherence score with textual explanation.

---

## 7. Gamification System

XP awarded for:
- Completing session
- Speaking 2+ minutes
- Personal best WPM
- Personal best fluent streak
- Filler below personal average
- Maintaining 7-day streak

Levels:
- XP threshold increases per level.
- Higher levels reduce prep time.
- Unlocks:
  - No-prep mode
  - Hard topics

Streak:
- Daily completed session = +1
- Missing a day resets streak

No leaderboard in MVP.

---

## 8. Gesture Navigation

- Swipe up → Start Session
- Swipe left/right → Dashboard ↔ Progress
- Swipe down during recording → Cancel
- Long press on metric → Expand explanation

No bottom navigation bar.

---

## 9. Design System

check: P:\speaking-app\design-inspo.html for design inspiration - follow this for first version while we get the basic functionality of the app working and then we can improve the design

### Visual Style
- Deep charcoal background (#0B0B0F range)
- Soft glass-style cards
- Single accent color: Electric Blue
- No additional accent colors

### Typography
- Large bold headings
- Maximum two font weights
- Generous spacing
- No visual clutter

### Motion System
- Spring easing
- 250ms base animation duration
- 60ms stagger delay
- XP number rolls upward
- Record button subtle bounce effect

### Haptics
Trigger vibration on:
- Session start
- Personal best
- Level up

No excessive confetti.
Milestone-only celebration effects.

---

## 10. PWA Installation

- Service worker enabled.
- Offline shell support.
- "Install App" prompt shown after 2 completed sessions.

---

## 11. Authentication

MVP:
- Anonymous local account by default.
- Optional Google login.
- All progress stored in database.

---

## 12. Non-Goals (MVP)

- No leaderboard
- No social sharing
- No real-time analysis
- No long-term raw audio storage
- No advanced AI personalization beyond difficulty scaling

---

## 13. Core Differentiator

FluentArena is not a transcript tool.

It is a quantified structured-thinking performance lab with gamified fluency metrics and measurable speaking streak tracking.
