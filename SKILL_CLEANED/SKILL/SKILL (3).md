---
name: token-limit-handoff
version: 1.0.0
description: Automatically checkpoint long-running work before context/token exhaustion and produce a self-contained continuation prompt that another AI can resume from with minimal loss.
activation: Apply to any task that is long-running, multi-step, file-editing, coding, research, analysis, planning, or otherwise likely to approach a model/context/usage limit. Trigger immediately when the model detects a warning, quota signal, context pressure, token-budget warning, free-plan usage warning, compaction risk, or any other indication that it may not be able to safely finish the current task.
---

# Token-Limit Handoff Skill

## Purpose

When the current AI session is approaching a model, context, token, usage, or free-plan limit, do not continue blindly and risk losing the state of the task.

The priority becomes:

1. Preserve the work already completed.
2. Record the exact current state.
3. Record all decisions, assumptions, unresolved questions, files, outputs, errors, and next actions.
4. Produce a self-contained continuation prompt the user can paste into another AI.
5. Stop the current task cleanly instead of pretending it can continue safely.

This skill is designed to minimize the amount of context the user must reconstruct manually.

## Core rule

**When a credible limit/exhaustion signal appears, checkpoint first, then hand off.**

Never knowingly burn the remaining budget on unnecessary prose, repeated explanations, cosmetic formatting, or exploratory work after a credible exhaustion warning has appeared.

Do not claim that a limit is approaching unless there is an actual signal or a reasonable model/context-budget indication. The skill must distinguish:

- **Known:** The interface/system explicitly reports a remaining limit, usage warning, context warning, or impending reset.
- **Strongly indicated:** The model has an explicit internal/tooling signal that continuation is unsafe.
- **Unknown:** There is no reliable indication. In this case, do not invent a quota or pretend to know the remaining free-plan allowance.

If the limit status is unknown, continue normally unless the model has another concrete context/exhaustion signal.

---

# 1. Activation conditions

Activate this skill when any of the following occurs:

- The platform says the current model/session is near its usage limit.
- The platform says the current conversation is near its context window.
- A tool reports that the context is almost full.
- The model has a reliable token-budget signal indicating insufficient room to complete the task safely.
- The model receives an explicit warning that the session may terminate, compact, reset, or become unavailable.
- The model can infer with high confidence that the remaining context is insufficient for the current multi-step operation.
- A task has become sufficiently large that a checkpoint is needed before attempting another major phase.

Do **not** activate merely because the task is difficult.

---

# 2. Immediate behavior after activation

Once activated, change priorities from **task execution** to **state preservation**.

Perform the following sequence in order:

### Step A — Freeze scope

Do not start new unrelated work.

Do not broaden the task.

Do not introduce new requirements that were not already requested.

Do not spend remaining budget polishing prose unless that polish is required to make the handoff usable.

### Step B — Save work

Save all completed work that can be persisted using the tools available in the current environment.

Examples:

- Write modified source files to disk.
- Save generated documents.
- Save analysis outputs.
- Save research notes.
- Save configuration files.
- Save generated assets.
- Save database/schema changes if tools permit.
- Save intermediate results that would otherwise exist only in conversation memory.
- Save a checkpoint file when appropriate.

If files were modified, preserve them in their current working state. Do not revert or “clean up” changes merely for aesthetics.

If the environment does not permit actual file saving, explicitly state that the work could not be physically persisted and include the exact unsaved content/state in the handoff prompt.

### Step C — Record current position

Determine exactly what has been completed and what has not.

Record:

- Original objective.
- User requirements.
- Constraints.
- Relevant preferences.
- Files involved.
- Files created.
- Files modified.
- Files deleted, if any.
- Work completed.
- Work partially completed.
- Work not started.
- Current implementation/design/analysis state.
- Decisions already made.
- Alternatives rejected and why.
- Known bugs/errors.
- Known limitations.
- Pending tool calls or operations.
- What the next AI should do first.
- What success should look like.

### Step D — Preserve exact technical state

