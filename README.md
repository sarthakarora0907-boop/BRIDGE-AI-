# 🚀 BRIDGE AI

### Turn messy problems into clear next steps.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bridge--ai--three.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://bridge-ai-three.vercel.app)

> **[▶ Try Bridge AI Live →](https://bridge-ai-three.vercel.app)**

BRIDGE AI is a Gemini-powered AI application that converts messy, real-world user problems into **structured, understandable, and actionable guidance**.

Instead of requiring users to understand complex systems first, BRIDGE AI starts with their natural-language intent and helps them figure out **what is happening, what matters, and what to do next**.

---

## ✨ What BRIDGE AI Does

Users can describe a situation naturally, for example:

> **"My passport application is stuck. What should I do?"**

or:

> **"There's flooding near me. What should I do?"**

BRIDGE AI analyzes the request and provides:

- 🧠 What it understands
- 📌 Key information
- ✅ Verified information
- ⚠️ Information that needs confirmation
- 🎯 Recommended action
- 🪜 Step-by-step guidance
- 🚨 Important warnings
- 🔗 Useful resources
- 📊 Confidence level
- 📋 Copy result & ⬇️ Download as .txt

### Core Flow

```text
User Input
    ↓
Intent & Context Understanding
    ↓
Gemini AI Analysis
    ↓
Structured Response
    ↓
Clear Next Steps
```

---

## 💡 Example Use Cases

**🛂 Passport & Government Services**  
Understand complicated application problems and identify possible next steps.

**📄 Documents**  
Help users understand notices, forms, and other important documents.

**🌊 Emergencies**  
Provide safety-focused general guidance while highlighting the need to confirm current official information.

**🧳 Travel Problems**  
Turn confusing travel situations into clear actions.

---

## 🔐 Safety & Trust

BRIDGE AI is designed to clearly communicate uncertainty instead of presenting every AI-generated statement as a verified fact.

For sensitive situations, it encourages users to confirm information through appropriate **official or professional sources**.

The Gemini API key is kept server-side using environment variables and is **never exposed to the browser**.

> ⚠️ **Never commit or publicly expose your API key.** Add `.env.local` to `.gitignore` (already configured).

---

## 🛠️ Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Google Gemini**
- **Vanilla CSS** (CSS Modules + custom design system)
- **Jest**
- **Vercel**

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/sarthakarora0907-boop/BRIDGE-AI-.git
cd BRIDGE-AI-
```

### 2. Install

```bash
npm install
```

### 3. Add Gemini API Key

Create `.env.local` (this file is git-ignored — never commit it):

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Live production:** [https://bridge-ai-three.vercel.app](https://bridge-ai-three.vercel.app)

---

## 🎯 Built For

**PromptWars × Google Developers — Build with AI**

BRIDGE AI explores how AI can act as a **universal bridge between human intent and complex systems**, helping people move from confusion to clear, actionable next steps.

---

## 👨‍💻 Author

**Sarthak Arora**

Built with ❤️ using Google Gemini.

