# CareerPilot AI

CareerPilot AI is a premium glassmorphism ocean-themed career guidance platform built for students and aspiring professionals. It provides smart AI-powered recommendations, skill-building roadmaps, personalized guidance, and an engaging modern interface.

## Features

- AI chatbot for career guidance and skill recommendations
- Glassmorphism SaaS design with futuristic ocean gradients
- Responsive layout for mobile, tablet, and desktop
- Animated roadmap timeline and premium feature cards
- Statistics counters and testimonial slider
- Clean frontend architecture with HTML, CSS, and JavaScript
- Node.js + Express backend connected to Gemini API

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- AI: Gemini API via OpenAI-compatible client

## Project Structure

```
careerpilotAI/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
├── frontend/
│   ├── about.html
│   ├── about.css
│   ├── contact.html
│   ├── contact.css
│   ├── faq.html
│   ├── faq.css
│   ├── index.html
│   ├── login.html
│   ├── login.css
│   ├── services.html
│   ├── services.css
│   ├── signup.html
│   ├── signup.css
│   ├── style.css
│   ├── script.js
├── assets/
│   ├── images/
│   ├── icons/
├── README.md
├── .gitignore
```

## Setup Instructions

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Add your Gemini API key to `backend/.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

3. Start the backend server:

```bash
npm run start
```

Alternatively, from the project root run:

```bash
node backend/server.js
```

4. Open `frontend/index.html` in your browser or deploy the `frontend` folder to Vercel/Netlify.

> Note: If `GEMINI_API_KEY` is missing, CareerPilot will still run in demo mode with sample career guidance responses. Add a valid key to enable real Gemini answers.

## Deployment Guide

- Deploy `frontend` as a static site to Vercel or Netlify.
- Deploy `backend` as a Node.js server to Vercel, Railway, or Render.
- Ensure the frontend fetch URL points to your deployed backend API.

## Notes

- The frontend sends chat requests to `http://localhost:3000/chat` by default.
- Use the backend server to connect securely to the Gemini API.
- Replace the placeholder API key in `backend/.env` before running.
