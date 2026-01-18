---
title: "How Did I Build Gesture Fireworks With Cursor"
date: 2026-01-18
draft: false
tags: ["claude code skills", "cursor rules"]
summary: "I built a fun web app called Gesture Fireworks using the Cursor AI coding agent and published it on my personal site. Friends loved it and asked how they could create something similar. This post breaks down the exact process I followed, step by step. The key takeaway is simple: effective collaboration with an AI agent is less about writing perfect prompts and more about having a clear workflow. I started with inspiration, let the AI guide early design decisions, gave short and specific feedback, asked for research when needed, and iterated quickly. With this approach, I was able to go from idea to deployed app with minimal friction. The same method can be used for almost any small creative project."
---

## **Executive Summary**


I built a fun web app called Gesture Fireworks using the Cursor AI coding agent and published it on my personal site. Friends loved it and asked how they could create something similar. This post breaks down the exact process I followed, step by step. The key takeaway is simple: effective collaboration with an AI agent is less about writing perfect prompts and more about having a clear workflow. I started with inspiration, let the AI guide early design decisions, gave short and specific feedback, asked for research when needed, and iterated quickly. With this approach, I was able to go from idea to deployed app with minimal friction. The same method can be used for almost any small creative project.


---


## **Step-by-Step Process**


### **Phase 1: Setting Up the AI Workflow**


**My prompt:**

> "first install superpowers rules in parent folder"

**What happened:**


I started by setting up structured AI workflow rules (superpowers-cursor-rules) that give the AI agent better development practices such as brainstorming, TDD, and systematic debugging.


**Lesson:**


Having a good AI workflow foundation makes everything smoother.


---


### **Phase 2: Starting with Inspiration**


**My prompt:**

> "@superpowers-brainstorming I'd like to create an application like this one [a screen capture]"

**What worked:**

- I tagged the brainstorming skill explicitly
- I shared a concrete example of what I wanted
- I did not over-specify and let the AI ask questions

**The brainstorming flow:**


| AI Question                  | My Answer   |
| ---------------------------- | ----------- |
| Web app, mobile, or desktop? | a (web)     |
| Vanilla JS, React, or Vue?   | a (vanilla) |
| Sound effects?               | a (yes)     |
| Visual style match original? | a (yes)     |
| Ready to document design?    | yes         |


**Lesson:**


Short answers work. The AI proposes options and I just pick. No need to write essays.


---


### **Phase 3: Iterative Feedback**


After the first working version, I gave specific, actionable feedback.


**My prompt:**

> "improvements: 1) the fireworks too small, make it bigger and more explosive; 2) right hand doesn't seem as responsive; 3) remove the noise while hands charging"

**What worked:**

- Numbered list of issues
- Clear descriptions of problems
- Mix of visual, behavioral, and audio feedback

When the right-hand issue persisted:


**My prompt:**

> "can you double check why right hand doesn't behave the same as left hand"

**Lesson:**


If something is not fixed, I can ask the AI to investigate deeper. This triggered systematic debugging.


---


### **Phase 4: Requesting Research**


**My prompt:**

> "can you research if there is a better fireworks library, yours currently is a little boring, not as colorful"

**What worked:**

- I identified the problem
- I asked for research instead of demanding a specific solution
- The AI explored options and presented choices

**Result:**


The AI presented three library options. I chose to upgrade the custom implementation instead of using an external library.


---


### **Phase 5: Adding Features with Simple Requests**


**My prompt:**

> "great now add background music /Downloads/684.mp3"

**What worked:**

- Direct and specific
- Included the exact file path
- Built on existing work rather than starting over

---


### **Phase 6: Documentation and Deployment**


**My prompts:**

> "what a good github project description for this"
> "update needed documents and commit changes to github"
> "deploy this app to vercel (reuse my website if possible), change my personal website to add this project link"

**What worked:**

- I asked for help with non-code tasks too
- I gave context about my existing infrastructure
- I let the AI figure out the details

---


### **Phase 7: New Feature via Brainstorming**


When the rocket feature did not work as expected:


**My prompt:**

> "@superpowers-brainstorming the rocket launch feature doesn't work. I would think you first need a firework on the ground, light up, then shoot up, then explode. right now only explode, no previous steps"

**What worked:**

- I tagged brainstorming for a design discussion
- I clearly described the expected behavior
- This triggered a proper design session with options

When presented with options:


**My prompt:**

> "maybe left hand pinch trigger this, but right hand keeps the old way"

**Lesson:**


I can propose my own ideas during brainstorming. The AI presented options, but I had a better idea that combined approaches.


---


## **Summary of My Prompting Patterns**


| Pattern                | Example                                     | Why It Works                   |
| ---------------------- | ------------------------------------------- | ------------------------------ |
| Start with inspiration | Share a link or video                       | Concrete beats abstract        |
| Use short answers      | a, yes, b                                   | AI proposes, I pick            |
| Numbered feedback      | "1) bigger 2) responsive 3) remove noise"   | Clear and actionable           |
| Ask for research       | "can you research better libraries"         | Lets AI explore options        |
| Give file paths        | "/Downloads/684.mp3"                        | Specific and precise           |
| Ask for investigation  | "double check why X doesn't work"           | Triggers deeper debugging      |
| Propose my own ideas   | "maybe left hand does X, right hand does Y" | I stay the creative director   |
| Tag skills explicitly  | "@superpowers-brainstorming"                | Activates structured workflows |


---


## **Quick Start Template**

1. **SETUP**

"install superpowers rules"

1. **START WITH INSPIRATION**

"@superpowers-brainstorming I want to build [thing] like this [link]"

1. **ANSWER QUESTIONS**

Pick from options with short replies.

1. **LET IT BUILD, THEN ITERATE**

"improvements: 1) [issue] 2) [issue] 3) [issue]"

1. **ASK FOR RESEARCH WHEN STUCK**

"can you research better ways to do [X]"

1. **ADD FEATURES INCREMENTALLY**

"now add [feature]"

1. **FINISH STRONG**

"update docs and commit"


"deploy to [platform]"


---


## **Key Mindset**

1. I am the creative director and the AI is my collaborator
2. Start vague and get specific
3. Short prompts work
4. Iterate quickly
5. Trust the process

Anyone can follow this exact flow to build their own projects. The magic is in the collaboration. We bring the vision and taste, the AI brings execution speed. 🎆

