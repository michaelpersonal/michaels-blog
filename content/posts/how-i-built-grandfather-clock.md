---
title: "How I Built It: Grandfather Clock & Notion-Driven AI Development"
date: 2026-01-25T04:10:00-05:00
draft: false
tags: ["AI", "Coding", "Notion", "Tone.js", "Vercel", "Agentic Workflow"]
categories: ["Projects", "AI Workflow"]
---

This weekend, I built a [web-based Grandfather Clock](https://michaelguo.vercel.app/grandfather-clock/) with my AI agent, Mikey. But the cool part isn't just the clock—it's **how** we built it.

We used a **Notion-driven workflow** where the AI actively reads the project management board, picks up tasks, executes the code, and updates the status. No copy-pasting requirements into a chat window.

## The Project: A Digital Grandfather Clock

The goal was simple: a skeuomorphic grandfather clock that runs in the browser.
- **Visuals:** Pure CSS (wood texture, pendulum animation, brass hands).
- **Audio:** Synthesized sound using [Tone.js](https://tonejs.github.io/) (no mp3 files).
- **Behavior:** Ticks every second, strikes the hour with the Westminster melody.

## The Workflow: AI as a Team Member

Instead of treating the AI like a chatbot ("write me code for a clock"), we treated it like a developer on the team.

### 1. The Kanban Board
We set up a simple board in Notion with columns: **To Do**, **In Progress**, **Done**.

### 2. Task Injection
I added a card to the "To Do" column:
> **Task:** Finish Grandfather Clock Audio
> **Details:**
> *   Make the second arm click sound more crispy.
> *   Deploy to `michaelguo.vercel.app`.
> *   Write a "how I did it" retro.

### 3. The Execution Loop
This is where it gets interesting. The AI (Mikey) has tool access to the Notion API.

1.  **Poll:** Mikey checked the board and saw the new high-priority task.
2.  **Read:** He read the bullet points inside the Notion page to understand the specific requirements (the "crispy" sound request was buried in the details, not the title).
3.  **Code:**
    *   *Sound Design:* He modified the `Tone.MembraneSynth` to use a square wave with a short envelope, simulating a mechanical escapement click instead of a drum thud.
    *   *Deployment:* He cloned my personal website repo, merged the clock code, and pushed to main to trigger a Vercel deployment.
4.  **Update:** Once verified, Mikey used the Notion API to move the card from **To Do** -> **In Progress** -> **Done**.

## The Tech Stack

*   **Frontend:** HTML5, CSS3 (lots of gradients for the wood look), Vanilla JS.
*   **Audio:** `Tone.js` for real-time synthesis.
*   **Deployment:** Vercel (static site hosting).
*   **Agent Control:** Clawdbot with Notion & GitHub skills.

## Why This Matters

This represents a shift in **Compound Engineering**. The AI isn't just generating code; it's participating in the project lifecycle. It respects the source of truth (Notion), follows the process (Kanban), and delivers the artifact (Git push) autonomously.

Check out the live clock here: [Grandfather Clock](https://michaelguo.vercel.app/grandfather-clock/)
