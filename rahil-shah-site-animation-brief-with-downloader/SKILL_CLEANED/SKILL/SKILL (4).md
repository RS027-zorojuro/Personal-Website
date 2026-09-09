---
name: humanizer
version: "4.2.0"
description: |
  Transform AI-sounding prose into natural, credible writing by reconstructing the
  writer's voice, information flow, sentence rhythm, lexical choices, and discourse
  habits. Preserve meaning, evidence, uncertainty, citations, and factual boundaries.
  Prefer genuine voice matching and substantive editing over cosmetic synonym swaps.
license: MIT
---

# Humanizer 4.2

## Mission

Rewrite prose so that it reads like a person deliberately wrote it for a real reader, in a recognizable voice, for a specific purpose.

The goal is **natural authorship**, not a pile of substitutions.

Optimize for writing quality, authorship fidelity, semantic integrity, reader fit, and believable human revision. Do not replace genuine revision with mechanical tricks such as synonym churn, injected mistakes, or arbitrary stylistic distortion.

---

## Core principle: a person is not a distribution of quirks

Bad humanizers usually work at the word level. They replace words, flatten phrases, or sprinkle informal language over text that still has the same machine-shaped architecture.

Good humanization works at several levels at once:

1. **Content**: What is actually being said?
2. **Discourse**: Why is each point here, and why in this order?
3. **Paragraphs**: What is each paragraph doing?
4. **Sentences**: Where does the writer naturally pause, qualify, combine, or cut?
5. **Words**: Which vocabulary would this writer actually choose?
6. **Voice**: What habits make the prose recognizable as this writer's prose?
7. **Pragmatics**: What does the writer assume the reader already knows, and what do they bother explaining?

Research on humanizing attacks supports this multi-scale view. Human edits in one benchmark were performed at word, sentence, and paragraph levels, while the strongest humanizers preserved the source text's tone, vocabulary level, and complexity rather than forcing everything into a generic "human" style.

---

# Non-negotiable rules

## 1. Preserve the informational contract

Never silently change:

- facts
- names
- numbers
- dates
- measurements
- quotations
- citations
- references
- source attribution
- technical definitions
- conclusions
- uncertainty
- scope
- causal relationships
- chronology
- negation
- modality such as "may," "might," "probably," or "must"

You may change wording, order, sentence boundaries, emphasis, and paragraph structure when doing so preserves the same underlying claim.

If the original contains an error, ambiguity, contradiction, or unsupported claim, do not repair it by inventing a fact. Either preserve it, flag it, or simplify the wording without changing the underlying claim.

## 2. Never fabricate human detail

Do not invent:

- childhood memories
- personal experiences
- emotions
- sensory details
- anecdotes
- opinions
- biographical details
- "small mistakes"
- fake citations
- fake quotations
- fake sources
- fake statistics
- fake uncertainty

A sentence does not become human because it contains a made-up personal detail.

## 3. Never manufacture errors to look human

Do not intentionally add spelling mistakes, grammar errors, random capitalization, malformed punctuation, awkward fragments, or missing words.

Natural writers can make mistakes, but deliberate error injection produces artifacts rather than authenticity. One study of humanizers specifically found low-quality tools introducing typos, punctuation problems, nonsensical insertions, fictional citations, and broken sentences. Those are quality failures, not useful human traits.

## 4. Do not synonym-swap mechanically

Never transform a sentence by replacing each noun or verb with a thesaurus alternative while keeping the same syntax.

Bad:

> The project demonstrates substantial improvement in performance.

Mechanical rewrite:

> The project showcases significant enhancement in execution.

Better:

> The project performs better, especially on the larger test cases.

The better version changes the sentence around the intended meaning instead of decorating it.

## 5. Do not force "human" slang

Do not randomly add:

- honestly
- basically
- literally
- you know
- kind of
- to be fair
- I mean
- obviously
- in my opinion
- real talk
- look

These can be natural in the correct voice. They become artificial when inserted as camouflage.

## 6. Do not flatten every writer into the same style

A research paper, lab report, technical explanation, Reddit comment, personal essay, product review, email, and legal memo should not sound alike.

The default target is **the writer's voice**, not "casual English."

## 7. Do not over-correct the writer

Human writing can contain deliberate repetition, unusual punctuation, informal vocabulary, mixed sentence lengths, parenthetical comments, mild awkwardness, and distinctive wording.

Change something only when it improves the intended communication or removes an AI-shaped pattern. Do not sterilize personality.

---

# Step 0: determine the job

Before rewriting, classify the text:

- academic
- technical
- business
- journalistic
- explanatory
- argumentative
- personal
- conversational
- creative
- marketing
- documentation
- mixed

Then identify the intended reader and purpose.

A human rewrite is not a universal style transformation. It is a fit between writer, reader, subject, and purpose.

---

# Step 1: build a writer fingerprint

If the user supplies a sample of their own writing, analyze it before touching the target text.

Extract a compact **Voice Profile**.

### Voice Profile fields

**Sentence rhythm**

- typical sentence length
- short/medium/long balance
- frequency of compound sentences
- tolerance for fragments
- use of rhetorical questions
- how often sentences begin with conjunctions

**Vocabulary**

- simple vs. technical wording
- preferred verbs
- common contractions
- repeated words worth preserving
- words the writer avoids
- domain terminology

**Syntax**

- active/passive preference
- clause density
- coordination vs. subordination
- preferred sentence openings
- tendency to front-load context or action

**Discourse habits**

- direct vs. indirect claims
- how examples are introduced
- how objections are handled
- whether conclusions are explicit or implied
- transition style
- paragraph length

**Punctuation**

- commas
- semicolons
- parentheses
- colons
- quotation style
- dash usage

**Personal markers**

- recurring turns of phrase
- humor
- understatement
- skepticism
- enthusiasm
- uncertainty
- dry commentary
- self-correction

**Register**

- formal
- neutral
- conversational
- technical
- colloquial
- mixed

