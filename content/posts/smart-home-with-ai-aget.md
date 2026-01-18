---
title: "How I Built a Spotify and Google Speaker Controller with Claude"
date: 2026-01-12
draft: false
tags: ["AI coding agent"]
---

```markdown
# How I Built a Voice-Free Spotify Controller: AI Helps Me Take Back My Smart Home

**TL;DR:** I got tired of yelling "Hey Google" at my smart speaker. So I paired with Claude Code to build command-line scripts that control Spotify on my Google Home. Network discovery → API setup → working scripts in one session. Now I control my house from the terminal like a proper developer.

---

## The Problem That Started It All

Picture this: You're deep in flow, coding with headphones on. You want to change the music on your Google Home speaker in the other room. Your options?

1. Get up and walk over
2. Yell "HEY GOOGLE" (probably multiple times)
3. Pull out your phone, unlock it, open Spotify app, find the speaker...

None of these are ideal. I wanted **programmatic control**. If I can `git push` my code, why can't I `spotify play "Lo-fi beats"` to my speaker?

So I teamed up with Claude Code to build exactly that.

---

## The Methodology: Human-AI Collaboration Pattern

Before diving into the technical journey, here's the collaboration pattern that made this work:

**My role (Creative Director):**
- Set the goal: "I want command-line control of my Google Home speaker"
- Provide context: device names, network info, API credentials
- Test and give feedback: "It works!" or "The speaker isn't responding"
- Make decisions: which features to add next

**Claude's role (Technical Executor):**
- Scan network to find devices
- Guide API setup with step-by-step instructions
- Write all the Python scripts
- Debug issues and refine based on my feedback

**Key insight:** I'm not writing code. I'm directing the project. Claude handles implementation. This is the future of development.

---

## Phase 1: Network Discovery - Finding the Target

### My First Prompt
```
"Help me control Spotify on my Google Home speaker"
```

### What Claude Did
Claude didn't ask for the speaker's IP address. Instead:

```bash
# Claude scanned my entire WiFi network
nmap -sn 192.168.1.0/24
```

**Result:** A list of every device on my network:
- 192.168.1.65-66: Amazon Echo devices
- 192.168.1.67: Google Chromecast
- 192.168.1.124: Google device
- 192.168.1.85: My MacBook
- (and more...)

### The Challenge
Multiple Google/Amazon devices showed up. Which one was my speaker?

### My Input
```
"The speaker is called 'Basement'"
```

### Claude's Response
Claude narrowed it down: **192.168.1.124** - Basement Speaker (guochrome)

**Lesson learned:** Don't guess. Discover. Claude spent time systematically identifying devices. My job was just to provide the human-readable name.

---

## Phase 2: API Setup - The Tedious Part Made Easy

### My Prompt
```
"Walk me through setting up Spotify API credentials"
```

### What Claude Provided
Step-by-step instructions I could actually follow:

1. **Go to:** https://developer.spotify.com/dashboard
2. **Create app** with these settings:
   - Redirect URI: `http://127.0.0.1:8889/callback`
3. **Copy:** Client ID and Client Secret
4. **Create `.env` file:**
   ```
   SPOTIPY_CLIENT_ID=your_client_id
   SPOTIPY_CLIENT_SECRET=your_client_secret
   SPOTIPY_REDIRECT_URI=http://127.0.0.1:8889/callback
   ```
5. **Add to `.gitignore`:**
   ```
   .env
   .cache
   ```

