/**
 * TECHNOLOGY DATA — "MY AI LAB"
 *
 * ── Content integrity ────────────────────────────────────────────────
 *
 * This models HOW Rahil thinks about working with AI. It is explicitly
 * NOT a description of a production system he operates.
 *
 * Verified facts this is built from, and nothing beyond them:
 *   · runs open models locally through OpenWebUI
 *   · works on prompt engineering
 *   · works on context engineering
 *
 * The stage notes below describe what each concept *is* — general,
 * checkable statements about the practice. They are not claims about
 * infrastructure, scale or results.
 *
 * NEVER add: model names, parameter counts, latency, tokens/sec, GPU
 * specifications, benchmark scores, accuracy figures, user numbers, or
 * anything that reads as a measurement. There is no data to support any
 * of it.
 */

export const TECH_STAGES = [
  {
    id: "context",
    order: "01",
    label: "CONTEXT",
    title: "Context Engineering",
    summary:
      "Deciding what the model can see, and when. The window is finite, so what goes into it is a design decision rather than an afterthought.",
    notes: [
      "Supplied background",
      "Conversation state",
      "Retrieved material",
      "Worked examples",
    ],
    icon: "layers",
  },
  {
    id: "prompt",
    order: "02",
    label: "PROMPT",
    title: "Prompt Engineering",
    summary:
      "Shaping the instruction deliberately instead of accepting whatever the first phrasing happens to produce.",
    notes: ["Instructions", "Constraints", "Specificity", "Output format"],
    icon: "braces",
  },
  {
    id: "model",
    order: "03",
    label: "MODEL",
    title: "Local LLM Deployment",
    summary:
      "Running open models locally through OpenWebUI — the substrate the rest of this sits on, and the reason the whole loop can be inspected.",
    notes: ["Open weights", "Runs locally", "OpenWebUI", "Full inspection"],
    icon: "cpu",
  },
  {
    id: "output",
    order: "04",
    label: "OUTPUT",
    title: "Reading the Result",
    summary:
      "The response is evidence, not an answer. Reading it carefully is what tells you whether the context and the prompt were right.",
    notes: ["Generated response", "Interpretation", "What was missed"],
    icon: "output",
  },
  {
    id: "iterate",
    order: "05",
    label: "ITERATE",
    title: "Back to the Context",
    summary:
      "Most of the work happens here. A weak result is usually a context problem or a prompt problem, so the loop closes and starts again.",
    notes: ["Adjust context", "Re-shape prompt", "Compare", "Repeat"],
    icon: "loop",
  },
];

/** The signal travels this path, then returns to the start. */
export const TECH_FLOW = TECH_STAGES.map((s) => s.id);