The sample is authoritative. If the writer naturally uses a pattern that generic anti-AI guidance would prohibit, preserve it unless it is incorrect or harmful to the task.

---

# Step 2: reconstruct the content before rewriting

Do not rewrite from the sentence surface alone.

First create an internal **Meaning Map** containing:

- central claim
- supporting claims
- evidence
- examples
- qualifications
- contrasts
- causes
- consequences
- chronology
- references
- open questions

Then identify the **information hierarchy**:

1. What must survive?
2. What is supporting context?
3. What is repetitive?
4. What is merely decorative?
5. What sounds like an explanation of something that the paragraph has not actually established?

This matters because modern humanizing research distinguishes **content** from **expression**. A text can change its surface form while keeping nearly the same underlying semantic structure. Robust analysis can therefore look beyond the visible wording. The practical implication for this skill is simple: changing words alone is not enough; edit the way the ideas are organized and expressed.

---

# Step 3: diagnose the AI-shaped architecture

Look for clusters, not isolated words.

A single word such as "however" proves nothing. A whole paragraph that repeatedly follows the same template is meaningful.

Flag these patterns:

## A. Generic importance inflation

Examples:

- "plays a crucial role"
- "marks a pivotal moment"
- "serves as a testament"
- "underscores the importance"
- "reflects a broader trend"
- "has become increasingly significant"

Ask:

> Does the sentence provide evidence for that importance, or is it merely announcing importance?

If there is no evidence, make the claim smaller and concrete.

## B. Promotional adjectives without information

Watch for:

- groundbreaking
- cutting-edge
- vibrant
- stunning
- remarkable
- profound
- renowned
- exceptional
- transformative
- innovative
- seamless

Replace with a concrete property, or delete the adjective.

## C. Repeated rhetorical templates

Watch for repeated constructions such as:

- "Not only X, but Y"
- "It's not just X; it's Y"
- "From X to Y"
- "Whether X or Y"
- "This highlights..."
- "This underscores..."
- "This demonstrates..."
- "In today's..."
- "In an increasingly..."
- "At its core..."
- "The real question is..."

Do not ban the grammar. Ban **unnecessary repetition of the template**.

## D. Uniform sentence cadence

AI-like prose often has a parade of similarly sized sentences with similar syntactic shape.

Do not solve this by randomly making sentences short and long.

Instead, let information density determine sentence shape:

- one simple sentence for a clean fact
- a longer sentence when conditions or qualifications belong together
- a short sentence when the writer genuinely wants emphasis
- a compound sentence when two closely related actions belong together

Research using burstiness and sentence-level statistics treats variation in sentence complexity as a measurable property, but also shows that no single stylometric feature reliably separates human and generated text. Use rhythm as a writing-quality principle, not a numeric target.

## E. Perfectly smooth transitions everywhere

Human writers do not need to announce every relationship.

Remove transitions that merely tell the reader that another paragraph is coming:

- "Furthermore"
- "Moreover"
- "Additionally"
- "Moving on"
- "Let's dive into"
- "Now let's explore"
- "This brings us to"

Keep a transition when the relationship itself matters.

## F. Paragraphs that summarize themselves

Watch for:

> ## Benefits
> Benefits are important for several reasons.

The heading already did that job.

Start with the actual point.

## G. Repetition disguised as elaboration

AI prose often states a point, restates it in different words, and then announces its significance.

Ask of each sentence:

> Does this sentence add information, qualify the claim, provide evidence, give an example, or improve the reader's understanding?

If not, cut or merge it.

## H. Generic conclusions

Watch for endings such as:

- "The future looks bright."
- "This represents a major step forward."
- "These findings highlight the importance of..."
- "Exciting developments lie ahead."

End on the last useful idea unless the source contains a real conclusion.

## I. Fake depth

Watch for phrases that imply a deeper truth without supplying one:

- "at its core"
- "the deeper issue"
- "what really matters"
- "the heart of the matter"
- "fundamentally"

Replace the abstraction with the specific relationship being claimed.

## J. Defensive prose

Remove answers to objections nobody raised:

- "To be clear..."
- "Don't get me wrong..."
- "I'm not saying..."
- "This isn't really about..."
- "You could argue... but..."

Keep them when the text genuinely contains an objection or a named counterargument.

## K. Fake alternatives

Do not invent an option simply to reject it:

> One might think the system should restart every hour, but...

If nobody raised that option and it adds nothing, delete it.

## L. Synonym cycling

Do not rotate among:

> protagonist → main character → central figure → hero

Use the natural noun. Repetition is sometimes exactly what a real writer would do.

## M. Over-structuring

Do not turn every answer into:

1. Introduction
2. Key point 1
3. Key point 2
4. Key point 3
5. Challenges
6. Future outlook
7. Conclusion

Use the structure the material actually needs.

---

# Step 4: rewrite at paragraph scale first

This is the most important upgrade over simple humanizers.

For each paragraph:

1. State its actual job in one sentence internally.
2. Decide what the reader needs to know first.
3. Remove repeated setup.
4. Move evidence next to the claim it supports.
5. Merge sentences that belong together.
6. Split overloaded sentences when they contain separate ideas.
7. Move a sentence to another paragraph when its role is wrong.
8. Preserve the author's natural order when that order is meaningful.

Human editors in the Triospect benchmark deliberately changed the text at word, sentence, and paragraph levels, including logical-flow reorganization. That is a better model of revision than word substitution alone.

---

# Step 5: rewrite at sentence scale

## Prefer direct verbs

Prefer:

- is
- has
- uses
- shows
- explains
- causes
- gives
- allows
- prevents
- includes

over ornamental wrappers:

- serves as
- functions as
- stands as
- offers the ability to
- provides an opportunity to
- plays a role in

Unless the longer form carries meaning the short form does not.

## Change syntax, not just vocabulary

Possible operations:

- active ↔ passive where appropriate
- combine adjacent sentences
- split overloaded sentences
- change the clause order
- move the main point to the beginning
- delay a qualification until it matters
- replace a noun-heavy construction with a verb
- use a concrete subject

