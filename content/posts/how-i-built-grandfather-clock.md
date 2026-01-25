---
title: "How I Built It: Grandfather Clock & Notion-Driven AI Development"
date: 2026-01-25
draft: false
tags: ["AI coding agent", "superpowers skills"]
summary: "Building a skeuomorphic clock with AI, Notion, and no copy-pasting."
---

This weekend, I built a web-based Grandfather Clock with my AI agent, Mikey. But the cool part isn't just the clock—it's how we built it.


## The Workflow: AI as a Team Member


We used a Notion-driven workflow where the AI actively reads the project management board, picks up tasks, executes the code, and updates the status. No copy-pasting requirements into a chat window.

- Task Injection: I added a card to the To Do column in Notion.
- Execution: Mikey (the agent) read the task details directly via the Notion API.
- Deployment: He pushed the code to GitHub, triggering a Vercel deploy.
- Status Update: He moved the card to Done automatically.

## The Tech Stack


Frontend: HTML5, CSS3, Vanilla JS
Audio: Tone.js
Agent Control: Clawdbot + Notion API


Check out the live clock: [Grandfather Clock Demo](https://michaelguo.vercel.app/grandfather-clock/)

