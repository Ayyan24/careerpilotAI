# ⚡ Quick Start Guide - CareerPilot AI Chatbot

## 3 Steps to Get Running (5 minutes)

### Step 1: Get Free API Key
- Go to: https://makersuite.google.com/app/apikeys
- Click "Create API Key"
- Copy the key (it's free!)

### Step 2: Add Key to Backend
1. Open: `backend/.env`
2. Replace: `YOUR_GEMINI_API_KEY_HERE` with your copied key
3. Save file

### Step 3: Start Backend
```bash
cd backend
npm install
npm run dev
```

You should see: ✅ Server running on http://localhost:3000

### Step 4: Open & Test
1. Open `frontend/index.html` in your browser
2. Scroll to "AI Chat Studio"
3. Type: "What career paths are available in tech?"
4. Press Enter or click Send
5. Wait 2-3 seconds for AI response

---

## ✅ What Was Fixed

✅ **Gemini API** - Now properly returns responses (was using wrong syntax)
✅ **Error Messages** - Clear, helpful debug information
✅ **Console Logs** - Track entire request/response flow
✅ **Form Submission** - Multiple handlers for reliability
✅ **API Key Setup** - Clear instructions in .env file

---

## 🔍 Check if Working

### Backend (Terminal should show):
```
🚀 CareerPilot AI Backend Server Started Successfully!
✅ Server running on http://localhost:3000
📨 Chat endpoint ready at http://localhost:3000/chat
```

### Frontend (Browser DevTools F12 → Console should show):
```
🚀 CareerPilot AI Frontend Loading...
✅ All frontend components initialized successfully!
```

### Chat Response (After sending message):
```
👤 User message: What is machine learning?
📡 Fetching from backend: http://localhost:3000/chat
📥 Response status: 200 OK
✅ Backend response received: {...}
💬 AI response text: Machine learning is...
```

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "API_KEY not set" error | Add real key to .env, restart backend |
| "Cannot POST /chat" | Start backend: `npm run dev` |
| CORS errors | Make sure backend is running |
| No AI response | Check API key is valid |
| Empty console logs | Open DevTools with F12 |

---

## 📚 Full Documentation

See **DEBUGGING_FIXES_APPLIED.md** for complete details on all fixes.
See **backend/SETUP_AND_DEBUG.md** for comprehensive setup guide.

---

## 🎉 You're All Set!

The chatbot is now fully functional with proper error handling and logging.
Enjoy getting AI-powered career guidance! 🚀