Example:

> The implementation of the algorithm resulted in a reduction in processing time.

Possible rewrite:

> The algorithm reduced processing time.

## Keep natural asymmetry

Not every sentence needs the same grammatical polish.

A believable writer may write:

> The first test worked. The second one didn't, and that was the weird part.

Do not force:

> The first test was successful, whereas the second test was unsuccessful, which was unexpected.

---

# Step 6: calibrate lexical diversity without sounding like a thesaurus

The objective is **appropriate variation**, not maximum variation.

Research shows that lexical diversity is measurable, but higher diversity is not automatically more human or better. Different generation methods can produce very different vocabulary profiles, and diffusion-generated text can even look human-like on some statistics.

Use the following rules:

- Repeat the exact technical term when precision matters.
- Repeat the noun when synonym replacement would make the reference less clear.
- Vary ordinary verbs when the writer naturally would.
- Replace abstract nouns with verbs when possible.
- Prefer familiar words unless the writer's register calls for something else.
- Never upgrade vocabulary merely to make it look sophisticated.
- Never downgrade vocabulary merely to make it look casual.

The strongest humanizers studied in DAMAGE preserved the source's writing level and tone instead of imposing a universal vocabulary level.

---

# Step 7: restore believable rhythm

Use **organic rhythm**, not random rhythm.

### Good variation

> The API is fast for small requests. Once the payload gets large, though, latency starts to climb. That was the first thing we noticed in testing.

### Bad variation

> The API is fast. Large payloads increase latency significantly. Interestingly, this was the first thing that we noticed during our testing process.

The second version changes sentence length superficially while keeping the same template-driven cadence.

### Rhythm controls

Across a paragraph, vary naturally:

- sentence length
- clause count
- sentence openings
- information density
- explicitness
- punctuation

Do not force every paragraph to contain a short sentence.

Do not force every paragraph to contain a long sentence.

---

# Step 8: make transitions carry information

Bad transition:

> Furthermore, another important factor to consider is cost.

Better:

> Cost changes the trade-off completely.

Best when supported by context:

> The cheaper model also needs more retries, so its lower per-request price does not always mean a lower total cost.

The last version does not merely connect paragraphs. It tells the reader why the next point matters.

---

# Step 9: preserve real human texture

Human texture comes from **specificity and authorship**, not random imperfections.

Keep genuine:

- concrete details
- unusual examples
- mild preferences
- uncertainty
- mixed feelings
- qualifications
- self-corrections
- references to what the writer has already established
- recurring vocabulary that genuinely belongs to the writer
- culturally or temporally specific expressions
- occasional parenthetical remarks when they fit the voice

A paper examining robust detection attacks notes an important distinction: human writing can carry rich, specific semantic content, and rewriting the surface while leaving the underlying meaning intact does not necessarily erase source-related signals. For humanization quality, this means that specificity should come from the actual source material, not from decorative invention.

---

# Step 10: match the writer, not an imagined "average human"

If a sample exists, reproduce the **distribution of habits**, not the exact wording.

For example, if the writer:

- uses short openings but long explanatory middles, preserve that rhythm;
- uses contractions often, do not expand them all;
- uses technical terms comfortably, do not dumb them down;
- writes bluntly, do not make them diplomatic;
- uses parentheses occasionally, keep the habit at roughly the same rate;
- uses humor sparingly, do not turn the prose into comedy;
- writes in first person, preserve the perspective;
- avoids first person, do not insert it.

Do not imitate a sample so closely that the result becomes a parody of the writer.

---

# Step 11: handle academic and technical text differently

For academic/technical text:

- preserve terminology
- preserve citation placement unless grammar requires movement
- preserve claims and qualifiers
- avoid fabricated authority
- avoid casual filler
- prefer precise verbs
- cut inflated framing
- keep useful hedging
- do not introduce personal anecdotes unless supplied
- do not intentionally lower grammar quality

A detector-bias study found that lower perplexity and narrower linguistic variation can cause false positives for non-native English writers. Therefore, never treat "simple English" or a narrow vocabulary as evidence of poor writing, and never rewrite a legitimate writer into exaggerated complexity merely to appear more natural.

For technical writing, correctness outranks stylistic novelty.

---

# Step 12: handle conversational text differently

For conversational text:

- contractions may be natural
- fragments may be acceptable
- direct questions can work
- mild repetition can be intentional
- context can remain implicit
- tone matters more than formal polish

But do not manufacture slang or filler.

---

# Step 13: handle personal writing differently

Personal writing can preserve:

- uncertainty
- ambivalence
- first-person perspective
- incomplete thoughts
- emotional understatement
- idiosyncratic examples
- genuine self-corrections

Do not turn every feeling into a polished thesis statement.

Bad:

> This experience profoundly transformed my perspective and taught me the invaluable importance of resilience.

Better:

> I thought I understood the situation. I didn't, at least not until later.

Only use the second pattern when it matches the source or supplied writer voice. Do not manufacture introspection.

---

# Step 14: eliminate artificial humanizer artifacts

Before finalizing, search specifically for damage patterns documented in poor humanizers:

- hallucinated citations
- unexplained parenthetical references
- random question marks
- malformed punctuation
- incomplete sentences
- irrelevant comments
- foreign fragments
- accidental code-like strings
- nonsensical words
- wrong-context synonyms
- sudden vocabulary-level shifts
- personal pronouns that the source never needed
- paragraph splits that destroy logical flow
- redundant sentences added only to increase variation

DAMAGE's audit found exactly these failure modes in weaker humanizers, while higher-quality systems were characterized by faithfulness and fluency.

---

# Step 15: use controlled structural variation

Do not make every sentence independent.

Allowed operations include:

### Combine

> The server restarted. The cache was cleared.

→

> The server restarted, which also cleared the cache.

### Split

> The server restarted after the deployment, which cleared the cache and forced every client to reconnect.

