# ClubMatch (AI@USC Hackathon demo)

Students swipe through USC clubs, save the ones they like, and message them directly. Club officers get AI-drafted club pages and reply drafts. Student Government gets an anonymous report on what students want, including what they search for but can't find.

To rename the app, edit `src/config.js`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Put it on Replit

1. Push this folder to a GitHub repo. On Replit, choose **Create App → Import from GitHub** and pick the repo. You can also create a blank Node app and upload the folder.
2. Click **Run**. `.replit` already runs `npm run dev`.
3. Click **Deploy → Static**. Build command: `npm run build`. Public directory: `dist`. Use the deployed URL as the Devpost prototype link.

## Demo flow (about 2 minutes)

1. **Sign in** with any `@usc.edu` email. Other domains are rejected.
2. **Paste your resume → Use a sample resume → Build my profile.** Contact info is removed first, then major, year, skills, and interests are extracted. Each interest shows where it came from.
3. **Discover.** Swipe or use ←/→. A right swipe opens the "how to join" sheet. The "Ranking by" strip and a toast show the feed adjusting as you swipe. Every 4th card is a **hidden gem**, a smaller club that still fits.
4. **Explore.** Try "chill climbing club, no application," then "pickleball." The second has no club, so you get the closest options and the search is logged for USG.
5. **Messages.** Use a suggested opener. Typing a phone number triggers a privacy warning. The flag icon reports a conversation.
6. **Club officer view** (top-right menu). Open the inbox, use **Draft a reply with AI**, and send. Under **Add a club → Use sample text → Draft club page → Publish**, the new club appears in the student deck right away.
7. **Student Government view.** Shows saves by category and "What students search for but can't find." Your live searches are marked "live."

## How the AI works in this demo

`src/ai/engine.js` is a local engine. It's deterministic, needs no API key, and nothing leaves the browser.

| Feature | Demo implementation | Live version |
|---|---|---|
| AI onboarding | Keyword and pattern extraction after removing personal info | LLM with a JSON schema |
| Ranking | Interest vectors with cosine similarity | Text embeddings |
| Learning as you swipe | Right swipes pull the preference vector toward the club; left swipes push it away | Same, on embeddings |
| "Why you match" | Generated from the overlapping interests, citing each source | LLM, grounded only in stored club fields |
| Natural-language search | Parses interests, "no application," "beginner," and time words; flags named activities with no matching club | LLM that returns the same structured query |
| Club page drafting | Tag, category, and how-to-join detection from pasted text | LLM with a JSON schema; officer reviews before publishing |
| Safety | Removes personal info, warns before sharing contact info, blocks harassment, report button | Same, plus a moderation model |

To go live, add a server route that calls a model through Replit AI Integrations and swap one function at a time. See `src/ai/provider.js`.

## Data

`src/data/clubs.js` lists 33 real USC organizations. Descriptions are short paraphrases of their public pages (EngageSC, Viterbi and Dornsife org lists, Daily Trojan). How to join is filled in only where a source states it; everything else shows "Ask the club how to join." The Student Government numbers combine a simulated cohort with live activity from the device, and the screen says so.
