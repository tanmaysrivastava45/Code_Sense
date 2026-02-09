# CodeSense

AI-powered code analysis platform with real-time collaboration features, built using Google Gemini 2.5 Flash API and Socket.io.

## 🔗 Live Demo

**Frontend:** [https://code-sense-mu.vercel.app](https://code-sense-mu.vercel.app/)  
**Backend API:** [https://codesense-ug9o.onrender.com](https://codesense-ug9o.onrender.com)


## 🌟 Features

### Solo Code Analysis
- 🔍 **Syntax Error Detection** - Find bugs and syntax issues instantly
- ⏱️ **Time Complexity Analysis** - Get Big O notation with detailed explanations
- 💾 **Space Complexity Analysis** - Understand memory usage patterns
- 📖 **Code Explanation** - Step-by-step breakdown of your code logic
- 💡 **Smart Improvements** - AI-powered optimization suggestions
- 📊 **Analysis History** - Save and revisit past analyses
- 📥 **PDF Export** - Download analysis reports

### Real-Time Collaboration
- 👥 **Multi-User Rooms** - Code together with your team
- ⚡ **Live Code Sync** - See changes instantly across all users
- 🎯 **Monaco Editor** - Professional code editing experience
- 🔗 **Shareable Rooms** - Create and share room IDs
- 🎨 **User Presence** - See who's coding with you
- 🔄 **Language Sync** - All users see the same programming language
- 📍 **Persistent Sessions** - Rejoin rooms after page refresh

### Supported Languages
- JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust

## 🛠️ Tech Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Socket.io Client
- Monaco Editor (VS Code editor)
- React Markdown
- Axios
- jsPDF

**Backend**
- Node.js
- Express.js
- Socket.io (WebSocket)
- Google Gemini 2.5 Flash API
- Supabase (Authentication & Database)
- UUID

**Database**
- PostgreSQL (via Supabase)
- Row Level Security (RLS) enabled

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com/apikey))