→

> The server restarted after the deployment. That cleared the cache and forced every client to reconnect.

### Reorder

> Because the cache was invalid, the client retried the request.

→

> The client retried the request because the cache was invalid.

### Compress

> In order to achieve the desired result, the team made the decision to reduce the number of retries.

→

> The team reduced the number of retries.

### Expand only when the source supports it

> The model failed.

→

Do not invent a reason. Expansion is allowed only if the surrounding text already provides one.

---

# Step 16: use discourse-level decisions that ordinary humanizers miss

Ask these questions for every paragraph:

### 1. Where would this writer naturally stop?

Do not force every paragraph into the same size.

### 2. What does the writer assume?

A knowledgeable writer should not repeatedly explain the same obvious term.

### 3. What does the writer emphasize?

Move emphasis by changing order or detail, not by adding adjectives.

### 4. What would this writer omit?

Human writing is selective. Remove generic commentary when it adds no value.

### 5. What is the writer's relationship with the reader?

Teacher? Colleague? Friend? Customer? Reviewer? Examiner?

### 6. What does the writer leave unresolved?

Do not force every passage into certainty.

---

# Step 17: perform a second reconstruction, not a second paraphrase

After the first rewrite, do not simply run another synonym pass. Re-read the revised passage as a whole and ask where the prose still feels templated, over-smoothed, generic, or unlike the writer.

Use this second pass to make **meaningful** changes only where needed:

- merge sentences that repeat the same thought
- split overloaded sentences when the writer's voice would do so
- move a sentence when the paragraph's logic would be clearer
- replace an unnecessarily formal word with the writer's ordinary choice
- restore a useful specific detail that was lost
- remove decorative phrasing that contributes no information
- vary cadence where the paragraph has become mechanically even
- preserve deliberate repetition when it creates emphasis

Never create variation merely for the sake of variation. Every structural change must have a reason grounded in the source, the writer's voice, or the reader's needs.


# Step 18: final two-pass review

## Pass A: human editor review

Read the whole passage as a reader.

Ask:

- Does this sound like one person wrote it?
- Does the voice stay stable?
- Does each paragraph have a reason to exist?
- Are the transitions earned?
- Are there sentences that sound written to impress rather than communicate?
- Are any words more sophisticated than the writer needs?
- Are any details suspiciously generic?
- Does the text contain unnecessary throat-clearing?
- Does the conclusion say something concrete?
- Does the prose still sound good when read aloud?

## Pass B: integrity review

Compare against the source.

Verify:

- every claim survived
- no claim was strengthened
- no claim was weakened accidentally
- no number changed
- no date changed
- no citation changed
- no attribution changed
- no quotation changed
- no uncertainty disappeared
- no new fact appeared
- no personal detail was invented
- no reference was fabricated

If a conflict exists between elegance and factual fidelity, choose fidelity.

---

# The naturalness test

Do not ask only:

> "Does this sound human?"

Ask:

> "Can I imagine a particular person choosing these exact words for this particular audience?"

Then ask:

> "Would this person have organized the paragraph this way?"

Then:

> "Is any sentence here performing sophistication instead of communicating information?"

Then:

> "Did I change the writer, or did I merely remove machine-shaped writing?"

The last question is the most important.

---

# Red-flag phrase families

These are **diagnostic prompts**, not a banned-word list.

### Importance inflation

`crucial`, `pivotal`, `significant`, `key role`, `testament`, `underscores`, `highlights`, `marks a turning point`, `enduring`, `lasting impact`, `broader trend`, `evolving landscape`

### Promotional language

`vibrant`, `stunning`, `breathtaking`, `groundbreaking`, `renowned`, `cutting-edge`, `seamless`, `innovative`, `transformative`, `exceptional`

### Artificial depth

`at its core`, `fundamentally`, `the real question`, `the deeper issue`, `what really matters`, `the heart of the matter`

### Announcement language

`let's dive in`, `let's explore`, `here's what you need to know`, `now let's look at`, `without further ado`, `quick note`

### Defensive language

`to be clear`, `don't get me wrong`, `this isn't about`, `I'm not saying`, `this is not to say`

### Generic optimism

`the future looks bright`, `exciting times ahead`, `a major step forward`, `continues to thrive`, `the possibilities are endless`

### Chatbot residue

`I hope this helps`, `certainly`, `of course`, `you're absolutely right`, `let me know if you'd like`, `would you like me to`

Again: one occurrence is not proof of anything. Judge clusters and context.

---

# What not to do

Never:

- run blind synonym replacement
- change every sentence structure
- force random sentence lengths
- inject grammar mistakes
- add slang to formal writing
- make academic prose "casual"
- remove technical terminology that carries meaning
- replace repeated technical nouns with vague synonyms
- fabricate anecdotes
- fabricate citations
- add unnecessary first-person language
- invent counterarguments
- invent examples
- invent emotional reactions
- add headings just because the text is long
- turn prose into bullet points unless the task calls for it
- turn every paragraph into a miniature essay
- end every section with a summary sentence
- use a fake "human" persona

---

# Preferred rewrite workflow

Use this order unless the task clearly requires otherwise:

### Phase 1: Understand

1. Read the entire source.
2. Identify genre, audience, purpose, and register.
3. Build the Meaning Map.
4. Extract the Voice Profile if a sample exists.

### Phase 2: Diagnose

5. Mark inflated claims.
6. Mark generic framing.
7. Mark repetitive templates.
8. Mark uniform cadence.
9. Mark paragraph-level redundancy.
10. Mark artificial transitions.
11. Mark defensive or fake-candid prose.
12. Mark noun-heavy constructions and passive wording where they obscure the actor.

### Phase 3: Rebuild

13. Reorganize paragraphs where needed.
14. Rewrite sentence structures.
15. Adjust word choices to the author's natural vocabulary.
16. Restore natural rhythm.
17. Keep genuine writer-specific details.
18. Remove decorative language that does not carry meaning.

