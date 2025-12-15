# 🎮 Habbi3 Stream Alerts

A stunning neon cyberpunk-themed stream alert overlay for Streamlabs. Features tiered alert designs, particle effects, and smooth animations.

![Neon Cyberpunk Theme](https://img.shields.io/badge/Theme-Neon%20Cyberpunk-00f0ff?style=for-the-badge)
![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

## ✨ Features

- 🌈 **Neon Cyberpunk Design** - Electric cyan, hot pink, and purple color palette
- 🎯 **Tiered Alert System** - Different visual impact per event type:
  - 💰 **Donations** - Explosive entrance with RGB glow, confetti burst
  - 💎 **Bits** - Epic purple sparkles and chromatic effects
  - ⚔️ **Raids** - Dramatic zoom entrance with green neon
  - ⭐ **Subscriptions** - Holographic slide with pink glow
  - ❤️ **Follows** - Clean, elegant fade-in
- 🎆 **Particle Effects** - Canvas-based confetti and sparkles
- 🔊 **Sound Effects** - Different tones per event type
- ⏱️ **7-Second Display** - Enough time to appreciate the "wow" factor
- 🔒 **Secure Token Handling** - Token passed via URL, never exposed in code

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/alert-box)

### Option 2: Manual Deploy

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

That's it! Vercel will give you a URL like `https://your-project.vercel.app`

## 🎥 OBS Setup

### Add as Browser Source

1. In OBS, click **+** in Sources → **Browser**
2. Name it "Stream Alerts"
3. Configure:

| Setting | Value |
|---------|-------|
| **URL** | `https://your-project.vercel.app/?token=YOUR_STREAMLABS_TOKEN` |
| **Width** | `1920` |
| **Height** | `300` |
| **Custom CSS** | *(leave empty)* |
| **Shutdown source when not visible** | ❌ Unchecked |
| **Refresh browser when scene becomes active** | ❌ Unchecked |

### Get Your Streamlabs Socket Token

1. Go to [Streamlabs Dashboard](https://streamlabs.com/dashboard)
2. Navigate to **Settings** → **API Tokens** → **Socket API Token**
3. Copy your token
4. Add it to your OBS browser source URL:
   ```
   https://your-project.vercel.app/?token=eyJ0eXAiOiJKV1...
   ```

## 🧪 Testing Alerts

Open browser console (F12) on your deployed site and run:

```javascript
// Test different alert types
testAlert('donation');    // 💰 Big yellow explosion
testAlert('bits');        // 💎 Purple sparkles
testAlert('raid');        // ⚔️ Green dramatic entrance
testAlert('subscription'); // ⭐ Pink slide-in
testAlert('follow');      // ❤️ Subtle cyan fade
```

## 📁 Project Structure

```
alert-box/
├── index.html          # Main entry point
├── css/
│   └── style.css       # Neon cyberpunk styling
├── js/
│   ├── main.js         # Socket connection & alert logic
│   └── particles.js    # Canvas particle effects
├── vercel.json         # Deployment config
└── README.md           # This file
```

## 🎨 Customization

### Change Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --neon-cyan: #00f0ff;
    --neon-pink: #ff00aa;
    --neon-purple: #b400ff;
    --neon-yellow: #f0ff00;
    --neon-green: #00ff88;
}
```

### Change Alert Duration

Edit `js/main.js`:

```javascript
const CONFIG = {
    alertDuration: 7000,  // Change to desired milliseconds
    // ...
};
```

### Change Alert Sounds

Replace the base64 audio in `js/main.js` SOUNDS object, or link to external audio files.

## 🔒 Security Note

Your Streamlabs token is passed via URL parameter and **never** stored in the deployed code. This means:

- ✅ Only you (in your local OBS config) know the token
- ✅ Anyone viewing your Vercel URL without the token sees an error message
- ✅ Token is not exposed in source code or network requests visible to viewers

## 📝 License

MIT License - Feel free to customize and use for your streams!

---

Made with 💜 for **Habbi3**
