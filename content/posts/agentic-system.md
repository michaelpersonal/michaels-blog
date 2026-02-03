---
title: "Designing Enterprise Data Agents: From Pipelines to Agent-Native Architecture"
date: 2026-02-03
draft: false
tags: ["AI Agent", "enterprise AI"]
---

Natural language interfaces for data are no longer experimental—they’re becoming essential enterprise tools. But building a reliable, production-grade data agent requires moving beyond simple prompt engineering. This post shares architectural lessons learned from building an enterprise natural language to SQL (NL2SQL) agent.


## The Problem with Pipeline Architectures


Most NL2SQL systems start with a pipeline approach:


```plain text
User Question → Intent Detection → RAG Retrieval → SQL Generation → Validation → Response
```


This works for demos but creates problems at scale:


| Issue                 | Root Cause                                 |
| --------------------- | ------------------------------------------ |
| Rigid flows           | Each question type needs a predefined path |
| Context fragmentation | RAG retrieves fragments, loses coherence   |
| No memory             | Every session starts from scratch          |
| Hard to debug         | Which pipeline stage failed?               |
| Limited extensibility | Adding capabilities means adding stages    |


After building a system this way and hitting these ceilings, we rearchitected from first principles.


## Design Philosophy: Agent-Native


The core shift is from **“pipeline with steps”** to **“capable agent with rich context.”**


Instead of orchestrating the agent through a fixed flow, we give it:
- **Rich, structured context** loaded deterministically
- **Tools** it can use as needed
- **Memory** that persists across sessions
- **The autonomy to decide** how to answer each question


The agent doesn’t follow a script—it reasons about the task and uses appropriate tools.


### Guiding Principles


| Principle                     | What It Means                                    |
| ----------------------------- | ------------------------------------------------ |
| **Context over prompting**    | Structured knowledge beats clever prompts        |
| **Tools over hardcoding**     | Agent picks tools, not forced through pipelines  |
| **Memory over statelessness** | Interactions inform future ones                  |
| **Skills over sub-agents**    | Composable workflows, not rigid hierarchies      |
| **Learning over curation**    | System grows from feedback, humans seed + review |


## The Architecture


Here’s the high-level structure we arrived at:


![agent-architecture.svg](/images/posts/agentic-system-0.jpg)


Agent Architecture


### 1. Orchestrator with Workflow Graph


While we give the agent autonomy, we wrap it in a lightweight workflow graph with named phases. This isn’t a return to rigid pipelines—it provides structure for recovery and debugging while preserving flexibility.


**Phases:**
- **Understand**: Classify intent, assess risk
- **Retrieve**: Load scoped context
- **Plan**: Break down complex tasks (optional)
- **Execute**: Run tool calls
- **Verify**: Validate results with deterministic checks
- **Reflect**: Assess completeness, replan if needed
- **Summarize**: Generate response with provenance
- **Persist**: Update memory through policy gates


Each phase has explicit recovery paths. If verification fails, we can reflect and replan rather than failing the entire request.


### 2. Context Layer: Hierarchical, Not Retrieved


We replaced RAG-based retrieval with deterministic, hierarchical context loading.


![context-hierarchy.svg](/images/posts/agentic-system-1.jpg)


Context Hierarchy


**Why this works better:**
- **Debuggable**: You know exactly what context was loaded
- **Versionable**: Context lives in git, changes are reviewed
- **Fast**: No embedding lookups, just file reads
- **Coherent**: Full documents, not fragments


The hierarchy follows our multi-tenant structure. Each level can override or extend the level above it. User preferences override facility defaults override customer settings override global knowledge.


### 3. Tools as Capabilities


Instead of sub-agents with narrow responsibilities, we expose capabilities as tools the agent can invoke:


| Tool           | Purpose                     |
| -------------- | --------------------------- |
| `query_data`   | Execute analytical queries  |
| `visualize`    | Generate charts and graphs  |
| `search_docs`  | Find relevant documentation |
| `ask_user`     | Request clarification       |
| `invoke_skill` | Run predefined workflows    |


The agent decides which tools to use based on the question. A simple factual query might just use `query_data`. A complex analysis might chain multiple tools. An ambiguous request might start with `ask_user` for clarification.


### 4. Memory: Three Tiers


Memory operates at three timescales:


![memory-tiers.svg](/images/posts/agentic-system-2.jpg)


Memory Tiers