### Phase 4: Verify

19. Read the result as a human reader.
20. Compare it with the source.
21. Check every factual and semantic constraint.
22. Remove accidental additions.
23. Check for humanizer artifacts.
24. Return the finished rewrite in the requested format.

---

# Multi-scale scoring rubric

Use this internally to judge the draft. Do not expose a fake numerical score unless the user asks for one.

## Voice fidelity

**Excellent**: Could plausibly be written by the supplied writer.

**Weak**: Sounds like generic polished internet prose.

## Semantic fidelity

**Excellent**: Same claims, evidence, uncertainty, and scope.

**Weak**: Small wording changes quietly alter the argument.

## Structural naturalness

**Excellent**: Paragraph and sentence boundaries feel chosen rather than templated.

**Weak**: Every paragraph follows the same architecture.

## Lexical authenticity

**Excellent**: Vocabulary fits the writer and subject.

**Weak**: Thesaurus language, inflated diction, or random simplification.

## Rhythm

**Excellent**: Sentence complexity varies because the ideas vary.

**Weak**: Variation is obvious and mechanical, or every sentence has the same cadence.

## Specificity

**Excellent**: Real details from the source carry the voice.

**Weak**: Generic observations replace concrete details.

## Restraint

**Excellent**: The rewrite changes what needs changing and leaves good writing alone.

**Weak**: The entire passage has been unnecessarily remodeled.

## Integrity

**Excellent**: No unsupported information was added.

**Weak**: The rewrite contains invented facts, citations, experiences, or claims.

---

# Output rules

## Pasted text

Return:

1. the final rewrite first when the user asks for a direct rewrite;
2. a compact note of the major changes only when useful;
3. no long self-congratulating explanation;
4. no claim that the text is "undetectable."

## File mode

When the user names a file:

- rewrite only the prose unless instructed otherwise;
- preserve code blocks exactly;
- preserve YAML/front matter unless the user asks to edit it;
- preserve link targets;
- preserve citations and references;
- preserve tables unless prose inside them is the target;
- return only the final rewritten file contents inside the output file;
- provide a brief summary outside the file.

## Embedded mode

When another task embeds this skill:

- return only the transformed text unless the parent task asks for analysis.

---

# Special handling for a supplied writing sample

If a sample is provided, do not simply copy its vocabulary.

Infer the **latent style rules**:

- preferred level of directness
- typical sentence rhythm
- typical paragraph size
- preferred amount of explanation
- amount of uncertainty
- amount of personality
- preferred technical depth
- use of contractions
- punctuation habits
- tolerance for fragments
- preferred transition density
- whether the writer tends to state conclusions early or late

Then rewrite the target text under those rules.

A voice match is successful when the target feels as though the same person wrote it about a different subject, not when it merely contains the same favorite words.

---

# Naturalness and authorship-quality pass

Use this pass whenever prose feels unnaturally uniform, generic, over-smoothed, or unlike the writer's normal habits. The objective is ordinary, defensible human editing: remove artificial uniformity while preserving the writer's actual voice, level, and meaning.

## 1. Preserve real linguistic range

Keep a natural mix of:

- shorter and longer sentences
- common words and necessary technical terms
- direct statements and occasional elaboration
- explicit transitions and places where the relationship is obvious without one
- normal repetition of important nouns when replacing them would make the prose less precise

Do not inflate vocabulary or complexity merely to make writing appear sophisticated. Genuine writers can have narrower linguistic variation, and the supplied research shows that this can contribute to false positives.

## 2. Vary structure because the meaning requires it

When several sentences share the same architecture, reconstruct the affected passage around its actual ideas. Prefer meaningful changes such as combining related claims, splitting overloaded sentences, moving a qualification, changing the point of emphasis, or replacing a noun-heavy construction with a direct verb.

Never introduce random variation. Never force a quota for sentence lengths or structures.

## 3. Preserve genuine specificity

Keep concrete details, examples, dates, technical terminology, source-specific observations, and the writer's real distinctions. Generic paraphrasing often makes prose weaker and less distinctive.

Never invent personal experiences, anecdotes, mistakes, citations, emotions, opinions, or biographical details.

## 4. Remove artificial smoothness without manufacturing flaws

Natural writing can contain asymmetry: a compact follow-up sentence, an ordinary parenthetical, a less formal transition, or a paragraph that does not follow a perfect template. Preserve such features when they fit the writer.

Do not inject typos, deliberate grammar errors, strange punctuation, fake hesitation, nonsense, or awkward wording. The supplied humanizer audit identified these as failure modes of weak systems rather than reliable markers of authentic writing.

## 5. Inspect discourse fingerprints

Check the whole document for repeated templates such as:

- every paragraph beginning with a formal transition
- every paragraph ending with a mini-summary
- repeated "This ... This ... This ..." openings
- repeated "However / Additionally / Furthermore" chains
- repeated definition -> example -> implication structures when unnecessary
- repeated "not only X but also Y" constructions
- unnaturally symmetrical headings or section shapes

Keep repetition when it is functional, technically necessary, or clearly part of the writer's voice.

## 6. Final editor test

Before returning the rewrite, ask:

1. Does this feel like one writer making context-sensitive choices?
2. Does every paragraph have a clear reason to exist?
3. Is variation driven by meaning rather than by a recipe?
4. Is the vocabulary level faithful to the writer?
5. Did the rewrite preserve every factual claim, citation, and qualification?
6. Did any sentence become more polished at the cost of sounding unlike the writer?

If the answer to any of these is no, revise the affected passage before finalizing.

# Research-derived design principles

The supplied research supports the following design decisions:

1. **Natural revision is multi-level.** Stronger human editing changes words, sentence syntax, and paragraph-level logical flow rather than relying on word substitution alone.

2. **Voice calibration matters.** Better humanizers preserve the source's tone, vocabulary level, and complexity instead of forcing every document into the same register.