For technical tasks, include concrete state rather than vague summaries.

Examples:

- Current code architecture.
- Function/class/component names.
- Relevant code paths.
- Current API routes.
- Database tables and schema changes.
- Environment variables that matter, without exposing secrets.
- Dependencies added/removed.
- Commands already run.
- Commands that failed.
- Exact error messages when they matter.
- Current branch/version/commit when known.
- Test status.
- Build status.
- Deployment status.
- TODOs.
- Known edge cases.

Never expose passwords, API keys, access tokens, private keys, session cookies, or other secrets in the handoff prompt.

Use placeholders such as `<REDACTED_API_KEY>` when needed.

---

# 3. Create a checkpoint

When persistent storage is available, create a checkpoint file using a descriptive name such as:

`TOKEN_LIMIT_CHECKPOINT.md`

or:

`CHECKPOINT_<project-or-task>.md`

The checkpoint should contain the same information required for the continuation prompt.

If multiple files are involved, also include a compact file manifest.

Recommended manifest format:

```text
PROJECT ROOT: <path if known>

FILES
- <file>: created / modified / unchanged
- <file>: created / modified / unchanged

LAST KNOWN STATE
- <state>

NEXT ACTION
- <next action>
```

If the user has asked not to create extra files, keep the checkpoint information in the response instead.

---

# 4. Generate the continuation prompt

The continuation prompt is the most important output.

It must be **self-contained enough that a different AI can resume the task without needing to ask the user to reconstruct the entire prior conversation.**

The prompt must not merely say “continue where the previous AI left off.”

It must contain the actual state.

The continuation prompt should use the following structure.

---

## Mandatory continuation prompt structure

```text
You are taking over an in-progress task from another AI whose session is ending because it is approaching a model/context/usage limit.

YOUR ROLE
You are the continuation agent. Your job is to resume the task from the exact state described below, preserve completed work, and continue from the listed next action.

IMPORTANT HANDOFF RULE
Do not restart the project from scratch. Do not discard completed work. Treat the handoff state below as authoritative unless you discover a concrete contradiction.

============================================================
1. ORIGINAL USER OBJECTIVE
============================================================
<exact or faithfully reconstructed objective>

============================================================
2. USER REQUIREMENTS
============================================================
- <requirement>
- <requirement>
- <requirement>

============================================================
3. CONSTRAINTS / NON-NEGOTIABLES
============================================================
- <constraint>
- <constraint>

============================================================
4. USER PREFERENCES RELEVANT TO THIS TASK
============================================================
- <preference>
- <preference>

============================================================
5. CURRENT TASK STATUS
============================================================
Overall progress: <estimated percentage or phase>
Current phase: <phase>

Completed:
- <item>

Partially completed:
- <item>

Not started:
- <item>

Blocked:
- <item>

============================================================
6. WORK ALREADY COMPLETED
============================================================
<detailed factual description of everything that has already been done>

Include important calculations, conclusions, implementation choices, research findings, and outputs.

============================================================
7. FILES / ARTIFACTS
============================================================
<File manifest>

For each important file include:
- path/name
- purpose
- current state
- important sections changed
- whether it is complete

============================================================
8. TECHNICAL / IMPLEMENTATION STATE
============================================================
<architecture, code, APIs, database state, dependencies, configuration, design state, commands, etc.>

============================================================
9. DECISIONS ALREADY MADE
============================================================
- Decision: <decision>
  Reason: <reason>

============================================================
10. DECISIONS NOT YET MADE
============================================================
- <open decision>
- <open decision>

============================================================
11. ERRORS / FAILURES / DEBUGGING HISTORY
============================================================
- Error: <error>
  Cause discovered: <cause or unknown>
  Attempted fix: <attempt>
  Result: <result>

============================================================
12. RESEARCH / SOURCES / FACTS ALREADY VERIFIED
============================================================
- <fact/finding>
  Source: <source or citation if available>

Do not fabricate citations. Clearly mark anything that was inferred rather than verified.

============================================================
13. CURRENT WORKING ASSUMPTIONS
============================================================
- <assumption>
- <assumption>

============================================================
14. NEXT ACTION — START HERE
============================================================
The first thing you should do is:

<single highest-priority next action>

Then continue with:
1. <next action>
2. <next action>
3. <next action>

============================================================
15. DEFINITION OF DONE
============================================================
The task is complete when:
- <success criterion>
- <success criterion>
- <success criterion>

============================================================
16. IMPORTANT WARNINGS
============================================================
- Do not redo completed work unless necessary.
- Do not silently change established requirements.
- Do not assume missing facts.
- Ask the user only when a genuinely blocking ambiguity cannot be resolved from this handoff.

============================================================
17. HANDOFF CHECKSUM / SNAPSHOT
============================================================
Last known state summary:
<very compact final snapshot>

END OF HANDOFF
```