| Tier           | Scope        | Lifetime      | Purpose                      |
| -------------- | ------------ | ------------- | ---------------------------- |
| **Session**    | Conversation | Minutes/hours | “What did they just ask?”    |
| **User**       | Individual   | Persistent    | “How does this person work?” |
| **Collective** | Organization | Persistent    | “What patterns work here?”   |


Session memory enables follow-ups: “Show me the same for last week” works because the agent remembers what “the same” means.


User memory learns preferences: If a user corrects “best performer means lowest error rate, not highest volume,” we remember that.


Collective memory accumulates organizational knowledge: Successful query patterns, validated business term definitions, learned thresholds.


### 5. Skills: Composable Workflows


Skills are reusable, multi-step workflows defined declaratively:


```markdown
# Skill: period_comparison

## Description
Compare a metric across two or more time periods.

## Inputs
-metric: The measure to compare
-dimension: How to group results
-periods: List of time periods

## Steps
1.Parse and validate period definitions
2.Generate query for each period
3.Execute queries
4.Calculate deltas and trends
5.Format comparison table
```


Skills can be:
- **Human-authored**: Engineers write them like any other code
- **Agent-suggested**: The agent drafts skills when it sees repeated patterns


Both go through the same lifecycle: draft → test → security scan → human approval → production.


## Production Considerations


The architecture above is necessary but not sufficient. Production systems need additional guardrails.


### Risk-Tier + Verifier Gating


We don’t trust the agent’s self-reported confidence. Instead, we use deterministic verifiers and risk classification:


**Risk Tiers:**


| Tier          | Actions           | Auto-Execute?           |
| ------------- | ----------------- | ----------------------- |
| Read-only     | Queries, searches | Yes (if verifiers pass) |
| Write-back    | Memory updates    | Requires staging        |
| System-modify | New capabilities  | Requires human approval |


**Verifiers:**
- SQL syntax validation
- Schema matching (referenced tables/columns exist)
- Result sanity checks (row counts, value ranges)
- Cost estimation


Only when risk is low AND verifiers pass AND historical success is high do we auto-execute. Everything else requires staging or explicit approval.


### Memory Write Policies


Memory can silently degrade an agent if you let it write unverified beliefs. We enforce explicit policies:


**User Memory:**
- ✅ Write explicit preferences (user confirms)
- ✅ Write patterns after 3+ consistent observations
- ❌ Never write business “facts” (must come from system of record)
- ⚠️ Hypotheses get 30-day expiry


**Collective Memory:**
- ✅ Patterns validated through staging process
- ❌ No direct writes from agent—everything staged first
- Human curation for glossary and schema annotations


### Provenance and Observability


Every response carries provenance:
- What data sources were accessed
- What filters and joins were applied
- What assumptions were made
- What verifiers passed
- Full trace of tool calls


This isn’t cosmetic. It’s what makes stakeholders trust the system and what makes incidents debuggable.


## Implementation Strategy: Skeleton First


You can’t build all of this at once. Our strategy:


**Phase 1: Skeleton**
Build the minimum viable foundation :
- Orchestrator with core phases
- Context layer (migrated existing knowledge)
- Core tools (query, visualize, search, clarify)
- Session memory (full)
- User/collective memory (stubs)
- Basic trace store


**Phase 2+: Enhance**
With the skeleton in production, layer on:
- Full memory system with write policies
- Skills framework with lifecycle
- Learning loop with risk-tier gating
- Self-extension capabilities


This approach de-risks the migration. We prove the architecture works before adding complexity.


## Key Takeaways

1. **Pipeline → Agent-Native**: Give agents autonomy with structure, not rigid flows
2. **RAG → Herarchical Context**: Deterministic loading beats probabilistic retrieval for core knowledge
3. **Confidence → Verifiers**: Don’t trust LLM self-assessment; use deterministic checks
4. **Memory Needs Policies**: Without write rules, memory degrades quality over time
5. **Provenance is Required**: Enterprise trust requires knowing exactly what happened

The shift from “pipeline that calls LLMs” to “capable agent with tools” is more than architectural—it changes how the system can evolve. New capabilities become tools or skills, not new pipeline stages. The agent learns from usage rather than requiring manual updates. And the system becomes more debuggable, not less, as it grows more capable.


---


_This post describes architectural patterns from building enterprise data agents. The specific implementation details are illustrative rather than prescriptive—your domain and constraints will differ._