3. **Meaning preservation is a first-class requirement.** Weak humanizers can introduce nonsense, broken syntax, punctuation errors, invented citations, and meaning drift. The skill must aggressively reject those failures.

4. **Human prose has uneven rhythm.** Useful variation can occur in sentence length, syntax, transitions, and paragraph shape, but it should emerge from the writer's habits rather than from an arbitrary recipe.

5. **Specific meaning matters.** Research on content and expression suggests that preserving only surface wording is insufficient. Human writing often contains richer, more specific semantic content, so the rewrite should retain concrete information rather than replacing it with generic abstractions.

6. **Linguistic simplicity is not evidence of poor authorship.** Do not inflate vocabulary merely to make a passage sound sophisticated. The writer's actual language level should win.

7. **Reference text can improve voice matching, but not factual grounding.** A supplied writing sample can guide vocabulary, rhythm, syntax, and discourse habits. It must never be mined for facts to insert into the target text.

8. **Quality control must be global.** A passage should be judged as a complete piece of writing, not as a collection of individually improved sentences.

# Source basis

This version was developed from the supplied materials:

- Tarım & Onan, **Can You Detect the Difference?** (2025). The paper compares AR and diffusion-generated text using perplexity, burstiness, lexical diversity, grammar-error rate, semantic consistency, BLEU, and ROUGE, and shows that single metrics are insufficient.
- Bao et al., **Triospect: A Three-Dimensional Framework for Robust Statistical AI-Generated Text Detection Against Diverse Attacks** (2026). The framework separates content and expression and evaluates humanizing attacks across multiple models, domains, and attack types.
- Roe et al., **Dramaturgies of Deception: AI Humanizers and the Performance of Legitimacy in Higher Education Assessment** (2026 preprint). The study documents how humanizers frame rewriting through authenticity, legitimacy, technical mystification, and student-facing rhetoric.
- Liang et al., **GPT detectors are biased against non-native English writers** (2023). The study reports substantial false-positive differences and shows why linguistic simplicity cannot be treated as proof of AI authorship.
- Masrour, Emi & Spero, **DAMAGE: Detecting Adversarially Modified AI Generated Text** (2025). The audit covers humanizer quality, faithfulness, fluency, and adversarial robustness, including common low-quality transformation artifacts.

The existing skill already had useful guidance on inflated claims, vague sourcing, forced rhetorical patterns, repetitive sentence openings, filler, chatbot residue, and false positives. This version keeps those foundations but moves the process from phrase-level cleanup to multi-level voice reconstruction and integrity checking.

---

# Naturalness stress test

After the main rewrite, perform a separate pass whose only purpose is to catch prose that still feels templated or unnaturally uniform.

## 1. Rhythm audit

Read the passage as prose, not as a checklist.

Look for:
- long runs of similarly sized sentences
- repeated sentence templates
- paragraphs with identical internal structure
- repeated subject -> verb -> explanation constructions
- transitions appearing at predictable intervals
- every sentence carrying the same level of grammatical complexity

Fix the architecture, not just individual words.

Do not force randomness. Human writing has patterns too. The goal is believable variation tied to meaning.

## 2. Predictability audit

Inspect places where the next sentence feels mechanically obvious.

Examples of warning signs:
- a paragraph always ends with a summary sentence
- every claim is followed by an explanation of equal length
- every section begins with a generic topic sentence
- every transition explicitly announces the relationship
- conclusions repeat the introduction instead of adding a consequence

When a structure is unnecessary, remove it. When the relationship matters, express it naturally.

## 3. Specificity audit

Prefer concrete information that already exists in the source over generic abstractions.

Replace vague constructions such as:

> This highlights the importance of the issue.

with the actual consequence described by the source.

Do not invent supporting detail to make prose more vivid.

## 4. Lexical calibration

Vary vocabulary only where a real writer would.

Do not maximize vocabulary diversity. A person often reuses useful words, especially technical terms, because precision matters more than avoiding repetition.

Preserve domain terms and recurring terminology when changing them would reduce precision.

## 5. Discourse authenticity

Check whether the writer appears to:
- notice some details but ignore others
- explain some obvious points and skip others
- qualify only claims that actually need qualification
- emphasize information unevenly
- move between broad and narrow observations naturally

Avoid making every paragraph equally polished, equally balanced, or equally explicit.

## 6. Paragraph reconstruction

If the source has machine-shaped paragraphs, do not merely polish their sentences.

Instead ask:

> What is this paragraph actually trying to accomplish?

Then rebuild it around that function.

Possible changes include:
- combining two short paragraphs
- splitting an overloaded paragraph
- moving an example before its explanation
- moving a qualification closer to the claim it limits
- removing a redundant concluding sentence
- changing where the paragraph turns from description to interpretation

## 7. Source-fidelity verification

Compare the rewritten version against the source after reconstruction.

Check:
- every factual claim survives
- no factual claim was added
- no citation changed
- no quotation was rewritten as if it were paraphrase
- no uncertainty became certainty
- no causal relationship was introduced or removed
- no example was silently replaced
- no scope was broadened
- no technical meaning drifted

If a stylistic improvement conflicts with fidelity, fidelity wins.

## 8. Human-editor test

Pretend an experienced human editor received the text and was asked to improve it without changing its substance.

Ask:

1. What would they cut?
2. What would they combine?
3. Where would they change the order?
4. Which sentence sounds written because it is the easiest statistically likely sentence rather than because it is the best sentence for this writer?
5. Which phrase sounds like an editing instruction leaked into the prose?
6. Which paragraph has been polished so uniformly that it no longer feels authored?

Make only changes that have a concrete answer.

## 9. Anti-camouflage rule

Do not attempt to simulate humanity through a fixed bag of tricks.

Never apply a universal recipe such as:
- add contractions everywhere
- add typos
- shorten every sentence
- lengthen every third sentence
- replace formal words with casual ones
- insert first-person language
- add rhetorical questions
- add slang
- force punctuation variety
- deliberately lower grammar quality

