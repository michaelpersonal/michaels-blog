---
title: "Quizzes, Not Diffs"
date: 2026-01-22
draft: false
tags: ["AI coding agent", "ai native software og", "software development"]
summary: "As AI agents accelerate code generation, reviewing every diff no longer scales. The real bottleneck shifts from writing code to understanding its consequences. Instead of relying solely on explanations or tests, a simple technique like asking the agent to generate a short quiz forces the human to prove comprehension before approving changes. Tests verify correctness, explanations summarize intent, but quizzes verify understanding. In an agentic world, effective oversight is less about inspecting code and more about validating that we truly understand what the system will do."
---

I attended a full day live Vibe Coding Camp organized by Every. One small moment from one of the sessions stuck with me more than any demo or tool.


Near the end, the guest Geoffrey Litt said, “one more thing,” and pulled up a simple artifact he uses to prevent AI sloppiness. After an agent makes changes, he doesn’t just ask it to explain what it did. He asks it to generate a short quiz to test whether he actually understands the change.


![image.png](/images/posts/man-in-the-loop-agent-coding-0.png)


![image.png](/images/posts/man-in-the-loop-agent-coding-1.png)


That subtle shift reframed the whole “human in the loop” question for me.


In the agent era, we are no longer reviewing every diff. The volume is too high and the speed is too fast. Pretending we can manually inspect everything is mostly theater. At the same time, blindly trusting the agent is not acceptable. The real risk isn’t syntax errors or obvious bugs. The real risk is shipping behavior we don’t truly understand.


In other words, the bottleneck has moved. It’s no longer writing code. It’s comprehension.


The quiz acts as a deliberate speed damper. Not bureaucracy. Not heavyweight process. Just a lightweight forcing function that makes you reason about causality. What changed at runtime? What assumptions are baked in? What breaks if this is removed? Which edge cases are still risky? If I can’t answer those questions confidently, I probably shouldn’t approve the change.


Tests verify correctness. Explanations summarize intent. Quizzes verify understanding.


Together, they create something much more scalable than manual code review. Instead of acting like diff scanners, humans act like responsible owners. The agent does the heavy lifting. The human proves they understand the consequences.


It feels less like reviewing code and more like managing a teammate. Explain your thinking, then show me you understand the impact.


This is the first “human in the loop” pattern I’ve seen that actually scales with AI speed.