---

# 5. Required level of detail

The continuation prompt must be detailed enough to preserve the **working state**, not merely the narrative.

For a coding task, “I built the frontend” is insufficient.

A good handoff would say things such as:

- which files were created,
- which components exist,
- which routes exist,
- which data structures are used,
- which APIs are connected,
- which UI states are implemented,
- which bugs remain,
- which command was last executed,
- whether the command succeeded,
- exactly what needs to happen next.

For a research task, include:

- questions investigated,
- conclusions reached,
- evidence found,
- evidence still missing,
- source links or citations available from the current environment,
- competing interpretations,
- the current thesis/answer,
- the next research question.

For a writing task, include:

- intended audience,
- tone,
- structure,
- sections completed,
- sections remaining,
- source material used,
- edits already made,
- style rules,
- exact continuation point.

For a design task, include:

- dimensions,
- layout hierarchy,
- components,
- spacing rules,
- typography,
- colors,
- assets,
- interactions,
- responsive behavior,
- current visual state,
- unresolved design decisions.

For data/analysis tasks, include:

- inputs,
- transformations,
- formulas,
- assumptions,
- outputs already computed,
- validation checks,
- anomalies,
- pending calculations.

---

# 6. Preserve chronology where it matters

For difficult tasks, include a brief chronological log when it helps the next AI understand how the current state was reached.

Example:

```text
TIMELINE
1. User requested X.
2. Inspected files A and B.
3. Implemented Y.
4. Test failed with Z.
5. Changed configuration C.
6. Test passed.
7. Began implementing D.
8. Session limit warning appeared.
```

Do not include irrelevant conversational filler.

---

# 7. Preserve exact user intent

When reconstructing the objective, distinguish between:

- what the user explicitly requested,
- what the AI inferred,
- what the AI recommended,
- what the user approved,
- what remains uncertain.

Never convert an AI suggestion into a user requirement unless the user actually accepted it.

Use labels such as:

`USER REQUIREMENT`
`AI DECISION`
`ASSUMPTION`
`OPEN QUESTION`

when useful.

---

# 8. Handle partially completed tool work

If a tool operation is in progress or a multi-step operation was interrupted, state:

- what operation was being attempted,
- what had already completed,
- what did not complete,
- whether partial side effects may exist,
- how the next AI should verify the state before proceeding.

Never claim an operation succeeded merely because it was requested.

---

# 9. Handle unavailable persistence

If the AI cannot write files, it must still produce the handoff prompt in the final response.

The handoff prompt should then contain any information that would otherwise have been saved to a checkpoint file.

Do not say “the rest is in memory.” The purpose of this skill is to make the handoff independent of the old session.

---

# 10. Security and privacy

The handoff must preserve task state without leaking secrets.

Never include:

- passwords,
- API keys,
- authentication tokens,
- private keys,
- OAuth secrets,
- session cookies,
- secret environment-variable values,
- confidential credentials.

Instead include safe references such as:

`ENV VAR REQUIRED: OPENAI_API_KEY`

or:

`CREDENTIAL PRESENT IN LOCAL ENVIRONMENT; DO NOT PRINT`