A genuine writer's style emerges from the interaction of all the choices above, not from any one detectable trick.

## 10. Final read-aloud simulation

Read the final version mentally as if it were being spoken by the intended writer.

Listen for:
- unnatural pauses
- repeated cadence
- over-explaining
- abrupt topic shifts
- sentences that sound impressive but say little
- transitions no real person would need
- vocabulary that feels borrowed from a thesaurus
- claims that sound stronger than the evidence

Rewrite the affected sentence or, preferably, the surrounding paragraph.

Do not patch isolated words repeatedly when the paragraph itself is the problem.

---

# Final output rule

The finished text should read as if one person wrote it for a real audience and then revised it because they cared about what they were saying.

Do not expose the internal rewrite process unless the user explicitly requests an explanation.

Return the requested artifact only, using the output format specified by the calling context.

---

# Advanced Naturalness & Asymmetry 4.2

This extension governs the final reconstruction pass. It is subordinate to factual fidelity, writer-voice fidelity, genre fit, and the informational contract above.

## Step 19: Extreme Rhythm and Cadence Variation

Do not let paragraphs fall into a repetitive machine-shaped rhythm. Vary sentence length, clause density, openings, and paragraph shape according to the writer's established voice and the genre.

Use **strong asymmetry**, but do not manufacture it mechanically.

### Cadence requirements

- Break up runs of similarly sized sentences.
- Mix short, medium, and long sentences when the source and writer's voice permit it.
- Use an occasional standalone sentence when that improves emphasis or pacing.
- Where a short sentence is used for emphasis, place it near a materially more complex sentence when that contrast sounds natural.
- Avoid producing a document in which every paragraph follows the same topic-sentence → support → conclusion blueprint.
- Do not force every section to contain a short sentence merely to satisfy a numeric quota. If the genre or writer would make that pattern unnatural, prefer authentic rhythm over checklist compliance.
- Do not split sentences or paragraphs simply to create statistical irregularity. Structural changes must improve emphasis, flow, or voice.

### The 5-Word Rule

A short sentence under five words may be used in a major section when it fits naturally. It is a tool for cadence, not a mandatory decoration.

Examples:

> That changed everything.

> The result was different.

> It took longer.

Never insert a short sentence that contributes no information merely to satisfy this rule.

### Sharp contrast

When appropriate, let a very short sentence sit beside a substantially longer sentence with multiple clauses, qualifications, or embedded detail. The contrast should arise from the argument or voice rather than from an arbitrary word-count target.

### Structural isolation

An isolated paragraph can be useful for a key conclusion, correction, observation, or transition. Use single-sentence paragraphs sparingly and only where a human writer would plausibly use them.

---

## Step 20: Lexical Unpredictability

Avoid default, overused wording when a clearer and more natural alternative exists.

### Default-verb avoidance

Prefer not to use these verbs when they add corporate or academic padding:

- utilize
- facilitate
- ensure
- leverage
- implement
- enhance
- foster

Do not replace them with an equally artificial synonym. Prefer the ordinary verb that actually describes the action.

Examples:

- `utilize` → `use`
- `facilitate communication` → `help people communicate`
- `leverage the dataset` → `use the dataset`
- `implement a solution` → `build`, `add`, or `apply`, depending on the actual action
- `enhance performance` → `improve performance`, or name the concrete improvement

### Unexpected phrasing

When the writer's voice supports it, choose a more specific phrase over the most generic formal phrase. Specificity should come from the source's actual meaning, not invented detail.

Prefer:

> The script reads the CSV, drops empty rows, and writes the cleaned table back out.

over:

> The system processes the data and improves workflow efficiency.

### Colloquial pivots

Use conversational transitions such as `but`, `and`, or `because` when they match the writer's voice and the genre. Sentence openings with conjunctions are allowed when they sound deliberate rather than inserted as a trick.

Do not add casual language to academic, legal, technical, or formal material merely to make it appear less polished.

---

## Step 21: Asymmetrical "Lived" Specificity

Ground the prose in the most concrete constraints actually present in the source.

Replace vague summaries with source-supported specifics whenever the source already provides them.

Weak:

> The project was delayed.

Stronger when supported by the source:

> The migration stalled after the staging environment repeatedly timed out.

Do not turn the example above into a fact unless the source actually says it.

### Specificity hierarchy

Prefer, in order:

1. exact source details
2. explicit context supplied by the user
3. clearly stated qualifications already present in the source
4. concise general wording when no concrete detail exists

Never invent a realistic-sounding constraint simply because the original is vague. If a concrete fact is missing, preserve the uncertainty or state that the source does not specify it.

### Human asymmetry

Allow genuine parenthetical asides, self-corrections, qualifications, or small shifts in emphasis when the writer's voice supports them.

Examples:

> The first test passed, although the second one failed on the larger input.

> The change looks minor at first (it is only one function), but it affects the whole request path.

> I expected the cache to help here. It did not.

These devices must carry real meaning. Never inject fake autobiography, fake emotion, or fake uncertainty.

---

## Step 22: Generative Probability Override

Do not always choose the first or most predictable wording that expresses the idea. During drafting, actively compare several plausible constructions and select the one that best matches the writer's voice, context, and meaning rather than the most generic formulation.

This applies to:

- synonym selection
- transitions
- clause ordering
- sentence openings
- paragraph ordering
- whether two related ideas are combined or separated
- whether a qualification appears early or late

The objective is **natural variance**, not forced randomness.

Never sacrifice semantic accuracy for novelty. Do not deliberately select an obscure word when a common word is the better fit.

---

# Full architectural rewrite directive

Your job is to rewrite **everything provided** to maximize natural human texture, authorial specificity, and believable sentence rhythm while preserving the source's actual meaning.

Do **not** treat the task as:

- grammar correction only
- thesaurus substitution
- one-word paraphrasing
- sentence-by-sentence cosmetic editing
- random slang injection
- deliberate error injection

Treat it as a **complete architectural rebuild of the prose from beginning to end**.

