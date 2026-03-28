# Strategy Command

Create, store, and track versioned strategy documents with AI assistance. Grounded in project context, each strategy document captures open questions, analysis, recommendations, and decisions in an isolated git branch — never touching main.

## Execution Steps

### Phase 1: Parse Input and Generate Name Candidates

1. **Detect Flag or Description**
   - Check whether the command was invoked with a recognized flag:
     - `--5-whys` → jump to Phase 1b: 5 Whys Entry
     - `--porters-5-forces` → jump to Phase 1c: Porter's 5 Forces Entry
     - `--realign` → jump to Phase R1 (Realign Workflow — entirely replaces Phases 1–7)
   - If a text description was provided (no flag): set `template_mode = "standard"`, skip to Step 2 (Generate Name Candidates)
   - If neither flag nor description: set `template_mode = "standard"`, proceed to Step 1a (No-Args Menu)

1a. **No-Args: Two-Question Menu**
   - Use AskUserQuestion:
     ```
     Question: "What type of strategy do you want to create?"
     Options:
       1. "General strategy (pricing, GTM, architecture, etc.)"
       2. "Framework-based analysis (5 Whys, Porter's Forces, etc.)"
       3. "(Other — type your own topic directly)"
     ```
   - If user selects "General strategy":
     - Use AskUserQuestion:
       ```
       Question: "What is this strategy about?"
       Options:
         1. "Pricing / Monetization"
         2. "Go-to-Market / Launch"
         3. "Technical Architecture"
         4. "(Other — type your own)"
       ```
     - Use the selected option as the description. Proceed to Step 2.
   - If user selects "Framework-based analysis":
     - Use AskUserQuestion:
       ```
       Question: "Which framework do you want to use?"
       Options:
         1. "5 Whys Root Cause Analysis"
         2. "Porter's 5 Forces Competitive Analysis"
         3. "(Other — type your own)"
       ```
     - If "5 Whys Root Cause Analysis": jump to Phase 1b
     - If "Porter's 5 Forces Competitive Analysis": jump to Phase 1c
     - If "Other": use typed response as description, set `template_mode = "standard"`, proceed to Step 2
   - If user types a custom topic (option 3 of first question): use as description, proceed to Step 2

1. **Extract Strategy Description** *(when description provided directly — no flag)*
   - Parse the command arguments to get the strategy description
   - Description should state WHAT strategic question or area is being explored
   - Examples:
     - "Pricing strategy for v1.4.0 launch"
     - "Go-to-market plan for open-source release"
     - "Migration strategy from REST to GraphQL"

2. **Generate 3 File Name Candidates**
   - Based on the description, derive 3 distinct kebab-case name candidates
   - Rules for name generation:
     - Lowercase only
     - Words separated by hyphens
     - Maximum 40 characters
     - No version numbers (version is appended separately)
     - Descriptive but concise
   - Example — description: "Pricing strategy for v1.4.0 launch":
     1. `pricing-strategy-v14-launch`
     2. `v14-pricing-model`
     3. `monetization-approach`
   - Example — description: "Go-to-market plan for open-source release":
     1. `oss-go-to-market-plan`
     2. `open-source-launch-strategy`
     3. `gtm-oss-release`

3. **Ask User to Choose or Provide Custom Name**
   - Use AskUserQuestion with options:
     ```
     Question: "Choose a name for your strategy document:"
     Options:
       1. {candidate-1}
       2. {candidate-2}
       3. {candidate-3}
       4. (Other — type a custom name)
     ```
   - If user selects "Other", treat their typed response as the raw name and convert to kebab-case:
     - Lowercase
     - Replace spaces/underscores with hyphens
     - Remove special characters (keep alphanumeric and hyphens)

4. **Determine Next File Number**
   - Use Glob to list all files in `strategy/` matching `*.md` (excluding `README.md`)
   - Count existing strategy documents
   - Next NNN = count + 1, zero-padded to 3 digits
   - Examples:
     - 0 existing files → `001`
     - 3 existing files → `004`
     - 12 existing files → `013`
   - Final filename: `{NNN}-{chosen-name}-v1.0.0.md`
   - Example: `001-pricing-strategy-v14-launch-v1.0.0.md`

### Phase 1b: 5 Whys Entry (`--5-whys` flag or framework menu selection)

> Only entered when `--5-whys` flag is detected or user selects "5 Whys" from the framework menu. After this phase, continue to Phase 2 as normal.
>
> This framework uses a **bilateral Identity-to-Events model** — each level is analyzed from two perspectives simultaneously: the **Product/Company side** (left) and the **User/Customer side** (right). Root causes are traced by descending from surface Events up through Patterns, Systems, Beliefs, and Identity on both sides.

1. **Ask for Problem Statement**
   - Use AskUserQuestion (free text input — no preset options):
     ```
     Question: "What problem or outcome are you analyzing with 5 Whys?"
     (e.g., "Customers churn after onboarding", "Adoption is low despite strong launch")
     ```
   - Store as `five_whys_topic`

2. **Ask Which Side to Anchor the Analysis**
   - Use AskUserQuestion:
     ```
     Question: "Where does this problem primarily live?"
     Options:
       1. "Both sides equally — analyze Product and User in parallel"
       2. "Primarily a Product/Company problem (we're doing something wrong)"
       3. "Primarily a User/Customer problem (they're behaving unexpectedly)"
       4. "I'm not sure — let the analysis reveal it"
     ```
   - Store as `five_whys_anchor`
   - All options still produce the bilateral template; this just sets the framing tone in the document's opening

3. **Generate 3 File Name Candidates**
   - Pattern: `five-whys-{topic}` (kebab-cased, lowercase, max 40 chars total)
   - The topic portion must be at most 30 characters (prefix `five-whys-` is 10 chars)
   - Example — topic: "Customers churn after onboarding":
     1. `five-whys-customer-churn-onboarding`
     2. `five-whys-onboarding-churn-root`
     3. `five-whys-retention-failure`
   - Use AskUserQuestion:
     ```
     Question: "Choose a name for your 5 Whys document:"
     Options:
       1. {candidate-1}
       2. {candidate-2}
       3. {candidate-3}
       4. (Other — type a custom name)
     ```

4. **Determine Next File Number** (same as Phase 1, Step 4)

5. **Set Template Mode**
   - Set `template_mode = "5-whys"`
   - Set `five_whys_anchor` from Step 2 answer
   - Goal suggestions in Phase 3 should be root-cause-focused:
     - "Identify the root cause of {five_whys_topic} at each level (Identity → Events)"
     - "Align product identity and user identity so the problem cannot recur structurally"
     - "Design corrective actions at the highest causal level — not just at the symptom"

6. **Continue to Phase 2** — context reading, goals, metrics, experiments flow runs as normal

---

### Phase 1c: Porter's 5 Forces Entry (`--porters-5-forces` flag or framework menu selection)

> Only entered when `--porters-5-forces` flag is detected or user selects "Porter's 5 Forces" from the framework menu. After this phase, continue to Phase 2 as normal.

1. **Ask for Market/Product Context**
   - Use AskUserQuestion (free text input — no preset options):
     ```
     Question: "What market or product are you analyzing with Porter's 5 Forces?"
     (e.g., "AI-assisted developer tooling", "B2B SaaS documentation platforms")
     ```
   - Store as `porters_topic`

2. **Generate 3 File Name Candidates**
   - Pattern: `porters-five-forces-{topic}` (kebab-cased, lowercase, max 40 chars total)
   - The topic portion must be at most 20 characters (prefix `porters-five-forces-` is 20 chars)
   - Example — topic: "AI-assisted developer tooling":
     1. `porters-five-forces-ai-dev-tooling`
     2. `competitive-forces-ai-dev-tools`
     3. `porters-analysis-dev-tooling`
   - Use AskUserQuestion:
     ```
     Question: "Choose a name for your Porter's 5 Forces document:"
     Options:
       1. {candidate-1}
       2. {candidate-2}
       3. {candidate-3}
       4. (Other — type a custom name)
     ```

3. **Determine Next File Number** (same as Phase 1, Step 4)

4. **Set Template Mode**
   - Set `template_mode = "porters-5-forces"`
   - Goal suggestions in Phase 3 should be competitive-analysis-focused:
     - "Identify our competitive position in {porters_topic}"
     - "Find defensible moats before competitors copy our approach"
     - "Quantify the most threatening competitive force and develop a mitigation strategy"

5. **Continue to Phase 2** — context reading, goals, metrics, experiments flow runs as normal

---

### Phase 2: Read Project Context

