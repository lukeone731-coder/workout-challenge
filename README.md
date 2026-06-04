# 💪 Workout Challenge App

A PWA workout challenge tracker with leaderboard, user accounts, and AI-powered workout suggestions.

---

## 🚀 Deploy to Vercel (Free — Recommended)

### Step 1 — Set your admin password
Open `src/context/AppContext.js` and change line 3:
```js
const ADMIN_PASSWORD = "your_password_here";
```

### Step 2 — Push to GitHub
1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Create a new repository called `workout-challenge`
3. Upload all these files to it (drag and drop the folder works)

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `workout-challenge` repository
4. Leave all settings as default and click **"Deploy"**
5. In ~60 seconds you'll get a live link like `https://workout-challenge-abc123.vercel.app`

### Step 4 — Share the link
Send the link to everyone in the group. They sign up with a username and password and they're in!

---

## 📱 Add to Home Screen

**iPhone (Safari):**
1. Open the link in Safari
2. Tap the Share button → "Add to Home Screen"
3. Tap Add

**Android (Chrome):**
1. Open the link in Chrome
2. Tap ⋮ menu → "Add to Home Screen"
3. Tap Add

It'll install like a real app — full screen, no browser bar.

---

## 🔐 Admin Access

On the login screen, tap **"Admin login"** at the bottom and enter your admin password.

As admin you can:
- View all players and remove them
- Add new workouts (AI suggests fair point values)
- View everyone's workout history
- Delete any log entry

---

## ➕ Adding New Workouts

1. Sign in as admin
2. Go to the **Admin** tab → **Workouts**
3. Type the workout name and tap **ASK AI**
4. Review the suggested point threshold and rationale
5. Tap **CONFIRM ADD** — it's live for everyone instantly

---

## 👥 Player Accounts

- Each person signs up once with a username + password
- They can only log and delete their own workouts
- Everyone can see the leaderboard
- No limit on how many people can join

---

## 🛠 Tech Stack
- React (Create React App)
- PWA (installable, works offline)
- localStorage for data persistence
- Anthropic Claude API for AI workout suggestions