Read the whole passage before rewriting any part of it.

Then rebuild it around:

1. what the writer is actually trying to say
2. what the reader needs to know
3. how this particular writer tends to say things
4. which details deserve emphasis
5. where the prose naturally speeds up, slows down, qualifies itself, or changes direction

---

# Absolute priority: authentic cadence variation

Extreme cadence variation is important, but it must remain subordinate to authenticity.

Aim to:

- shatter repetitive paragraph blueprints
- avoid evenly sized sentences throughout a passage
- vary sentence length and clause structure
- use occasional short emphasis sentences
- use occasional long, syntactically richer sentences
- vary sentence openings
- combine ideas when the writer would naturally combine them
- split ideas when the writer would naturally pause or pivot
- occasionally isolate a sentence as its own paragraph when that improves emphasis

Do not impose a fixed mathematical pattern on every paragraph. A visible formula is itself a form of artificiality.

---

# Vocabulary and prediction rules

Prefer precise, ordinary, writer-specific language over inflated corporate or academic wording.

Avoid the banned default verbs listed in Step 20 unless they are unavoidable in a fixed technical phrase, quotation, title, proper name, or source excerpt.

Do not replace them with equally generic alternatives merely to dodge a blacklist.

Choose wording because it fits the writer and the sentence, not because it scores differently against an external metric.

---

# Specificity and grounding pass

Before finalizing each paragraph, ask:

- What exact thing is being described?
- Is there a number, condition, example, object, action, or relationship already present that can replace a vague abstraction?
- Did the rewrite accidentally generalize something the source stated precisely?
- Did the rewrite add a concrete detail that the source never supplied?

Use exactness when supported. Preserve uncertainty when exactness is not supported.

---

# Per-submission execution protocol

For every paragraph or passage submitted, perform these passes internally before returning the final rewrite.

## 1. Core Extraction

Identify:

- the actual underlying meaning
- the main claim
- supporting points
- evidence or examples
- qualifiers
- causal or temporal links
- any wording that must remain exact

Do not show this analysis unless the user explicitly asks for it.

## 2. Structural Breakdown

Identify the original paragraph's architecture.

Then deliberately consider alternatives:

- combine adjacent sentences
- split overloaded sentences
- move a qualification
- change a sentence opening
- change paragraph boundaries
- foreground a concrete detail
- postpone a conclusion until the evidence has appeared

Choose the structure that best matches the writer and purpose.

## 3. Rhythm Injection

Apply the cadence rules above.

Look specifically for:

- repeated sentence lengths
- repeated syntactic templates
- identical paragraph shapes
- repetitive subject openings
- excessive strings of similarly weighted clauses
- missing moments of emphasis

Introduce natural asymmetry where useful.

## 4. Specificity Pass

Replace generic wording with source-supported concrete wording.

Add parenthetical asides or self-corrections only when they express real relationships, qualifications, or voice already supported by the material.

Never invent a factual constraint merely to make the passage feel lived-in.

## 5. Lexical Pass

Remove predictable corporate padding and banned default verbs where possible.

Check that:

- replacements are ordinary enough for the writer
- technical terms remain technically correct
- vocabulary difficulty matches the original writer
- no word feels unusual merely for the sake of unpredictability

## 6. Final Polish

Read the complete passage as one piece.

Check:

- Does the paragraph flow naturally into the next one?
- Does the rhythm feel deliberately written rather than algorithmically varied?
- Are there any suspiciously symmetrical sentences?
- Are transitions doing real work?
- Does the writer sound like the same person throughout?
- Have any facts, qualifications, or citations changed?
- Did any invented detail slip in?

If the prose still feels manufactured, rebuild the affected paragraph rather than patching individual words.

---

# Active quality control

Before finalizing any rewrite, internally check all of the following:

### Meaning integrity

- No fact changed.
- No citation changed.
- No number changed.
- No date changed.
- No quote altered.
- No uncertainty strengthened or weakened.
- No causal relationship introduced or removed.
- No missing evidence silently replaced with an assumption.

### Naturalness

- Sentence lengths vary naturally.
- Paragraph lengths vary when the writer's voice supports it.
- Sentence openings are not mechanically repetitive.
- Syntax is not copied sentence-for-sentence from the source.
- The prose does not read like a sequence of synonym substitutions.
- Vocabulary fits the writer's register.
- Concrete details remain visible.
- Parenthetical or self-correcting phrasing, when present, carries actual meaning.

### Quality

- No fake mistakes.
- No fake citations.
- No nonsense phrases.
- No invented anecdotes.
- No fabricated personal details.
- No arbitrary slang.
- No ornamental complexity that makes the prose worse.
- No needless repetition.
- No generic motivational ending unless the source itself calls for one.

### Cadence check

Ask:

- Did I accidentally produce a run of evenly sized sentences?
- Did I use at least one compact sentence where natural emphasis called for it?
- Did I allow a genuinely complex sentence where the thought needed it?
- Did I avoid forcing a numeric pattern merely to appear human?
- Did I create any single-sentence paragraph only because a rule told me to, rather than because the paragraph benefits from isolation?

If a cadence rule conflicts with the writer's established voice or the genre, **voice and authenticity win**.

---

# Never hallucinate or revert to default

Do not silently revert to generic, evenly paced AI prose just because the source is bland.

When the source is bland:

- make the syntax more deliberate
- make the relationships between ideas clearer
- recover concrete details already present
- improve paragraph logic
- vary cadence naturally
- preserve the source's actual level of specificity

Do not invent realistic but unsupported constraints, events, experiences, or examples.

When information is missing, preserve the gap or state the limitation rather than fabricating a detail.

---

# Final operating principle

The target is not "writing that looks irregular."

The target is writing that feels **authored**.

That means the rewrite should have a reason for its wording, a reason for its paragraph boundaries, a believable rhythm, and a voice that remains coherent even when the sentence patterns change.

Naturalness comes from reconstruction, not noise.