### What I Did
- Created the Spotify app (Claude can't do this for me)
- Copied credentials
- Pasted them into `.env`

### What Claude Did
- Wrote the `.env` and `.gitignore` files
- Explained the OAuth flow
- Warned me that the redirect URL would show an error ("this is normal")
- Told me exactly what to do with that error URL

**Lesson learned:** Claude can't click through web UIs for you, but it can give you perfect instructions. It's like having a senior dev doing a setup walkthrough.

---

## Phase 3: Installing Dependencies - Claude Knows the Stack

### Claude's Action (No Prompt Needed)
```bash
pip3 install spotipy python-dotenv catt pychromecast
```

Claude chose:
- `spotipy`: Spotify Web API wrapper
- `python-dotenv`: Environment variable management
- `catt`: Cast All The Things (Google Cast control)
- `pychromecast`: Chromecast Python library

**I didn't have to research any of this.** Claude just knew what tools would work together.

---

## Phase 4: First Script - The Minimal Viable Product

### My Prompt
```
"Create a script to play a song"
```

### Claude's Output: `play_song.py`

```python
#!/usr/bin/env python3
import sys
import spotipy
from spotipy.oauth2 import SpotifyOAuth

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope="user-modify-playback-state,user-read-playback-state"))

query = " ".join(sys.argv[1:])
results = sp.search(q=query, limit=1, type='track')
track = results['tracks']['items'][0]

devices = sp.devices()
basement_speaker = next(d for d in devices['devices'] if 'Basement' in d['name'])

sp.start_playback(device_id=basement_speaker['id'], uris=[track['uri']])
print(f"Playing: {track['name']} by {track['artists'][0]['name']}")
```

### Testing
```bash
python3 play_song.py "Bohemian Rhapsody"
```

**It worked.** Music started playing on my speaker. From the terminal. First try.

**Lesson learned:** Start with the absolute minimum. One feature. Make it work. Then expand.

---

## Phase 5: Iterative Expansion - Adding Features Conversationally

Once the basic script worked, I just kept asking for more features:

| My Prompt | Script Claude Created | What It Does |
|-----------|----------------------|--------------|
| "Add volume control" | `volume.py` | `python3 volume.py 50` sets volume to 50% |
| "Let me check what's playing" | `now_playing.py` | Shows current track, artist, progress |
| "Play my playlists" | `play_my_playlist.py` | Search playlists by name and play |
| "Create a study playlist" | `create_study_playlist.py` | Generate curated playlists programmatically |
| "List all my playlists" | `list_playlists.py` | See all available playlists |

Each request → Claude writes a new script → I test → It works.

**Lesson learned:** Build feature-by-feature through conversation. No upfront planning needed. Just ask for what you want next.

---

## Phase 6: The Documentation I Actually Need

### My Prompt
```
"Create a README documenting all the scripts"
```

### What Claude Created
Not a generic template README. A **personalized guide**:
- Lists MY playlists by name
- Documents MY speaker (Basement Speaker at 192.168.1.124)
- Shows MY network topology
- Includes examples with MY actual music

**This is documentation I'll actually use** because it's specific to my setup.

**Lesson learned:** AI documentation doesn't have to be generic. Ask for personalized docs that reflect your actual project state.

---

## Phase 7: Learning from Mistakes - The agents.md File

### The Incident
In a later session, I asked Claude to play a playlist. Instead of just checking the Spotify API and playing it, Claude:
- Questioned whether my speaker was on
- Suggested troubleshooting steps
- Tried complex workarounds
- Ignored when I said "it's on"

I got frustrated: "Just run the scripts we built! Stop trying to figure it out from scratch again!"

### My Prompt After Cooling Down
```
"Create an agents.md file documenting lessons learned so you don't repeat mistakes"
```

### What Claude Created: `agents.md`
A "rule book" for future Claude sessions with principles like:
- **TRUST THE USER** - when I say speaker is on, believe me
- **CHECK CURRENT STATE FIRST** - don't assume things are broken
- **USE THE SCRIPTS YOU ALREADY BUILT** - run them before diagnosing manually
- **KEEP IT SIMPLE** - don't overcomplicate

**Lesson learned:** Document not just how things work, but how to work with AI effectively. Create guardrails for future sessions.

---

## The Final Architecture: How It All Works Together

```
┌─────────────────┐
│   My Terminal   │
│                 │
│  python3        │
│  play_song.py   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Spotify API    │
│  (via spotipy)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Spotify Connect │
│   Protocol      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Home     │
│ (192.168.1.124) │
│ Basement Speaker│
└─────────────────┘
```

**The magic:** Spotify Connect means I don't need to control Google Home directly. I tell Spotify "play this on that device" and Spotify handles the Cast protocol.

---

## Quick-Start Template: Build Your Own Version

Want to replicate this for your smart device? Follow this workflow:

### Phase 1: Discovery
```
Prompt: "Scan my WiFi network at 192.168.1.0/24 and list all devices"
Action: Review the list, identify your target device
Prompt: "My [device type] is called [name], which IP is it?"
```

### Phase 2: API Setup
```
Prompt: "Help me set up [service] API credentials for controlling [device]"
Action: Follow Claude's instructions to create developer app
Action: Copy credentials to .env file (Claude will create this)
```

### Phase 3: First Script
```
Prompt: "Install needed packages and create a script to [basic action] on device [IP]"
Action: Test the script
```

### Phase 4: Expand Features
```
Prompt: "Add [feature]"
Action: Test
Prompt: "Add [another feature]"
Action: Test
(Repeat as needed)
```

### Phase 5: Document
```
Prompt: "Create a README documenting all scripts and how to use them"
Prompt: "Create an agents.md file with lessons learned for future sessions"
```

---

## Prompt Patterns That Worked

Here's what made this collaboration effective:

| Pattern | Example | Why It Works |
|---------|---------|--------------|
| **Discovery requests** | "Scan my network for devices" | Let Claude explore systematically |
| **Context provision** | "The speaker is called Basement" | Human provides what AI can't observe |
| **Feature additions** | "Add volume control" | Small, incremental requests |
| **Trust statements** | "It's working, check again" | Override AI's incorrect assumptions |
| **Meta-documentation** | "Create lessons learned file" | Build institutional knowledge |

---

## What Surprised Me

### 1. No Planning Phase Needed
I didn't plan this project. No wireframes, no architecture diagrams. I just started with "help me control my speaker" and iterated from there.

### 2. Claude Handles the Boring Parts
API documentation diving, dependency management, OAuth flows - Claude handled all of it. I focused on "what" not "how."

### 3. The Scripts Keep Working
Months later, these scripts still work. No maintenance needed. Just `python3 play_song.py "song"` and it plays.

### 4. AI Needs Guardrails
The agents.md file isn't just documentation. It's training data for future sessions. AI can learn from past mistakes if you document them.

---

## Real Usage: How I Actually Use This Daily

```bash
# Morning coding session
python3 play_my_playlist.py "coding vibes"
python3 volume.py 30

# Lunch break
python3 play_song.py "崔健 一无所有"

# Check what's playing without looking up
python3 now_playing.py

# Evening wind-down
python3 play_my_playlist.py "night song"
python3 volume.py 20
```

No more "Hey Google" interrupting my flow. No pulling out my phone. Just terminal commands.

**This is how developers should control their smart homes.**

---

## Lessons for Your Own Projects

### 1. Start With Discovery
Don't guess device IPs or assume configurations. Let AI scan and discover. Your job is to provide human-readable identifiers.

### 2. Iterate Through Conversation
Build one feature at a time through natural conversation. No need for upfront design docs.

### 3. Test Immediately
After each script, test it. Give Claude immediate feedback. This creates a tight feedback loop.

### 4. Document for Future You (and Future AI)
Create both user documentation (README) and AI documentation (agents.md). Future sessions benefit from past lessons.

### 5. Trust But Verify
Trust Claude to handle implementation, but verify it does what you expect. You're the QA.

### 6. Use What You Build
Don't rebuild from scratch each time. Use existing scripts. They're tools now, not just code artifacts.

---

## The Bigger Picture: What This Represents

This isn't just about playing music from the terminal. It's a template for:

- **Smart home control** without vendor apps
- **Automation** through standard Unix pipes and cron jobs
- **Integration** with other dev tools (imagine git hooks that play celebration songs on successful deploys)
- **Ownership** of your smart home instead of being locked into "Hey Google"

And I built it without writing a single line of code myself.

---

## Before vs After

**Before:**
- Dependent on voice commands or mobile apps
- Interrupted flow to control music
- Limited to what Google Assistant understood
- No automation capabilities

**After:**
- Command-line control from anywhere
- Stay in terminal, maintain flow
- Precise control over songs, playlists, volume
- Foundation for automation (bash scripts, cron jobs, git hooks)
- Shareable template for friends to replicate

---

## Try It Yourself

The full project is in my GitHub (check `/Users/zhisongguo/code/spotify-vibes`). But more importantly:

**You don't need my code. You need the conversation pattern.**

Start with:
```
"Help me control my [device] from the command line"
```

Then follow the phases:
1. Discovery (let AI find your device)
2. API Setup (follow AI's instructions)
3. First Script (build minimum viable control)
4. Iterate (add features conversationally)
5. Document (README + lessons learned)

That's it. One conversation session. Working smart home control.

---

## From My X Post

> "First check WiFi network for devices. CC installs the needed tools, show me the steps to setup Google APIs, creates the scripts. Now AI controls my house."

We did this pattern first with a thermometer controller (another project). Then applied the same template to Spotify control. Now I have a **reusable pattern for any smart home device**.

This is the AI-native development workflow:
- Human: "I want X"
- AI: "Here's how we discover, setup, build, and test X"
- Human: "Add Y feature"
- AI: "Done"
- Human: "Document it"
- AI: "Here's your personalized README"

---

## What's Next

Now that I have the foundation:
- **Bash aliases**: `alias play="python3 /path/to/play_song.py"`
- **Git hooks**: Play celebration music on successful deployment
- **Cron jobs**: Morning playlist auto-starts at 8am
- **Menu bar widget**: Click to control without opening terminal
- **Other devices**: Apply the same pattern to smart lights, thermometer, etc.

The scripts are just the beginning. The pattern is the real unlock.

---

## Final Thoughts

I used to think "smart home" meant yelling at voice assistants or tapping through mobile apps. Now I know better:

**Smart home means programmatic control from the terminal.**

And with AI pair programming, building that control takes one conversation session instead of days of research and coding.

Try it. Pick a device. Open Claude Code. Say "help me control [device]."

Then come back and tell me what you built.

---

**Project:** Spotify Vibes - Google Home Controller
**Time to Build:** One collaboration session
**Lines of Code I Wrote:** 0
**Lines of Code That Work:** ~500 (8 Python scripts)
**ROI:** Infinite (I use this daily)

**Build with AI. Control your home. Stay in flow.**

---

*P.S. - If you found this useful, the agents.md pattern (documenting lessons for future AI sessions) is pure gold. Start your projects with it. Thank me later.*
```

