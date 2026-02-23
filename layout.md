# UI Layout & Animation System — MVP

## 1. Design Philosophy

- Minimal
- Premium
- Fast
- No visual clutter
- One primary action per screen

Animation Language:
- iOS-style spring physics
- Non-linear easing
- Subtle bounce
- Staggered entrances
- Soft blur transitions
- Micro-delight, not circus

---

# 2. Home Screen (Default Screen)

## Layout Structure

### Top Left
- Circular Profile Icon
- Below it (small text): “Sign Out”
- Tapping profile icon → Immediate sign out (no modal in V1)

### Center (Dynamic Area)

Two states:

---

### A First-Time User (Post-Auth)

Display:
- Preference Selection Tiles (grid layout, 2-column)
- Rounded, soft shadow, tactile
- Categories (e.g., Tech, Debate, Daily Life, Business, Abstract)

Interaction:
- Tap to select
- Subtle scale-down on tap (0.96)
- Selected tile glows slightly
- Once confirmed → tiles animate out
- Preferences locked permanently

Exit Animation:
- Tiles shrink slightly
- Fade + blur upward
- Staggered exit (60ms delay between tiles)

---

### B Returning User (Normal State)

Center shows:

"Daily Prompt Teaser Card"

- Glassmorphic card
- Slight floating idle animation
- Displays:
  - “Ready to sharpen your thinking?”
  - Or rotating micro-copy
- Subtle parallax shift on tilt (if supported)

Card reacts to scroll or tap with slight depth compression.

---

### Bottom

Primary CTA:
- Large pill-shaped button
- Label: “Start Recording”
- Anchored bottom center
- Elevated with soft shadow
- Slight breathing animation (very subtle scale 1 → 1.02 → 1)

Tap Interaction:
- Compress to 0.94 scale
- Spring release
- Screen transitions

---

# 3. Recording Flow Animation

## Start Recording Transition

On tap:
- Background subtly darkens
- Center content scales down slightly
- Countdown appears center

Countdown:
- Large numeric typography
- Each number:
  - Drops in from above
  - Slight bounce on settle
  - Fades quickly into next number

Recording Start:
- Micro haptic feedback (if supported)
- Red pulse ring appears around center waveform

---

# 4. Recording Screen Layout

Center:
- Live waveform visualization
  - Smooth, liquid motion
  - Slight glow
  - Minimal color

Below waveform:
- Elapsed time counter

Bottom:
- Stop Button
  - Circular
  - Red
  - Pulsing subtle glow

No extra UI.
No distractions.

---

# 5. Processing Screen

After stop:

Waveform shrinks into center
Blur background
Loader appears

Loader style:
- Smooth rotating arc
- Not spinning harshly
- Slight easing acceleration

Text:
“Analyzing structure…”

Dots animate in stagger.

---

# 6. Feedback Screen Layout

## Entry Animation

Entire screen slides in slightly from right
With soft fade
Spring finish

---

## Section A — Metrics (Top)

Horizontal metric cards
Each animates upward with staggered delay (80ms)

Each metric:
- Counts up number (animated)
- Small bounce on finish

---

## Section B — Timestamp List

Cards stacked vertically
Each enters with:
- Slight upward motion
- Fade in
- Staggered reveal

Clicking:
- Card expands smoothly
- Audio jumps
- Soft ripple effect

---

## Section C — Transcript Dropdown

Collapsed by default.

On expand:
- Smooth height expansion
- Content fades in slightly delayed

Red / Green Highlights:
- Tap triggers:
  - Small tooltip scale-in
  - Soft background blur behind tooltip
  - Tooltip bounces lightly on entry

Tooltip closes on outside tap.

---

# 7. Motion System Rules

## Global Motion Specs

- Use spring-based transitions, not linear ease
- Duration range: 180ms – 450ms
- Stagger spacing: 50–100ms
- No abrupt cuts
- Every major state change should feel physical

## Micro-Interactions

Buttons:
- Always compress on tap
- Slight overshoot when released

Cards:
- Slight shadow intensifies on press
- Very subtle 3D depth illusion

---

# 8. What NOT to Do

- No heavy particle effects
- No loud animations
- No spinning neon nonsense
- No gamified confetti
- No overly long transitions

Premium = restrained.

---

# 9. Emotional Tone of the UI

The UI should make the user feel:

- Calm
- Focused
- Slightly elite
- Like they are training something serious

Not like they’re playing a language game.
Not like they’re on TikTok.

This is a mental gym.