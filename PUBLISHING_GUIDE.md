# 💖 Romantic Birthday Scrapbook — Beginner's Guide & Customization

Welcome to your romantic birthday scrapbook surprise website! This project is crafted specifically to give your girlfriend an unforgettable, interactive birthday experience inspired by a cute pastel pink scrapbook.

---

## 🎁 How It Works
1. **The Opening Question**: She lands on a screen asking *"Do you want a surprise?"* with **YES** and **NO** buttons.
2. **The "NO" Screen**: If she taps **NO**, a cute pleading cat appears with *"Nooo! Try again 🥺"* and a retry button.
3. **The "YES" Magic**: When she taps **YES**, the sweet romantic music box begins playing, and the digital scrapbook opens.
4. **Interactive Scrapbook Sections**:
   - **Captured Moments**: Polaroid photo gallery with realistic tilt, taped corners, click-to-flip love notes on the back, and photo enlargement.
   - **Our Memories Timeline**: Milestone notebook with dates, locations, and heartwarming stories.
   - **The Love Letter**: Wax-sealed envelope that breaks open to unfold into a personal parchment letter.
   - **Reasons Why I Love You**: Interactive cards that flip to reveal cute compliments and inside jokes with confetti celebration.
   - **The Grand Finale Surprise**: Wrapped 3D gift box that bursts with confetti upon unwrap, reveals a birthday cake with candles she can blow out by tapping, and an official **Birthday Princess Pass** love coupon with a copyable code.

---

## 🛠️ How to Easily Personalize (In 2 Minutes!)

### Option A: Using the Live In-App Editor (Easiest!)
1. Open the website on your computer or phone.
2. Click the **"Customize"** button in the top navigation bar.
3. You can edit:
   - **Her Name & Your Name**: (e.g., replace Sarah and Alex with your own names).
   - **Photos**: Upload pictures directly from your phone/computer or paste image links, write custom captions and secret notes on the back.
   - **Love Letter**: Customize the salutation, 3 heartfelt paragraphs, and signoff.
   - **Memories**: Add your favorite dates, inside jokes, and special milestones.
   - **Reasons Why I Love You**: Add or edit the things you love most about her.
   - **Surprise Pass**: Personalize the voucher privileges (e.g. favorite dinner, movies, massage, unlimited hugs).
   - **Music**: Keep the cozy procedural music box lullaby or paste any `.mp3` stream URL.
4. Click **"Save & Apply"**. All changes are saved instantly in your browser!
5. In the **"Export / Backup"** tab, you can click **"Download JSON Backup"** to save your customized configuration file.

### Option B: Editing Code Directly (`src/data/defaultScrapbook.ts`)
If you want your custom text to be permanent in the repository code:
- Open `/src/data/defaultScrapbook.ts`.
- Edit `recipientName`, `senderName`, `loveLetter`, `photos`, and `reasons`.

---

## 🚀 Free Publishing Guide (Step-by-Step for Beginners)

### 1. Vercel (Recommended — Free & 1-Click)
1. Sign up for a free account at [Vercel](https://vercel.com).
2. Connect your GitHub account and import your scrapbook repository.
3. Vercel will automatically detect Vite. Click **Deploy**.
4. In under 60 seconds, your site is live with a free SSL link like `https://sarah-birthday.vercel.app`!

### 2. Netlify (No Code / Drag & Drop)
1. On your machine, run `npm run build` in the terminal to create the `dist` folder.
2. Visit [Netlify Drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder into the browser window.
4. Netlify immediately generates a public shareable URL!

### 3. GitHub Pages
1. Push your repository to GitHub.
2. Go to **Settings > Pages** in your GitHub repository.
3. Set Source to **GitHub Actions**, choose the **Vite** starter, and save.

---

## 📱 Mobile & Android Compatibility
- Fully responsive design tested for mobile screens, Android phones, iPhones, tablets, and desktop computers.
- Touch-friendly tap controls, swipeable views, and fluid animations.
- Safe Web Audio API initialization that starts audio only after user tap (complying with Android & iOS autoplay restrictions).

Made with all the love in the world! 💕
