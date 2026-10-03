# 🌍 LinguaAI — AI-Powered English Language Mastery Platform

**LinguaAI** is an intelligent full-stack web application designed to systematically train and elevate all four core language skills: **Reading**, **Writing**, **Listening**, and **Speaking**, mapped against the internationally recognized **CEFR Framework (A1 to C2)**.

Built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, the **Google Gemini API**, and the browser's native **Web Speech API**.

---

## 🌟 Core Features & Modules

### 1. 📖 Reading Studio
- **Curated & Dynamic Passages**: Filter articles by CEFR proficiency level (A1 to C2) and topics.
- **On-Demand AI Article Generator**: Enter any custom topic (e.g., *Quantum Computing*, *Ancient Architecture*, *Space Exploration*) and Gemini AI creates a graded passage with custom vocabulary highlights and questions.
- **Interactive Click-to-Define**: Click on **any word** in any text to instantly display its IPA phonetic transcription, part of speech, contextual definition, and native pronunciation audio.
- **One-Click Vocabulary Saving**: Save unfamiliar words directly to your Spaced Repetition (SRS) vocabulary bank.
- **Reading Speed Tracker**: Measures your reading duration and computes your Words-Per-Minute (WPM).
- **Interactive Comprehension Quizzes**: Multiple-choice evaluations with detailed rationales for each option and instant XP rewards.

### 2. ✍️ Writing Studio & Essay Grader
- **Multi-Genre Writing Prompts**: Academic essays (IELTS Task 2), formal business correspondence, opinion editorials, and personal reflective journals.
- **Distraction-Free Workspace**: Real-time word counter, target progress indicators, and an integrated exam countdown timer (20m / 40m).
- **Comprehensive AI Evaluator (Gemini)**:
  - **Overall CEFR Band & Score**: Evaluated on an IELTS-equivalent 0–9.0 band scale.
  - **4-Pillar Score Breakdown**: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Accuracy.
  - **Interactive Error Inspector**: Highlights grammar mistakes, spelling slips, and awkward phrasing. Clicking "Apply Fix to Text" automatically edits your draft!
  - **Native Polish Comparison**: Shows an enhanced, idiomatic Oxford/Cambridge rewrite while preserving your ideas.

### 3. 🎧 Listening Lab
- **Multi-Accent Speech Engine**: Native audio generation in British (UK), American (US), and Australian (AU) accents using Web Speech API synthesis.
- **Variable Playback Speeds**: Toggle between 0.75x (slow/learner), 1.0x (natural), and 1.25x (challenge).
- **Sentence Dictation Challenge**: Listen sentence-by-sentence, type what you hear, and receive word-by-word accuracy validation (highlighting correct words vs omissions/typos).
- **Dialogue Comprehension**: Real-world situational conversations with blind listening toggles, soundwave animations, and comprehension quizzes.

### 4. 🎙️ Speaking Coach & Roleplay
- **Acoustic Phoneme Drills**: Targeted challenges for tricky English phonemes (/θ/ vs /ð/ dental fricatives, /r/ vs /l/, /v/ vs /w/, consonant clusters).
- **Voice Recognition & Phonetic Matching**: Speak into your microphone; the app transcribes your voice in real time and color-codes each word (Green = accurate, Yellow = close, Red = missed).
- **Turn-by-Turn AI Roleplay Partner**:
  - Scenarios: *London Cafe Barista*, *Tech Job Interviewer*, *Airport Customs Officer*, and *Debate Partner*.
  - Turn-based voice chat: Speak your turn &rarr; AI generates a contextual reply &rarr; AI speaks back aloud using voice synthesis!
  - Real-time coaching tips: Grammar corrections, more natural phrasing suggestions, and advanced vocabulary collocations.

### 5. 📚 Personal Vocabulary Bank & Spaced Repetition (SRS)
- **Flashcard Review Mode**: Spaced repetition memory reviews with "Hard" (+1d), "Good" (+3d), and "Easy" (+6d) rating intervals.
- **Instant AI Word Auto-Fill**: Type any English word and Gemini AI will populate the definition, IPA phonetics, CEFR difficulty, and example usage.
- **Audio Pronunciation**: 1-click audio playback for every stored vocabulary term.

### 6. 📊 Progress & CEFR Dashboard
- Comprehensive proficiency gauge tracking progress towards the next CEFR level milestone.
- Skill radar cards tracking Reading, Writing, Listening, and Speaking scores.
- Daily streak counter (🔥) and Experience Points (XP) gamification.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- Modern Web Browser: Google Chrome, Microsoft Edge, or Safari (for Web Speech API support)

### Running the Application

1. Open your terminal in the project directory:
   ```bash
   cd /Users/nishkarta/Documents/personal-projects/lingua-ai
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 AI Configuration (Google Gemini)

LinguaAI is designed with **zero-setup out-of-the-box readiness**:
- If no API key is provided, the application runs on a high-fidelity built-in simulation engine with full realistic evaluations and speech so you can test immediately.
- To connect live Google Gemini 1.5 Flash models:
  1. Click the **Settings (gear icon)** in the top right of the navigation bar.
  2. Paste your Google Gemini API key (obtainable for free from [Google AI Studio](https://aistudio.google.com/app/apikey)).
  3. Alternatively, add `GEMINI_API_KEY=your_key_here` to a `.env.local` file in the project root.
