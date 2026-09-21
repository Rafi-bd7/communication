# Adda — স্মার্ট আলাপ, যেকোনো জায়গায়।
> **Professional Communication Web App — A to Z Product & Engineering Blueprint Implementation**  
> Responsive Web App + PWA + WebRTC Calls + FastAPI + SQLite / PostgreSQL + AI Assistant + Bangla-First Experience

---

## 🌟 Brand Vision
- **Brand**: **Adda (আড্ডা)**
- **Tagline**: **"স্মার্ট আলাপ, যেকোনো জায়গায়।"** *(Smart Conversation, Anywhere.)*
- **Core Philosophy**: *"Simple to start, powerful when needed."*
- **Cultural Identity**: Bangla-first personality, culturally authentic microcopy, and 1-click **বাংলা ⇄ English** language toggle.

---

## 🚀 Key Features

### 1. 🏠 Addabari (আড্ডাবাড়ি) Dashboard
- Personal communication hub featuring pinned & favorite conversations.
- Quick statistical highlights: মোট আড্ডা (Total Chats), অপঠিত বার্তা (Unread), সক্রিয় রুম (Active Rooms), পিন করা আড্ডা (Pinned).
- Category filter chips: সব, ☕ বন্ধু-আড্ডা, 📚 পড়াশোনা, 💼 কাজ, 🚀 প্রজেক্ট.
- Direct jump into active rooms and bookmarked collections.

### 2. ⚡ Quick Adda (ঝটপট আড্ডা) & Rooms
- 1-tap instant group room creator with topic tagging:
  - ☕ **বন্ধু-আড্ডা** (Friends)
  - 📚 **পড়াশোনা** (Study)
  - 💼 **কাজ** (Work)
  - 🚀 **প্রজেক্ট** (Project)
- Shareable invitation code and instant joining link.

### 3. 📋 Shared Board (শেয়ার্ড বোর্ড)
- In-room collaborative drawer for group chats:
  - **Pinned Notices (পিন করা নোটিশ)**: Important announcements.
  - **Collaborative Checklist (কাজের তালিকা)**: Real-time task tracker.
  - **Quick Polls (রুম পোল)**: Instant group voting widget.

### 4. 🔖 Message Collections (সংগ্রহ)
- Private bookmarking drawer to store essential messages, files, and links.
- Filter by: সব বার্তা, জরুরি, ছবি ও ফাইল, লিংকসমূহ.

### 5. 🛡️ Privacy Snapshot & Trusted Devices
- Control who sees profile picture and last seen / online presence.
- View active login sessions and remote logout capability.
- **Quiet Hours (নীরব সময়)**: Schedule automated DND (Do-Not-Disturb) hours to silence notifications.

### 6. 💬 Core Real-time Communication
- 1-to-1 & Group Chat powered by WebSockets with delivery states (পাঠানো হচ্ছে → পাঠানো হয়েছে ✓ → পৌঁছেছে ✓✓ → দেখা হয়েছে ✓✓).
- WebRTC Peer-to-Peer Voice & Video calls with camera switch, mute, and screen share.
- 24-Hour Stories (মুহূর্ত) with text, images, video, and view count.
- Media sharing with instant previews & voice notes with inline waveform player.
- Contextual emoji reactions (`👍`, `❤️`, `😂`, `🔥`, `😮`, `😢`) & quoted replies.

### 7. 🤖 Antigravity AI Assistant
- **Smart Replies**: Contextual 1-click answer pills suggested dynamically based on the latest chat messages.
- **Chat Summarizer**: Generates concise highlights and decisions from active conversations.
- **Message Translator**: Translates messages instantly into Bangla, English, and other languages.
- **AI Helper**: In-app assistant for drafting responses and answering questions.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) + React 18 + TypeScript | Responsive, modern web application |
| **Styling & Icons** | Tailwind CSS + Lucide React | Curated WhatsApp/Telegram dark mode aesthetics |
| **Localization (i18n)** | Custom lightweight React i18n hook (`web/lib/i18n.ts`) | Instant বাংলা ⇄ English switching |
| **Realtime Engine** | WebSockets | Live chat, typing indicators, presence, and WebRTC signaling |
| **Voice / Video** | WebRTC + STUN (`stun.l.google.com:19302`) | Peer-to-peer real-time media transport |
| **Backend API** | Python 3.11 + FastAPI + Uvicorn | RESTful API, WebSocket Hub, and AI services |
| **Database** | SQLAlchemy Async + SQLite (default) / PostgreSQL | Relational models and durable message persistence |
| **Authentication** | JWT (Bearer tokens) + Bcrypt password hashing | Secure session management |
| **PWA Layer** | Service Worker + Web App Manifest | Installability on Android, iOS, Windows, Mac |

---

## ⚡ Quick Start

### Method 1: One-Click Windows Launcher
Double-click **`start.bat`** (or run `.\run_dev.ps1` in PowerShell). This launches:
- FastAPI backend on **`http://localhost:8000`**
- Next.js web application on **`http://localhost:3000`**

### Method 2: Manual Start

1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```

2. **Start Frontend**:
   ```bash
   cd web
   npm install
   npm run dev
   ```

### Method 3: Docker Compose
```bash
docker-compose up --build
```

---

## 👤 Ready Demo Accounts (Password for all: `password123`)

- **Alice Johnson (User 1)**: `alice` (ডিজাইন ও আড্ডা ভালোবাসি 🎨)
- **Bob Smith (User 2)**: `bob` (ফুলস্ট্যাক ইঞ্জিনিয়ার 🚀)
- **Platform Admin**: `admin` (আড্ডা প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর 🛡️)

> 💡 **Tip:** Open `alice` on your PC and `bob` on your mobile phone or incognito tab to test real-time chat, voice notes, calls, and room updates!