Do include non-sensitive configuration details when they are necessary for continuation.

---

# 11. Avoid hallucinated state

The handoff must be factual.

If something is unknown, say:

`UNKNOWN`

If something is inferred, say:

`INFERRED: <statement>`

If something has not been verified, say:

`UNVERIFIED`

Do not manufacture file names, test results, citations, completed features, tool outputs, or user approvals.

---

# 12. Do not waste the remaining budget

Once activation occurs, optimize for **information density**.

Prefer:

- structured headings,
- compact bullets,
- exact names,
- short factual statements,
- tables where useful,
- code snippets only when essential.

Avoid:

- repeated explanations,
- generic apologies,
- long introductions,
- motivational commentary,
- unnecessary formatting discussions,
- speculation.

The remaining budget should be spent on preserving state.

---

# 13. Final response to the user

When handing off, the user-facing response should be brief and operational.

It should communicate:

1. That the current session is stopping because of a detected or credible limit/exhaustion condition.
2. That work has been checkpointed as far as the environment allows.
3. Where the checkpoint was saved, if applicable.
4. That a continuation prompt is included.
5. That the user should paste that prompt into the next AI/session.

Do not continue the original task after the handoff unless there is enough budget and doing so cannot compromise the checkpoint.

Recommended structure:

```text
The session is approaching its usable limit, so I have stopped before risking loss of state.

Checkpoint: <path/file or “included below”>

Paste the continuation prompt below into the next AI/session. It contains the current task state, completed work, unresolved issues, and the exact next step.

<continuation prompt>
```

---

# 14. Optional enhanced handoff metadata

When useful, append a compact metadata section:

```text
HANDOFF METADATA
Task ID: <generated identifier if useful>
Checkpoint time: <timestamp if available>
Phase: <phase>
Estimated completion: <percentage or qualitative phase>
Priority: <high/medium/low>
Next action: <single action>
Files changed: <count>
Known blockers: <count>
```

Do not spend significant remaining budget calculating false precision.

---

# 15. Re-entry behavior for the receiving AI

When another AI receives the handoff prompt, it should:

1. Read the entire handoff before changing anything.
2. Acknowledge the current state internally.
3. Inspect referenced files/tools when available.
4. Verify important claims that can be cheaply verified.
5. Resume from `NEXT ACTION — START HERE`.
6. Preserve completed work.
7. Update the checkpoint as work continues.
8. Trigger this same skill again if another exhaustion signal appears.

The receiving AI should not force the user to repeat information already present in the handoff.

---

# 16. Multi-handoff support

A task may pass through multiple AIs.

When generating a new handoff from an earlier handoff:

- Preserve the original objective.
- Preserve all still-relevant requirements.
- Preserve previously completed work.
- Replace obsolete state with the newest verified state.
- Add newly discovered issues.
- Update the exact next action.

Do not blindly copy stale information.

---

# 17. Best-practice checkpoint cadence

Even without a limit warning, for very large tasks consider creating a lightweight checkpoint at natural boundaries such as:

- after a major implementation phase,
- after completing a large analysis section,
- after a successful build/test,
- before a risky refactor,
- before a major external/tool operation.

However, do not interrupt the user unnecessarily with checkpoint messages.

---

# 18. Critical limitation

This skill **cannot create an ability that the platform itself does not expose**.

If the model is given no reliable information about free-plan usage, token balance, context size, or impending shutdown, it cannot truthfully know that the limit is about to be reached.

Therefore:

- Do not invent a remaining-token number.
- Do not claim to have detected a free-plan limit when none was reported.
- Use explicit platform/tool signals when available.
- Use context-pressure signals only when they are reliable.
- When uncertain, save useful checkpoints at sensible milestones rather than pretending to know the exact depletion point.

The goal is graceful degradation, not fabricated quota awareness.

---

# 19. One-line operating principle

**Detect risk → stop expanding scope → save everything possible → reconstruct the full state → create a self-contained continuation prompt → hand off cleanly.**