1. **Discover Latest Document Versions**
   - Use Glob to find latest versions of each context document:
     - `docs/002-prd-v*.md` → get file with highest version number
     - `docs/100-userflows-v*.md` → get file with highest version number
     - `docs/125-design-system-v*.md` → get file with highest version number
     - `docs/175-c4-diagrams-v*.md` → get file with highest version number
   - To find the latest, list all matching files and sort by version:
     - Parse the version segment (`v1.0.0`, `v1.2.0`, etc.) from the filename
     - Select the file with the highest semantic version

2. **Read Context Documents**
   - Read the latest PRD — extract:
     - Project vision and goals
     - Current features and roadmap
     - Target personas
     - Success metrics
   - Read the latest User Flows — extract:
     - User personas (names, roles, pain points)
     - Primary user journeys
   - Read the latest Design System — extract:
     - Technology choices relevant to the strategy
     - Design principles
   - Read the latest C4 Diagrams — extract:
     - System context (external actors, integrations)
     - Container-level architecture (services, databases, frontends)
     - Key component boundaries relevant to the strategy
   - Synthesize a "Project Context Summary" (internal, used to fill the strategy document's Context/Background section)

3. **Scan for Previously Ran Experiments**
   - Use Glob to list all `strategy/*.md` (excluding `README.md`)
   - For each file found, Read it and look for a `## Previously Ran Experiments` section
   - Collect all rows from those tables where the Result column is not empty (i.e., experiment has been run)
   - Store as `prior_experiments[]` — each entry: `{ name, hypothesis, result, key_finding, start_date, end_date, progress, source_file }`
   - These will be pre-populated into the new document's **Previously Ran Experiments** section
   - If no prior experiments are found, set `prior_experiments = []` and the section will contain a blank template row

4. **Check for Existing Strategy on Same Topic**
   - Use Glob to list `strategy/*.md`
   - Scan filenames and titles for overlap with the chosen strategy name
   - If similar strategy found:
     - Display: "A related strategy already exists: {filename}"
     - Use AskUserQuestion:
       ```
       Question: "A related strategy exists. What do you want to do?"
       Options:
         1. "Create new strategy (separate document)"
         2. "Cancel — I'll update the existing one"
       ```
     - If user chooses "Cancel", stop and show the path to the existing file

### Phase 3: Elicit Goals, Metrics, and Experiment Ideas

1. **Suggest Goals / Objectives**
   - Based on the strategy description and the project context synthesized in Phase 2, generate 3-5 suggested goals that are specific and outcome-oriented
   - Goals should be phrased as "We want to [achieve X] so that [outcome Y]"
   - Examples for a Porter's 5 Forces strategy:
     - "Establish a defensible moat in the 3D methodology space before a competitor copies the approach"
     - "Reduce Anthropic supplier dependency by making skills model-agnostic"
     - "Reach 500 GitHub stars to validate community demand before SaaS launch"
   - Use AskUserQuestion with multiSelect: true so the user can pick multiple:
     ```
     Question: "Which goals should this strategy pursue? (Select all that apply)"
     multiSelect: true
     Options:
       1. {Suggested goal 1}
       2. {Suggested goal 2}
       3. {Suggested goal 3}
       4. {Suggested goal 4 — if applicable}
       5. (Other — type your own)
     ```
   - Collect all selected goals; if "Other" is chosen, prompt for the custom goal text
   - Store the final list as `selected_goals[]`

2. **Suggest Metrics to Measure**
   - Based on the selected goals and strategy type, generate 3-5 suggested metrics
   - Metrics should be measurable and time-bound where possible
   - Examples for a competitive strategy:
     - "GitHub stars: reach 500 within 6 months"
     - "Direct competitor count in the 3D niche: track monthly"
     - "Time to create a new strategy doc: < 5 minutes"
     - "Conversion rate from free template → paid SaaS: > 5%"
   - Use AskUserQuestion with multiSelect: true:
     ```
     Question: "Which metrics should we use to measure success? (Select all that apply, or None)"
     multiSelect: true
     Options:
       1. {Suggested metric 1}
       2. {Suggested metric 2}
       3. {Suggested metric 3}
       4. {Suggested metric 4 — if applicable}
       5. "None — I'll define metrics later"
       6. (Other — type your own)
     ```
   - If user selects "None", set `selected_metrics = []` and note "[Metrics to be defined]" in the document
   - If "Other" is chosen, prompt for custom metric text
   - Store the final list as `selected_metrics[]`

3. **Suggest Experiments to Run**
   - Based on the goals, metrics, and strategy context, generate 3-5 actionable experiment ideas
   - Each experiment should be small, testable, and designed to validate or disprove an assumption
   - For each experiment, generate:
     - **Hypothesis** — the assumption being tested
     - **Action** — the concrete thing to do
     - **Signal** — how to know if it worked
     - **Recommended Duration** — based on the experiment type:
       - Content/SEO experiments: 2–4 weeks (enough time for indexing and organic traffic)
       - Outreach/DM campaigns: 1–2 weeks (rapid feedback loop)
       - Pricing/conversion tests: 2–4 weeks (sufficient conversion sample)
       - Feature adoption tests: 4–6 weeks (behavioral change takes time)
       - Community/social campaigns: 1–2 weeks (viral signals surface quickly)
       - Infrastructure/performance experiments: 1 week (measurable immediately)
     - **Incremental Execution Stages** — break each experiment into 3 stages to minimize risk:
       - Stage 1 (first 20–30% of duration): Narrow pilot — smallest viable scope to test the hypothesis
       - Stage 2 (next 40–50% of duration): Expand if Stage 1 signals positive; adjust if inconclusive
       - Stage 3 (final 20–30% of duration): Full run or pivot based on Stage 2 results
       - **Go/No-Go criteria** between each stage: define the signal threshold to proceed vs. pause
   - Examples for a competitive positioning strategy:
     - "Publish 3D Methodology Blog Post — Hypothesis: developers search for 'document-driven development AI'. Action: Publish on dev.to/Medium. Signal: 500+ views + 20 GitHub referrals. Duration: 3 weeks. Stage 1 (Week 1): Publish draft, share in 1 community. Stage 2 (Week 2): Share in 3 more channels if >100 views. Stage 3 (Week 3): Measure GitHub referral rate. Go/No-Go: proceed to Stage 2 if >100 views in Week 1."
     - "Cold outreach to 10 solo devs — Hypothesis: solo devs will pay $29/mo. Action: DM 10 target users with free trial offer. Signal: 3+ positive responses. Duration: 1 week. Stage 1 (Day 1–3): DM 3 users. Stage 2 (Day 4–6): DM 4 more if 1+ responds. Stage 3 (Day 7): Close remaining if momentum exists. Go/No-Go: proceed to Stage 2 if 1+ reply."
   - Use AskUserQuestion with multiSelect: true:
     ```
     Question: "Which experiments should we plan to run? (Select all that apply)"
     multiSelect: true
     Options:
       1. {Experiment 1 name — brief description (Recommended duration: X weeks)}
       2. {Experiment 2 name — brief description (Recommended duration: X weeks)}
       3. {Experiment 3 name — brief description (Recommended duration: X weeks)}
       4. {Experiment 4 name — brief description (Recommended duration: X weeks)}
       5. (Other — type your own)
     ```
   - If "Other" is chosen, prompt for custom experiment description and infer a recommended duration based on the type
   - For each selected experiment, generate a start date of today and an end date based on the recommended duration
   - Store final list as `selected_experiments[]` — each entry: `{ name, hypothesis, action, signal, recommended_duration, start_date, end_date, stages[], go_no_go_criteria }`
   - Note: Each selected experiment will become a candidate for the future `/experiment` skill to execute

### Phase 4: Create Git Branch

1. **Confirm Branch Creation with User**
   - Determine default branch first:
     - Run: `git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo "origin/main"`
     - Extract branch name (e.g., `origin/main` → `main`)
     - Fallback to `main` if detection fails
   - Use AskUserQuestion to confirm before creating the branch:
     ```
     Question: "Ready to create branch 'strategy/{chosen-name}' from '{default-branch}'. Proceed?"
     Options:
       1. "Yes — create the branch now"
       2. "No — save files on the current branch instead"
       3. "Cancel — don't create any files yet"
     ```
   - If "Yes": continue with branch creation steps below
   - If "No": skip all remaining branch steps; write strategy files to current branch and warn in summary: "⚠️ Files written to current branch — no strategy branch was created."
   - If "Cancel": stop execution entirely

2. **Check for Uncommitted Changes**
   - Run: `git status --porcelain`
   - If uncommitted changes exist:
     - Display: "You have uncommitted changes on your current branch."
     - Use AskUserQuestion:
       ```
       Question: "How do you want to handle uncommitted changes?"
       Options:
         1. "Stash them and continue (git stash)"
         2. "Cancel — I'll commit or discard them first"
       ```
     - If "Stash": run `git stash push -m "Auto-stash before /strategy"`
     - If "Cancel": stop execution

3. **Create and Switch to Strategy Branch**
   - Branch name: `strategy/{chosen-name}`
   - Example: `strategy/pricing-strategy-v14-launch`
   - Run: `git checkout -b strategy/{chosen-name}`
   - If branch already exists:
     - Display: "Branch 'strategy/{chosen-name}' already exists."
     - Use AskUserQuestion:
       ```
       Question: "The branch already exists. What do you want to do?"
       Options:
         1. "Switch to existing branch and continue"
         2. "Create with suffix -2 (strategy/{name}-2)"
         3. "Cancel"
       ```
     - Handle accordingly

4. **Confirm Branch**
   - Run: `git branch --show-current`
   - Verify output matches `strategy/{chosen-name}`
   - Display: "Switched to branch: strategy/{chosen-name}"

### Phase 4: Create Strategy Document

1. **Create `/strategy/` Folder if Needed**
   - Use Glob to check if `strategy/` directory exists
   - If it doesn't exist, it will be created implicitly when writing the first file

2. **Generate Strategy Document Content**
   - **Select Template Based on `template_mode`:**
     - `"standard"` (default) — use the Standard Template below
     - `"5-whys"` — use the 5 Whys Bilateral Template (see below)
     - `"porters-5-forces"` — use the Porter's 5 Forces Template (see below)
   - Populate the document template with:
     - Title derived from the chosen name (title-cased, hyphens replaced with spaces)
     - Version: `v1.0.0`
     - Date created: today's date (YYYY-MM-DD format)
     - Context/Background: synthesized from project docs (Phase 2)
     - Open questions: 3-5 starter questions inferred from the description
     - Assumptions: 2-3 starter assumptions inferred from the strategy description and context
     - Previously Ran Experiments: pre-populated from `prior_experiments[]` collected in Phase 2 (empty template row if none found); table includes Start Date, End Date, Progress, Result, Key Finding
     - Planned Experiments: populated from `selected_experiments[]` (Phase 3); each row includes Start Date, End Date, Recommended Duration, Progress; followed by an Incremental Execution Strategy block with Stage 1/2/3 breakdowns and Go/No-Go criteria per stage
     - Confounding Factors: 2-3 starter factors inferred from the strategy type and context
     - Justifications: placeholder rows tied to the selected goals from Phase 3
     - All other sections as structured placeholders
   - Full template:

   ```markdown
   # {Title}

   **Version:** v1.0.0
   **Date Created:** {YYYY-MM-DD}
   **Last Updated:** {YYYY-MM-DD}
   **Branch:** strategy/{chosen-name}
   **Status:** Draft

   ## Version History

   | Version | Date | Changes |
   |---------|------|---------|
   | v1.0.0 | {YYYY-MM-DD} | Initial strategy document |

   ---

   ## Open Questions

   > This section captures the strategic questions this document aims to answer.

   1. {Inferred question 1 from description}
   2. {Inferred question 2 from description}
   3. {Inferred question 3 from description}
   4. [Add more questions here]

   ---

   ## Context / Background

   > What is the current state of the project that makes this strategy necessary?

   {Auto-filled from project docs — PRD vision, current features, relevant personas}

   ### Relevant Project Docs
   - PRD: {latest PRD filename}
   - User Flows: {latest userflows filename}
   - Design System: {latest design system filename}
   - C4 Diagrams: {latest c4-diagrams filename}

   ---

   ## Assumptions

   > Documented assumptions this strategy relies on. Each should be validated or invalidated over time — link to experiments where possible.

   | # | Assumption | Confidence | How to Validate |
   |---|-----------|------------|-----------------|
   | 1 | [Assumption text] | High / Medium / Low | [Validation method] |
   | 2 | [Assumption text] | High / Medium / Low | [Validation method] |

   ---

   ## Previously Ran Experiments

   > Completed experiments that directly inform this strategy. Reference results here to avoid repeating work and to ground recommendations in evidence.

   | Experiment | Hypothesis | Start Date | End Date | Progress | Result | Key Finding |
   |-----------|-----------|------------|----------|----------|--------|-------------|
   | [Experiment name] | [What was tested] | [YYYY-MM-DD] | [YYYY-MM-DD] | Completed / Stopped / In Progress | ✅ Validated / ❌ Invalidated / ⚠️ Inconclusive | [What was learned] |

   *No prior experiments on record. Add rows as experiments are completed.*

   ---

   ## Planned Experiments

   > Experiments selected for this strategy. Each is broken into incremental stages to reduce risk and accelerate learning.

   | Experiment | Hypothesis | Start Date | End Date | Duration | Progress |
   |-----------|-----------|------------|----------|----------|----------|
   | [Experiment name] | [What is being tested] | [YYYY-MM-DD] | [YYYY-MM-DD] | [X weeks] | Not Started |

   ### Incremental Execution Strategy

   > Each experiment is staged so early signals inform whether to expand, pivot, or stop — before committing full effort.

   #### [Experiment Name]
   - **Signal to confirm:** [What outcome are we looking for?]
   - **Recommended duration:** [X weeks — rationale]
   - **Stage 1 (Days 1–N):** [Narrow pilot — smallest viable scope]
     - Go/No-Go: [Signal threshold to proceed to Stage 2]
   - **Stage 2 (Days N–M):** [Expand scope if Stage 1 positive; adjust if inconclusive]
     - Go/No-Go: [Signal threshold to proceed to Stage 3]
   - **Stage 3 (Days M–End):** [Full run or pivot based on Stage 2 results]
     - Outcome: [What a successful Stage 3 looks like]

   ---

   ## Analysis

   > Deep-dive examination of the problem space, options, and trade-offs.

   ### Current State
   [Describe what exists today]

   ### Options Considered

   #### Option A: {Name}
   - **Description:** [What this option involves]
   - **Pros:** [Benefits]
   - **Cons:** [Trade-offs]
   - **Effort:** [Estimate]

   #### Option B: {Name}
   - **Description:** [What this option involves]
   - **Pros:** [Benefits]
   - **Cons:** [Trade-offs]
   - **Effort:** [Estimate]

   ### Constraints and Assumptions
   - [Constraint or assumption 1]
   - [Constraint or assumption 2]

   ### Confounding Factors

   > External variables or conditions that could skew outcomes or make it difficult to attribute results solely to this strategy.

   - [Confounding factor 1 — e.g., "Seasonal usage patterns may inflate metrics during launch month"]
   - [Confounding factor 2 — e.g., "Competitor product launch could affect adoption independently of this strategy"]

   ---

   ## Recommendations

   > What we should do and why.

   ### Recommended Approach
   [Describe the recommended option and rationale]

   ### Justifications

   > Evidence, data points, and reasoning that support the recommended approach.

   - **[Justification 1]:** [Supporting evidence or rationale]
   - **[Justification 2]:** [Supporting evidence or rationale]

   ### Implementation Steps
   1. [Step 1]
   2. [Step 2]
   3. [Step 3]

   ### Success Metrics
   - [How we'll know this strategy is working]

   ---

   ## Decision Log

   > Record of decisions made and their rationale.

   | Date | Decision | Rationale | Decided By |
   |------|----------|-----------|------------|
   | {YYYY-MM-DD} | Initial strategy direction chosen | [Reason] | [Name/Role] |

   ---

   ## Next Steps

   - [ ] Review and refine Open Questions
   - [ ] Complete Analysis section
   - [ ] Finalize Recommendations
   - [ ] Create PR with `/create-pr` for team review
   ```

   ---

   #### 5 Whys Bilateral Template (`template_mode = "5-whys"`)

   > The **5 Whys Bilateral Framework** traces root causes by examining five levels simultaneously from two perspectives: the **Product/Company side** (what we built, decided, and believe) and the **User/Customer side** (who they are, what they believe, and what they do). True root causes often live at the Identity or Beliefs level — not at the Event level where symptoms appear.

   ```markdown
   # {Title}

   **Version:** v1.0.0
   **Date Created:** {YYYY-MM-DD}
   **Last Updated:** {YYYY-MM-DD}
   **Branch:** strategy/{chosen-name}
   **Status:** Draft
   **Framework:** 5 Whys Bilateral Analysis

   ## Version History

   | Version | Date | Changes |
   |---------|------|---------|
   | v1.0.0 | {YYYY-MM-DD} | Initial 5 Whys bilateral analysis |

   ---

   ## Problem Statement

   > State the observable, measurable outcome or problem. This is the **Event** — the surface symptom we are tracing upward through both sides.

   **Observed outcome:** {five_whys_topic}
   **Anchor:** {five_whys_anchor — e.g., "Both sides equally" or "Primarily a Product/Company problem"}

   ---

   ## The Bilateral Framework

   > Each level is analyzed from two perspectives simultaneously. The left column represents **Product/Company identity** — what we built, believe, and do. The right column represents **User/Customer identity** — who they are, what they believe, and what they do. Root causes emerge when the two sides are misaligned at a given level.

   ```
   Product / Company Side         ←──►    User / Customer Side
   ─────────────────────────────────────────────────────────────
   Identity  (Mission / Vision)   ←──►    Identity  (Who they are / self-concept)
   Beliefs   (Values / Culture)   ←──►    Beliefs   (What they believe is possible)
   Systems   (Platform / Product) ←──►    Systems   (Tools / workflows they use)
   Patterns  (Behaviors / Habits) ←──►    Patterns  (Repeated actions / rituals)
   Events / Outcomes              ←──►    Events / Outcomes (What actually happens)
   ```

   ---

   ## Level 5: Identity

   > **The deepest level.** Who are we, and who is the user? Misalignment here means we are building for someone we are not — or they are using us as something we didn't intend to be.

   | | Product / Company Side | User / Customer Side |
   |-|------------------------|----------------------|
   | **Current State** | [Our mission/vision — what we say we are for] | [User self-concept — what they see themselves as] |
   | **Assumption** | [What we assumed about our identity when we designed this] | [What identity the user brings to the product] |
   | **Gap / Misalignment** | [Where our identity diverges from what the user needs us to be] | [Where the user's self-concept conflicts with our design assumptions] |
   | **Why it matters** | [How this identity gap contributes to the observed problem] | [How this identity gap contributes to the observed problem] |

   **Identity-Level Root Cause Hypothesis:**
   > [One sentence: What identity-level misalignment is causing or enabling this problem?]

   ---

   ## Level 4: Beliefs

   > **Values, culture, and what each side believes is possible.** Misalignment here means we believe in a workflow or behavior that the user doesn't share — or we've built assuming beliefs the user doesn't hold.

   | | Product / Company Side | User / Customer Side |
   |-|------------------------|----------------------|
   | **Current State** | [Our values and cultural assumptions baked into the product] | [What the user believes is possible, normal, or worth doing] |
   | **Assumption** | [What we believed about user motivation when we designed this] | [What belief the user holds that drives their behavior] |
   | **Gap / Misalignment** | [Where our beliefs diverge from what the user needs us to believe] | [Where user beliefs conflict with our design intent] |
   | **Why it matters** | [How this belief gap contributes to the observed problem] | [How this belief gap contributes to the observed problem] |

   **Beliefs-Level Root Cause Hypothesis:**
   > [One sentence: What belief-level misalignment is sustaining this problem?]

   ---

   ## Level 3: Systems

   > **The platform, product, and tools on both sides.** Misalignment here means our system doesn't integrate with or support the user's actual toolchain or workflow.

   | | Product / Company Side | User / Customer Side |
   |-|------------------------|----------------------|
   | **Current State** | [Our platform/product — what it does and how it's structured] | [Tools and workflows the user actually uses day-to-day] |
   | **Assumption** | [What system behavior we designed for] | [What system support the user expected from us] |
   | **Gap / Misalignment** | [Where our system fails to meet user workflow needs] | [Where the user's toolchain creates friction with our product] |
   | **Why it matters** | [How this system gap enables the observed problem] | [How this system gap enables the observed problem] |

   **Systems-Level Root Cause Hypothesis:**
   > [One sentence: What system-level incompatibility is creating friction?]

   ---

   ## Level 2: Patterns

   > **Repeated behaviors, habits, and rituals on both sides.** Misalignment here means our usage patterns conflict with the user's habitual behavior — we designed for a workflow they don't naturally follow.

   | | Product / Company Side | User / Customer Side |
   |-|------------------------|----------------------|
   | **Current State** | [How our team operates — release cadence, communication, support patterns] | [User's habitual actions — how often they use us, in what context, in what sequence] |
   | **Assumption** | [What usage pattern we assumed when designing the experience] | [What behavioral pattern the user brings from prior habits] |
   | **Gap / Misalignment** | [Where our operational patterns diverge from what users need] | [Where user habits create unexpected usage patterns in our product] |
   | **Why it matters** | [How this pattern gap drives the observed problem] | [How this pattern gap drives the observed problem] |

   **Patterns-Level Root Cause Hypothesis:**
   > [One sentence: What behavioral misalignment is producing this outcome repeatedly?]

   ---

   ## Level 1: Events / Outcomes

   > **The surface layer — what actually happens.** This is where the problem was first observed, but it is rarely where the root cause lives.

   | | Product / Company Side | User / Customer Side |
   |-|------------------------|----------------------|
   | **What happened** | [What our product/team did or produced] | [What the user did or experienced] |
   | **Observable signal** | [Metric, log, ticket, or feedback that surfaced the problem] | [User action, drop-off, churn signal, or complaint that made this visible] |
   | **Immediate trigger** | [The most proximate cause on our side] | [The most proximate cause on the user's side] |

   **Events-Level Observation:**
   > [One sentence: What is the observable symptom at the surface level?]

   ---

   ## Root Cause Synthesis

   > After filling in all five levels, synthesize the deepest misalignment. The true root cause is the **highest level** where a gap exists — because higher-level misalignments cause all the lower-level symptoms.

   | Level | Product Side Gap | User Side Gap | Alignment Status |
   |-------|-----------------|---------------|-----------------|
   | 5 — Identity | [Gap or "Aligned"] | [Gap or "Aligned"] | ✅ Aligned / ⚠️ Misaligned |
   | 4 — Beliefs | [Gap or "Aligned"] | [Gap or "Aligned"] | ✅ Aligned / ⚠️ Misaligned |
   | 3 — Systems | [Gap or "Aligned"] | [Gap or "Aligned"] | ✅ Aligned / ⚠️ Misaligned |
   | 2 — Patterns | [Gap or "Aligned"] | [Gap or "Aligned"] | ✅ Aligned / ⚠️ Misaligned |
   | 1 — Events | [Observable symptom] | [Observable symptom] | ⚠️ Symptom only |

   **True Root Cause (highest misaligned level):**
   > [State which level the root cause lives at and what the misalignment is in one clear sentence.]

   **Root Cause Category:**
   - [ ] Identity misalignment (we built for the wrong self-concept)
   - [ ] Beliefs misalignment (different assumptions about what is possible/normal)
   - [ ] Systems incompatibility (toolchain/product structural friction)
   - [ ] Patterns conflict (habitual behavior clashes with designed workflow)
   - [ ] Event-level only (surface fix sufficient — no deeper misalignment found)

   ---

   ## Corrective Actions

   > Actions should address the **root cause level**, not just the symptom. An action at Level 5 (Identity) will resolve all downstream levels. An action at Level 1 (Events) is a patch.

   | # | Level | Action | Owner | Due Date | Status |
   |---|-------|--------|-------|----------|--------|
   | 1 | [Level 5/4/3/2/1] | [Corrective action — what to change, build, or stop] | [Owner] | [YYYY-MM-DD] | Not Started |
   | 2 | [Level] | [Action] | [Owner] | [YYYY-MM-DD] | Not Started |
   | 3 | [Level] | [Action] | [Owner] | [YYYY-MM-DD] | Not Started |

   ---

   ## Context / Background

   > What is the current state of the project that makes this analysis necessary?

   {Auto-filled from project docs — PRD vision, current features, relevant personas}

   ### Relevant Project Docs
   - PRD: {latest PRD filename}
   - User Flows: {latest userflows filename}

   ---

   ## Assumptions

   | # | Assumption | Confidence | How to Validate |
   |---|-----------|------------|-----------------|
   | 1 | [Assumption] | High / Medium / Low | [Validation method] |
   | 2 | [Assumption] | High / Medium / Low | [Validation method] |

   ---

   ## Planned Experiments

   > Experiments to validate whether corrective actions resolved the root cause at the identified level.

   | Experiment | Hypothesis | Start Date | End Date | Duration | Progress |
   |-----------|-----------|------------|----------|----------|----------|
   | [Experiment name] | [What is being tested at which level] | [YYYY-MM-DD] | [YYYY-MM-DD] | [X weeks] | Not Started |

   ### Incremental Execution Strategy

   #### [Experiment Name]
   - **Level targeted:** [Identity / Beliefs / Systems / Patterns / Events]
   - **Signal to confirm:** [What outcome shows the misalignment is resolved?]
   - **Recommended duration:** [X weeks — rationale]
   - **Stage 1 (Days 1–N):** [Narrow pilot]
     - Go/No-Go: [Signal threshold]
   - **Stage 2 (Days N–M):** [Expand if Stage 1 positive]
     - Go/No-Go: [Signal threshold]
   - **Stage 3 (Days M–End):** [Full run or pivot]
     - Outcome: [What success looks like]

   ---

   ## Previously Ran Experiments

   | Experiment | Hypothesis | Start Date | End Date | Progress | Result | Key Finding |
   |-----------|-----------|------------|----------|----------|--------|-------------|
   | [Experiment name] | [What was tested] | [YYYY-MM-DD] | [YYYY-MM-DD] | Completed / Stopped | ✅ Validated / ❌ Invalidated / ⚠️ Inconclusive | [What was learned] |

   ---

   ## Decision Log

   | Date | Decision | Rationale | Decided By |
   |------|----------|-----------|------------|
   | {YYYY-MM-DD} | 5 Whys bilateral analysis initiated | [Reason] | [Name/Role] |

   ---

   ## Next Steps

   - [ ] Fill in all five levels of the bilateral framework
   - [ ] Complete the Root Cause Synthesis table
   - [ ] Assign owners to Corrective Actions (prioritize highest-level actions first)
   - [ ] Design validation experiments for the root cause level
   - [ ] Create PR with `/create-pr` for team review
   ```

   ---

   #### Porter's 5 Forces Template (`template_mode = "porters-5-forces"`)

   ```markdown
   # {Title}

   **Version:** v1.0.0
   **Date Created:** {YYYY-MM-DD}
   **Last Updated:** {YYYY-MM-DD}
   **Branch:** strategy/{chosen-name}
   **Status:** Draft
   **Framework:** Porter's 5 Forces Competitive Analysis

   ## Version History

   | Version | Date | Changes |
   |---------|------|---------|
   | v1.0.0 | {YYYY-MM-DD} | Initial competitive forces analysis |

   ---

   ## Industry Overview

   > Describe the market or product space being analyzed. What industry segment, customer segment, and value chain position does this product occupy?

   {Auto-inferred from `porters_topic` + project docs context}

   **Market Segment:** [e.g., B2B SaaS, developer tooling, AI-assisted workflows]
   **Analysis Date:** {YYYY-MM-DD}
   **Scoring Scale:** 1 (Weak force — favorable for us) to 5 (Very strong force — unfavorable for us)

   ---

   ## Force 1: Threat of New Entrants

   **Score: [1–5] / 5**

   > High score = easy for new competitors to enter (unfavorable). Low score = high barriers to entry (favorable).

   **Rationale:**
   - [Factor increasing threat, e.g., "Low capital requirements for SaaS tooling"]
   - [Factor decreasing threat, e.g., "Strong network effects once teams adopt the workflow"]

   **Barriers to Entry Present:**
   - [ ] High capital requirements
   - [ ] Proprietary technology / patents
   - [ ] Strong brand / switching costs
   - [ ] Network effects
   - [ ] Regulatory requirements
   - [ ] Economies of scale

   ---

   ## Force 2: Bargaining Power of Suppliers

   **Score: [1–5] / 5**

   > High score = suppliers have strong leverage over us (unfavorable). Low score = we have leverage (favorable).

   **Key Suppliers:**
   | Supplier | What They Provide | Our Dependency | Their Power |
   |----------|------------------|----------------|-------------|
   | [Supplier 1] | [What they provide] | High / Medium / Low | High / Medium / Low |
   | [Supplier 2] | [What they provide] | High / Medium / Low | High / Medium / Low |

   **Rationale:**
   - [Factor, e.g., "Heavy dependency on Anthropic pricing and API availability"]
   - [Mitigation, e.g., "Could build model-agnostic fallback to reduce dependency"]

   ---

   ## Force 3: Bargaining Power of Buyers

   **Score: [1–5] / 5**

   > High score = buyers have strong leverage (unfavorable). Low score = we have leverage (favorable).

   **Buyer Profiles:**
   | Buyer Type | Price Sensitivity | Switching Cost | Their Power |
   |-----------|------------------|----------------|-------------|
   | [Buyer type 1] | High / Medium / Low | High / Medium / Low | High / Medium / Low |
   | [Buyer type 2] | High / Medium / Low | High / Medium / Low | High / Medium / Low |

   **Rationale:**
   - [Factor, e.g., "Low switching costs — buyers can adopt competitor tools"]
   - [Factor, e.g., "No long-term contracts currently increase buyer leverage"]

   ---

   ## Force 4: Threat of Substitute Products

   **Score: [1–5] / 5**

   > High score = many substitutes exist (unfavorable). Low score = no close substitutes (favorable).

   **Known Substitutes:**
   | Substitute | How It Replaces Us | Relative Cost | Switching Ease |
   |-----------|-------------------|---------------|----------------|
   | [Substitute 1] | [How] | Higher / Lower / Similar | Easy / Medium / Hard |
   | [Substitute 2] | [How] | Higher / Lower / Similar | Easy / Medium / Hard |

   **Rationale:**
   - [Factor, e.g., "Manual documentation is a substitute but 70% slower"]
   - [Factor, e.g., "GitHub Copilot could expand into documentation generation"]

   ---

   ## Force 5: Competitive Rivalry

   **Score: [1–5] / 5**

   > High score = intense competition in the market (unfavorable). Low score = low competitive pressure (favorable).

   **Direct Competitors:**
   | Competitor | Strengths | Weaknesses | Market Share Est. |
   |-----------|-----------|------------|------------------|
   | [Competitor 1] | [Strengths] | [Weaknesses] | [%] |
   | [Competitor 2] | [Strengths] | [Weaknesses] | [%] |

   **Rationale:**
   - [Factor, e.g., "Market is fragmented — no dominant player in AI-assisted dev documentation"]
   - [Factor, e.g., "Low product differentiation in CLI tooling space increases rivalry"]

   ---

   ## Overall Competitive Position

   **Composite Score: [sum] / 25**

   | Force | Score | Favorability |
   |-------|-------|-------------|
   | 1 — Threat of New Entrants | [1–5] | Favorable / Neutral / Unfavorable |
   | 2 — Bargaining Power of Suppliers | [1–5] | Favorable / Neutral / Unfavorable |
   | 3 — Bargaining Power of Buyers | [1–5] | Favorable / Neutral / Unfavorable |
   | 4 — Threat of Substitutes | [1–5] | Favorable / Neutral / Unfavorable |
   | 5 — Competitive Rivalry | [1–5] | Favorable / Neutral / Unfavorable |
   | **Total** | **[X/25]** | **Strong (≤10) / Moderate (11–17) / Weak (18–25)** |

   **Narrative:**
   > [2-3 sentences: What is the dominant force? What is our current competitive position? What is the single most important strategic implication of this analysis?]

   ---

   ## Strategic Implications

   > Given this competitive landscape, what strategic moves are indicated? Each implication maps to the force it addresses.

   ### Priority Actions by Force

   | Force | Risk Level | Strategic Response |
   |-------|-----------|-------------------|
   | [Force name] | High / Medium / Low | [Strategic action to improve position on this force] |

   ### Recommendations
   1. [Recommendation 1 — address highest-scoring force first]
   2. [Recommendation 2]
   3. [Recommendation 3]

   ---

   ## Context / Background

   {Auto-filled from project docs — PRD vision, current features, relevant personas}

   ### Relevant Project Docs
   - PRD: {latest PRD filename}
   - User Flows: {latest userflows filename}
   - C4 Diagrams: {latest c4-diagrams filename}

   ---

   ## Assumptions

   | # | Assumption | Confidence | How to Validate |
   |---|-----------|------------|-----------------|
   | 1 | [Assumption] | High / Medium / Low | [Validation method] |

   ---

   ## Planned Experiments

   | Experiment | Hypothesis | Start Date | End Date | Duration | Progress |
   |-----------|-----------|------------|----------|----------|----------|
   | [Experiment] | [What is being tested] | [YYYY-MM-DD] | [YYYY-MM-DD] | [X weeks] | Not Started |

   ### Incremental Execution Strategy

   #### [Experiment Name]
   - **Force targeted:** [Which of the 5 forces does this experiment address?]
   - **Signal to confirm:** [Outcome showing force strength decreased]
   - **Stage 1 (Days 1–N):** [Narrow pilot]
     - Go/No-Go: [Threshold]
   - **Stage 2 (Days N–M):** [Expand if Stage 1 positive]
     - Go/No-Go: [Threshold]
   - **Stage 3 (Days M–End):** [Full run or pivot]
     - Outcome: [What success looks like]

   ---

   ## Previously Ran Experiments

   | Experiment | Hypothesis | Start Date | End Date | Progress | Result | Key Finding |
   |-----------|-----------|------------|----------|----------|--------|-------------|
   | [Experiment name] | [What was tested] | [YYYY-MM-DD] | [YYYY-MM-DD] | Completed / Stopped | ✅ Validated / ❌ Invalidated / ⚠️ Inconclusive | [Learning] |

   ---

   ## Decision Log

   | Date | Decision | Rationale | Decided By |
   |------|----------|-----------|------------|
   | {YYYY-MM-DD} | Porter's 5 Forces analysis initiated | [Reason] | [Name/Role] |

   ---

   ## Next Steps

   - [ ] Score all 5 forces with team input and supporting evidence
   - [ ] Write Strategic Implications per force
   - [ ] Prioritize experiments by highest-risk force
   - [ ] Create PR with `/create-pr` for team review
   ```

3. **Write Strategy File**
   - Use Write tool to create `strategy/{NNN}-{chosen-name}-v1.0.0.md`
   - Ensure all sections are populated (no empty placeholders except those labeled for user input)

### Phase 5: Update Strategy README (Table of Contents)

1. **Check if `/strategy/README.md` Exists**
   - Use Glob or Read to check for `strategy/README.md`
   - If it doesn't exist, create it with the header structure

2. **Read Current README (if exists)**
   - Read `strategy/README.md`
   - Parse the existing table of contents entries

3. **Generate Abstract**
   - Derive a 1-2 sentence abstract from the strategy description and the Open Questions generated in Phase 4
   - Keep it concise: what is the strategy about and what questions does it answer?

4. **Create or Update the README**
   - If creating fresh, use this template:
     ```markdown
     # Strategy Documents

     This folder contains versioned strategy documents for the project. Each strategy explores a key question or decision area, grounded in project context.

     Use `/create-pr` to submit a strategy for team review.

     ---

     ## Table of Contents

     | # | Document | Version | Date | Status | Abstract |
     |---|----------|---------|------|--------|----------|
     | {NNN} | [{Title}](./{filename}) | v1.0.0 | {YYYY-MM-DD} | Draft | {Abstract} |
     ```
   - If updating existing README, append a new row to the table:
     - Find the `| # | Document |` table header
     - Add new row at the bottom (chronological order — newest last)
     - Row format: `| {NNN} | [{Title}](./{filename}) | v1.0.0 | {YYYY-MM-DD} | Draft | {Abstract} |`
   - Use Write (for new) or Edit (for existing) to save the README

### Phase 6: Validate Creation

1. **Verify Files Created**
   - Read `strategy/{NNN}-{chosen-name}-v1.0.0.md` — confirm it exists and has content
   - Read `strategy/README.md` — confirm new entry is present

2. **Verify Required Sections in Strategy Document**
   - Section checklist depends on `template_mode`:

   **Standard template (`template_mode = "standard"`):**
   - ✅ Title (# heading)
   - ✅ Version, Date Created, Last Updated, Branch, Status metadata
   - ✅ Version History table
   - ✅ Open Questions section
   - ✅ Context / Background section
   - ✅ Assumptions section (table with Confidence and How to Validate columns)
   - ✅ Previously Ran Experiments section (table includes Start Date, End Date, Progress, Result, Key Finding)
   - ✅ Planned Experiments section (table includes Start Date, End Date, Duration, Progress)
   - ✅ Incremental Execution Strategy sub-section (Stage 1/2/3 + Go/No-Go criteria)
   - ✅ Analysis section
   - ✅ Confounding Factors sub-section inside Analysis
   - ✅ Recommendations section
   - ✅ Justifications sub-section inside Recommendations
   - ✅ Decision Log table
   - ✅ Next Steps section

   **5 Whys template (`template_mode = "5-whys"`):**
   - ✅ Title + Framework: 5 Whys Bilateral Analysis metadata
   - ✅ Problem Statement section with `five_whys_topic` and `five_whys_anchor`
   - ✅ The Bilateral Framework diagram block
   - ✅ Level 5: Identity section (both Product and User columns)
   - ✅ Level 4: Beliefs section (both columns)
   - ✅ Level 3: Systems section (both columns)
   - ✅ Level 2: Patterns section (both columns)
   - ✅ Level 1: Events / Outcomes section (both columns)
   - ✅ Root Cause Synthesis table (all 5 levels with alignment status)
   - ✅ Root Cause Category checkboxes
   - ✅ Corrective Actions table (Level column present)
   - ✅ Planned Experiments + Incremental Execution Strategy
   - ✅ Decision Log table
   - ✅ Next Steps section

   **Porter's 5 Forces template (`template_mode = "porters-5-forces"`):**
   - ✅ Title + Framework: Porter's 5 Forces Competitive Analysis metadata
   - ✅ Industry Overview section with Scoring Scale definition
   - ✅ Force 1: Threat of New Entrants (Score + Rationale + Barriers checklist)
   - ✅ Force 2: Bargaining Power of Suppliers (Score + Suppliers table + Rationale)
   - ✅ Force 3: Bargaining Power of Buyers (Score + Buyer Profiles table + Rationale)
   - ✅ Force 4: Threat of Substitute Products (Score + Substitutes table + Rationale)
   - ✅ Force 5: Competitive Rivalry (Score + Competitors table + Rationale)
   - ✅ Overall Competitive Position table (composite score + Strong/Moderate/Weak scale)
   - ✅ Strategic Implications section (Priority Actions table + Recommendations list)
   - ✅ Planned Experiments + Incremental Execution Strategy
   - ✅ Decision Log table
   - ✅ Next Steps section

3. **Verify Git Branch**
   - Run: `git branch --show-current`
   - Confirm output is `strategy/{chosen-name}`

4. **Display Validation Results**
   - List each check with ✅ or ⚠️
   - Note any warnings but do not fail for missing user-fill sections

### Phase 7: Generate Summary Report

1. **Collect Details**
   - Strategy file path
   - Branch name
   - README.md status (created/updated)
   - Validation results
   - Context documents read

2. **Display Summary**

```
✅ Strategy document created successfully!

📄 Strategy Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:     {Title}
File:      strategy/{NNN}-{chosen-name}-v1.0.0.md
Branch:    strategy/{chosen-name}
Version:   v1.0.0
Status:    Draft
Framework: {5 Whys Bilateral Analysis | Porter's 5 Forces Competitive Analysis | General}

📚 Context Read From:
- {latest PRD filename}
- {latest userflows filename}
- {latest design system filename}
- {latest c4-diagrams filename}

✅ Validations:
- ✅ Strategy file created
- ✅ All required sections present
- ✅ strategy/README.md updated (entry #{NNN} added)
- ✅ On branch: strategy/{chosen-name}
- ✅ Main branch protected (no commits to main)

🎯 Next Steps:
1. Fill in the Analysis section with your findings
2. Finalize the Recommendations section
3. Record decisions in the Decision Log as you go
4. When ready, run /create-pr to submit for review
5. Reference this strategy in relevant docs (PRD, ADRs, etc.)

✨ Your strategy document is ready! ✨
```

---

## --realign Workflow (Phases R0–R8)

> **Only entered when `/strategy --realign` is invoked.** This workflow replaces Phases 1–7 entirely. It synthesizes all existing strategy documents, identifies contradictions and stale content, and creates new versioned files to bring everything into alignment.

### Phase R0: Branch Setup for Realignment

1. **Check Current Branch**
   - Run: `git branch --show-current`
   - Store as `current_branch`

2. **Offer Branch Options**
   - Use AskUserQuestion:
     ```
     Question: "Where should realignment changes be written?"
     Options:
       1. "Create a new branch: strategy/realign-{YYYYMMDD}"
       2. "Write on current branch ({current_branch})"
       3. "Cancel — I'll prepare manually"
     ```
   - If option 1: run `git checkout -b strategy/realign-{YYYYMMDD}` (handle uncommitted changes same as Phase 4 in main workflow)
   - If option 2: continue on current branch, warn in summary
   - If option 3: stop execution

### Phase R1: Discover All Strategy Documents

1. **Glob All Strategy Files**
   - Use Glob to list all files matching `strategy/*.md`
   - Exclude `strategy/README.md`
   - Store as `strategy_docs[]`
   - If `strategy_docs[]` is empty: display "No strategy documents found in strategy/. Nothing to realign." and stop

2. **Read Each Document**
   - For each file in `strategy_docs[]`, read it and extract:
     - `title`: first `# Heading` value
     - `version`: `**Version:**` metadata value
     - `status`: `**Status:**` metadata value
     - `framework`: `**Framework:**` metadata value (if present — e.g., "5 Whys Bilateral Analysis", "Porter's 5 Forces", or absent for general)
     - `date_created`: `**Date Created:**` metadata value
     - `last_updated`: `**Last Updated:**` metadata value
     - `key_recommendations`: bullet points under `## Recommendations` → `### Recommended Approach`
     - `decision_log_entries`: all rows from `## Decision Log` table
     - `assumptions`: all rows from `## Assumptions` table
     - `core_identity_claims`: any statements about market position, target audience, or core bets found under `## Context`, `## Analysis`, `## Recommendations`, or `## Assumptions`
   - Store as `strategy_doc_data[]`

### Phase R2: Read Strategy README.md

1. **Read TOC**
   - Read `strategy/README.md`
   - If it doesn't exist: note in summary — continue without it
   - Parse the `## Table of Contents` table — extract each row: `{ NNN, title, filename, version, date, status }`
   - Store as `readme_toc_entries[]`

2. **Cross-Check TOC vs. Actual Files**
   - For each `readme_toc_entries[]` entry:
     - Check if the listed file exists
     - Check if the TOC version matches the `**Version:**` in the actual file
   - Flag discrepancies as `MISSING_FILE` or `VERSION_MISMATCH`

### Phase R3: Synthesize Current Beliefs / Identity

1. **Build Unified Strategic Identity**
   - From all `strategy_doc_data[]` entries, synthesize:
     - **Market Position:** What do all docs collectively say about who we are in the market?
     - **Target Audience:** What target audience decisions appear across docs?
     - **Core Bets:** What assumptions are stated with high confidence across docs?
     - **Contradictions:** Where do two or more docs make conflicting claims about the same topic?
   - Format contradictions:
     ```
     ⚠️ Contradiction: {doc-A} (v1.0.0) says "{claim A}"
                       {doc-B} (v1.0.0) says "{claim B}"
     ```

2. **Display Identity Summary to User**
   - Show the synthesized strategic identity (5-10 bullets)
   - List all contradictions found
   - List any README TOC discrepancies from Phase R2
   - This is informational only — no input required here

### Phase R4: Identify Realignment Gaps Per Document

1. **Per-Document Gap Analysis**
   - For each document in `strategy_doc_data[]`:
     - Compare its `assumptions` against assumptions in newer documents — flag any that have been contradicted
     - Compare its `key_recommendations` against recommendations in documents with later `date_created` — flag conflicts
     - Check if its `decision_log_entries` reference decisions that appear superseded by newer docs
   - Score each document:
     - `NEEDS_UPDATE`: has at least one gap
     - `CURRENT`: no significant gaps found

2. **Display Realignment Report**
   - For each `NEEDS_UPDATE` document, list specifically:
     - Which assumptions are stale
     - Which recommendations conflict with newer docs
     - Which decision log entries are superseded
   - Display before asking user to select docs in Phase R5

### Phase R5: Ask User to Confirm Realignment Scope

1. **Filter to NEEDS_UPDATE docs only**
   - If no docs need updating: display "All strategy documents appear current. No realignment needed." and stop

2. **Multi-Select (batched in groups of 4)**
   - If 4 or fewer docs need updating, use one AskUserQuestion:
     ```
     Question: "Select documents to realign:"
     multiSelect: true
     Options: {up to 4 doc names with brief gap description}
     ```
   - If more than 4 docs need updating, split into batches:
     - Batch 1: "Select from these documents (1 of 2):" — first 4 docs
     - Batch 2: "Select from remaining documents (2 of 2):" — remaining docs
     - Union all selections from all batches into `docs_to_realign[]`

3. **Handle Empty Selection**
   - If user selects nothing: display "No documents selected. Exiting realignment." and stop

### Phase R6: Create New Versions of Selected Docs

For each document in `docs_to_realign[]`:

1. **Determine New Version**
   - Parse current version from the file's `**Version:**` metadata (e.g., `v1.0.0`)
   - Bump minor version: `v1.0.0` → `v1.1.0`, `v1.2.0` → `v1.3.0`
   - **Preserve the original file** — do not modify or delete it

2. **Determine New Filename**
   - Extract the base name from the original filename (everything except the version segment)
   - Example: `001-porters-five-forces-analysis-v1.0.0.md` → `001-porters-five-forces-analysis-v1.1.0.md`

3. **Generate Updated Content**
   - Copy the full content of the original file
   - Update `**Version:**` to new version
   - Update `**Last Updated:**` to today's date
   - Add a new row to `## Version History`:
     ```
     | v{new-version} | {YYYY-MM-DD} | Realigned: {brief summary of what changed and why} |
     ```
   - Update stale sections:
     - `## Assumptions`: strike through stale assumptions with `~~text~~` and add new rows with updated assumptions
     - `## Recommendations`: add `> ⚠️ Realignment Note ({date}): This recommendation was superseded by {doc-name}. See revised recommendation below.` before outdated items, then add revised content
     - `## Decision Log`: add new row documenting the realignment decision
   - Write new file using Write tool

4. **Update strategy/README.md**
   - Add new TOC row for the new version directly below the original version's row
   - Do NOT remove the old version row
   - New row: `| {NNN} | [{Title} (v{new-version})](./{new-filename}) | v{new-version} | {date} | Realigned | {Updated abstract} |`

### Phase R7: PRD Alignment (Conditional)

1. **Ask User About PRD Update**
   - Use AskUserQuestion:
     ```
     Question: "Do you want to update the PRD to reflect these strategic realignments?"
     Options:
       1. "Yes — create new PRD version as draft (-draft suffix)"
       2. "Yes — create new PRD version as production (no suffix)"
       3. "No — skip PRD update"
     ```

2. **If Yes (Draft or Production):**
   - Glob `docs/002-prd-v*.md` — select the highest version file (excluding any `-draft` files)
   - Parse current version (e.g., `v1.3.0`)
   - Bump minor version: `v1.3.0` → `v1.4.0` (check that this version doesn't already exist — if it does, bump again)
   - Determine filename:
     - Draft: `docs/002-prd-v{new-version}-draft.md`
     - Production: `docs/002-prd-v{new-version}.md`
   - Read the current PRD — identify sections referencing outdated strategic claims from realigned docs
   - Create new PRD file:
     - Copy original content
     - Update `**Version:**` metadata
     - Add row to Version History: `| v{new-version} | {date} | Realigned: {sections updated} to reflect {list of realigned strategy docs} |`
     - Update affected sections with realigned strategic direction
     - Add `> Realignment Note ({date}): ...` callouts where significant changes were made
   - Write new file using Write tool

3. **If No:** skip to Phase R8

### Phase R8: Summary Report

```
✅ Strategy Realignment Complete!

📊 Realignment Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contradictions Found: {N}
Documents Analyzed:   {N}
Documents Updated:    {N}

📄 Updated Documents:
{For each realigned doc:}
  strategy/{old-filename} → strategy/{new-filename}
  Changes: {brief summary of what was realigned}

📋 strategy/README.md: Updated ({N} new version entries added)

{If PRD updated:}
📝 PRD Updated: docs/{new-prd-filename}
   Mode: {Draft | Production}
   Sections updated: {list}

{If PRD skipped:}
📝 PRD: Skipped

🎯 Next Steps:
1. Review each updated strategy document for accuracy
2. Fill in any [Realignment Note] placeholders manually
3. Run /create-pr to submit the realignment branch for review
4. Once merged, run /update-progress to reflect any completed stories

✨ All selected strategy documents are now realigned! ✨
```

---

## Input Format

**Command:**
```
/strategy {description}
```

**Examples:**
```
/strategy "Pricing strategy for v1.4.0 launch"
/strategy "Go-to-market plan for open-source release"
/strategy "Migration strategy from REST to GraphQL"
/strategy "Hiring roadmap for growing the team"
/strategy

# Framework-based
/strategy --5-whys
/strategy --5-whys "Customers churn after onboarding"
/strategy --porters-5-forces
/strategy --porters-5-forces "AI-assisted developer tooling market"

# Realignment
/strategy --realign
```
(Running without arguments triggers a two-question menu: General strategy vs. Framework-based analysis)

## Output Format

```
✅ Strategy document created successfully!

📄 Strategy Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:    Pricing Strategy V14 Launch
File:     strategy/001-pricing-strategy-v14-launch-v1.0.0.md
Branch:   strategy/pricing-strategy-v14-launch
Version:  v1.0.0
Status:   Draft

📚 Context Read From:
- docs/002-prd-v1.3.0.md (Product vision, roadmap, personas)
- docs/100-userflows-v1.1.0.md (User personas, journeys)
- docs/125-design-system-v1.0.0.md (Design principles)
- docs/175-c4-diagrams-v1.0.0.md (System architecture, containers, components)

✅ Validations:
- ✅ Strategy file created: strategy/001-pricing-strategy-v14-launch-v1.0.0.md
- ✅ Title: # Pricing Strategy V14 Launch
- ✅ Version History table present
- ✅ Open Questions section (3 questions generated)
- ✅ Context / Background auto-filled from PRD
- ✅ Analysis section present
- ✅ Recommendations section present
- ✅ Decision Log table present
- ✅ Next Steps section present
- ✅ strategy/README.md updated (entry #001 added)
- ✅ On branch: strategy/pricing-strategy-v14-launch
- ✅ Main branch protected

🎯 Next Steps:
1. Fill in the Analysis section with your findings
2. Compare options and finalize Recommendations
3. Record decisions in the Decision Log as you go
4. Run /create-pr when ready for team review

✨ Your strategy document is ready! ✨
```

## File Naming Logic

```
File:    strategy/{NNN}-{chosen-name}-v1.0.0.md
Branch:  strategy/{chosen-name}

NNN:
  - Count existing *.md files in strategy/ (excluding README.md)
  - next = count + 1, zero-padded to 3 digits
  - Examples: 001, 004, 013, 100

chosen-name:
  - Kebab-case, lowercase
  - Max 40 characters
  - No version numbers
  - Derived from user selection or custom input

Examples:
  strategy/001-pricing-strategy-v14-launch-v1.0.0.md
  strategy/002-oss-go-to-market-plan-v1.0.0.md
  strategy/003-rest-to-graphql-migration-v1.0.0.md
```

## README.md Table of Contents Format

```markdown
# Strategy Documents

This folder contains versioned strategy documents for the project. Each strategy explores a key question or decision area, grounded in project context.

Use `/create-pr` to submit a strategy for team review.

---

## Table of Contents

| # | Document | Version | Date | Status | Abstract |
|---|----------|---------|------|--------|----------|
| 001 | [Pricing Strategy V14 Launch](./001-pricing-strategy-v14-launch-v1.0.0.md) | v1.0.0 | 2026-02-18 | Draft | Explores pricing models for the v1.4.0 launch. Answers: what tier structure maximizes conversion, and how to price for solo devs vs. agencies. |
| 002 | [OSS Go-to-Market Plan](./002-oss-go-to-market-plan-v1.0.0.md) | v1.0.0 | 2026-02-20 | Draft | Defines launch channels and sequencing for the open-source release. |
```

## Important Notes

- **Branch Isolation**: The skill always creates a new branch before writing any files. Strategy work never lands directly on main.
- **Context Awareness**: The skill reads the latest PRD, user flows, and design system before drafting — the Context/Background section is auto-filled, not left blank.
- **AskUserQuestion**: Used at several points — to select the strategy file name, to confirm branch creation, and to handle edge cases (uncommitted changes, duplicate branches, existing similar strategies). Do not skip these prompts.
- **Branch Confirmation**: Always ask before creating the git branch (Phase 4, Step 1). The user may choose to write files on the current branch instead, or cancel entirely.
- **Paired with /create-pr**: After completing a strategy document, use `/create-pr` to submit the branch as a PR for review.
- **No Auto-Commit**: The skill writes files but does not commit them. The user should review the document before committing and creating a PR.
- **Version Numbering**: Strategy documents start at v1.0.0. To update an existing strategy (new analysis, revised recommendation), create a new version of the file (e.g., `v1.1.0`) and update the Version History table.
- **README.md is Append-Only**: New entries are always added to the bottom of the TOC table (chronological order). Existing entries are never removed.
- **Stash Recovery**: If git stash was used to handle uncommitted changes, remind the user at the end that a stash is waiting: "Run `git stash pop` on your previous branch to restore your changes."
- **Framework Modes**: `--5-whys` and `--porters-5-forces` activate specialized templates while still running the full Phase 2–7 workflow (context reading, goal/metric/experiment elicitation, branch creation, validation, summary). The 5 Whys template uses a bilateral Identity/Beliefs/Systems/Patterns/Events structure to surface root causes at the deepest causal level.
- **Realign Mode**: `--realign` activates a completely separate workflow (Phases R0–R8). Phases 1–7 do not run. Realign creates new versioned files and never overwrites existing ones.
- **Two-Question Menu**: When invoked with no args, the skill presents a two-question menu (General vs. Framework-based) to navigate to the right flow while respecting AskUserQuestion's 4-option maximum per question.
- **PRD Update in Realign**: When the user confirms a PRD update during `--realign`, the skill creates a new version file (never edits in place), respects draft vs. production mode, and checks existing versions via Glob before choosing the next version number.

## Error Handling

**No Description Provided:**
- Use the two-question menu (Phase 1, Step 1a):
  - First question: General vs. Framework-based vs. Other
  - Second question branches based on first answer:
    - General: shows 4 topic options (Pricing, GTM, Architecture, Other)
    - Framework: shows framework options (5 Whys, Porter's Forces, Other)
- Proceed normally once topic is identified

**Unknown Flag Provided:**
- If a flag other than `--5-whys`, `--porters-5-forces`, or `--realign` is provided:
  - Display: "Unrecognized flag: {flag}. Did you mean one of the following?"
  - Use AskUserQuestion:
    ```
    Question: "What did you mean to do?"
    Options:
      1. "Create a general strategy document"
      2. "Run 5 Whys analysis (--5-whys)"
      3. "Run Porter's 5 Forces analysis (--porters-5-forces)"
      4. "Realign existing strategy docs (--realign)"
    ```

**Git Not Available / Not a Repo:**
- Display: "This directory is not a git repository. Branch isolation requires git."
- Use AskUserQuestion:
  ```
  Question: "Git is not available. How do you want to proceed?"
  Options:
    1. "Create strategy files without branch isolation"
    2. "Cancel — I'll initialize git first"
  ```
- If "Create without branch isolation": proceed but skip Phase 3 entirely and warn in summary

**Uncommitted Changes:**
- Use AskUserQuestion: stash vs. cancel (as described in Phase 3)
- If stashed, remind user at end of summary

**Branch Already Exists:**
- Use AskUserQuestion: switch to existing, create with suffix, or cancel (as described in Phase 3)

**Context Documents Not Found:**
- If PRD, userflows, design system, or C4 diagrams docs are missing:
  - Continue without that context source
  - Note in the document's Context section: "[{doc} not found — add context manually]"
  - Warn user in summary: "⚠️ docs/002-prd-*.md not found. Context auto-fill was skipped for this source."
  - Apply same warning pattern for each missing doc (userflows, design system, c4-diagrams)

**strategy/README.md Write Failure:**
- Display: "Strategy document created but README.md could not be updated."
- Provide the table row to add manually:
  ```
  | {NNN} | [{Title}](./{filename}) | v1.0.0 | {date} | Draft | {abstract} |
  ```

**File Already Exists (NNN collision):**
- If the calculated `{NNN}-{name}-v1.0.0.md` already exists:
  - Increment NNN until a free slot is found
  - Display: "File 001 was taken, using 002 instead."

## Success Criteria

The `/strategy` command is successful when:

**Standard and framework modes (Phases 1–7):**
1. ✅ User selected (or provided) a strategy name via AskUserQuestion
2. ✅ `strategy/{NNN}-{chosen-name}-v1.0.0.md` file created with all required sections
3. ✅ Context / Background auto-filled from latest PRD, user flows, and design system
4. ✅ Open Questions section contains 3-5 starter questions inferred from description
5. ✅ `strategy/README.md` created (if new) or updated (if existing) with new TOC entry
6. ✅ Git branch `strategy/{chosen-name}` created and active
7. ✅ Main/default branch has not been modified
8. ✅ Validation passes for all required document sections (template-mode-aware checklist)
9. ✅ User receives clear summary with file path, branch name, framework, and next steps
10. ✅ User is reminded to use `/create-pr` when the strategy is ready for review

**5 Whys mode (`--5-whys`):**
11. ✅ `five_whys_topic` and `five_whys_anchor` captured and written into Problem Statement
12. ✅ All 5 bilateral levels present (Identity, Beliefs, Systems, Patterns, Events) with both Product and User columns
13. ✅ Root Cause Synthesis table present with all 5 levels and alignment status
14. ✅ Corrective Actions table includes Level column

**Porter's 5 Forces mode (`--porters-5-forces`):**
15. ✅ `porters_topic` captured and written into Industry Overview
16. ✅ All 5 forces present with Score (1–5), Rationale, and supporting tables/checklists
17. ✅ Overall Competitive Position table present with composite score and Strong/Moderate/Weak scale
18. ✅ Strategic Implications section present with per-force priority actions

**Realign mode (`--realign`):**
19. ✅ All strategy/*.md files (excluding README.md) discovered and read
20. ✅ Strategic identity synthesized and contradictions identified (Phase R3)
21. ✅ Per-document gap analysis completed (Phase R4)
22. ✅ User confirmed which documents to realign via multiSelect AskUserQuestion
23. ✅ New version files created for each selected document (old files preserved)
24. ✅ strategy/README.md TOC updated with new version entries
25. ✅ PRD update handled per user selection (draft / production / skipped)
26. ✅ Comprehensive realignment summary displayed (Phase R8)
