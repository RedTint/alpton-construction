---
description: Create a versioned strategy document on an isolated git branch, grounded in project context, with goals, metrics, experiments, and incremental execution planning. Supports --5-whys, --porters-5-forces, and --realign flags.
---

## Standard / Framework Mode (Phases 1–7)
> Run these phases when no --realign flag is present.

1. Parse Command and Determine Framework
   Detect flags in command arguments:
   - --5-whys → set template_mode = "5-whys", go to Phase 1b
   - --porters-5-forces → set template_mode = "porters-5-forces", go to Phase 1c
   - --realign → skip to Realign Workflow (Phases R0–R8)
   - No flag + description provided → set template_mode = "standard"
   - No flag + no description → show two-question menu:
     Question 1: "What type of strategy do you want to create?"
     - "General strategy document — pricing, GTM, architecture, hiring, etc."
     - "Framework-based analysis — 5 Whys, Porter's 5 Forces, etc."
     - "Other — describe what you want to create"
     Question 2 (if "General"): pick from Pricing / Go-to-Market / Architecture Migration / Other
     Question 2 (if "Framework"): pick from 5 Whys Bilateral / Porter's 5 Forces / Other

2. Phase 1a: General Strategy Name Selection
   > Only if template_mode = "standard"
   Generate 3 file name candidates in kebab-case (max 40 chars, no version numbers) from the description
   Use AskUserQuestion to let user choose:
   - Option 1: {candidate-1}
   - Option 2: {candidate-2}
   - Option 3: {candidate-3}
   - Other: type custom name → convert to kebab-case (lowercase, hyphens, alphanumeric only)
   Determine next file number: Glob strategy/*.md (excluding README.md), count existing files, NNN = count + 1 zero-padded to 3 digits
   Final filename: strategy/{NNN}-{chosen-name}-v1.0.0.md

3. Phase 1b: 5 Whys Entry
   > Only if --5-whys flag detected
   Ask for problem statement (free text): "What problem or outcome are you analyzing with 5 Whys?"
   Store as five_whys_topic
   Ask which side to anchor: "Both sides equally" / "Primarily Product/Company" / "Primarily User/Customer" / "I'm not sure"
   Store as five_whys_anchor
   Generate 3 filename candidates with prefix five-whys-{topic} (kebab-case, max 40 chars total)
   Let user choose filename via AskUserQuestion
   Determine next file number (same as Phase 1a)
   Set template_mode = "5-whys"

4. Phase 1c: Porter's 5 Forces Entry
   > Only if --porters-5-forces flag detected
   Ask for market/product context (free text): "What market or product are you analyzing with Porter's 5 Forces?"
   Store as porters_topic
   Generate 3 filename candidates with prefix porters-five-forces-{topic} (max 40 chars total)
   Let user choose filename via AskUserQuestion
   Determine next file number (same as Phase 1a)
   Set template_mode = "porters-5-forces"

5. Read Project Context
   Use Glob to find latest versions of context documents (highest semantic version):
   - docs/002-prd-v*.md
   - docs/100-userflows-v*.md
   - docs/125-design-system-v*.md
   - docs/175-c4-diagrams-v*.md
   Read each found file and extract:
   - PRD: project vision, goals, current features, roadmap, target personas, success metrics
   - User Flows: user personas (names, roles, pain points), primary user journeys
   - Design System: technology choices, design principles
   - C4 Diagrams: system context (external actors), container architecture, key component boundaries
   Synthesize a "Project Context Summary" for the document's Context/Background section
   If any doc not found, continue and note "[{doc} not found — add context manually]"
   Use Glob to list all strategy/*.md (excluding README.md), read each and collect prior experiments:
   - From each file's "## Previously Ran Experiments" section, extract rows where Result column is not empty
   - Store as prior_experiments[] with: name, hypothesis, result, key_finding, start_date, end_date
   Check for existing strategy on similar topic — if found, ask user: "Create new (separate document)" or "Cancel to update existing"

6. Elicit Goals, Metrics, and Experiments
   Suggest Goals: generate 3-5 specific outcome-oriented goals from strategy description and project context
   - Goals phrased as "We want to [achieve X] so that [outcome Y]"
   - For 5-whys: focus on root-cause resolution goals
   - For porters: focus on competitive positioning goals
   Use AskUserQuestion with multiSelect: true to let user select goals (including Other option)
   Store as selected_goals[]

   Suggest Metrics: generate 3-5 measurable, time-bound metrics from selected goals and strategy type
   Use AskUserQuestion with multiSelect: true including "None — I'll define metrics later"
   Store as selected_metrics[]

   Suggest Experiments: generate 3-5 actionable experiment ideas with for each:
   - Hypothesis: the assumption being tested
   - Action: concrete thing to do
   - Signal: how to know if it worked
   - Recommended Duration: content/SEO → 2-4 weeks | outreach → 1-2 weeks | pricing → 2-4 weeks | feature adoption → 4-6 weeks | community → 1-2 weeks | infrastructure → 1 week
   - Incremental Execution: Stage 1 (20-30% of duration): narrow pilot | Stage 2 (40-50%): expand if Stage 1 positive | Stage 3 (20-30%): full run or pivot | Go/No-Go criteria between each stage
   Use AskUserQuestion with multiSelect: true to let user select experiments
   For each selected experiment, calculate start_date = today and end_date = today + recommended_duration
   Store as selected_experiments[]

7. Create Git Branch
   Determine default branch: git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo "origin/main" → extract branch name
   Use AskUserQuestion to confirm branch creation:
   - "Yes — create branch 'strategy/{chosen-name}' from '{default-branch}'"
   - "No — save files on current branch instead" (warn in summary)
   - "Cancel — don't create any files yet" (stop execution)
   If Yes and uncommitted changes exist (git status --porcelain):
   - Ask: "Stash them and continue (git stash)" or "Cancel — I'll commit/discard them first"
   - If stash: run git stash push -m "Auto-stash before /strategy"
   Run: git checkout -b strategy/{chosen-name}
   If branch already exists: ask to switch to existing / create with -2 suffix / cancel
   Verify branch: git branch --show-current — confirm it matches strategy/{chosen-name}

8. Generate and Write Strategy Document
   Select template based on template_mode:

   Standard template sections (template_mode = "standard"):
   - Title, Version v1.0.0, Date Created, Last Updated, Branch, Status: Draft
   - Version History table
   - Open Questions: 3-5 starter questions inferred from description
   - Context / Background: auto-filled from project docs synthesis + Relevant Project Docs list
   - Assumptions table (with Confidence and How to Validate columns)
   - Previously Ran Experiments table (from prior_experiments[] or blank template row)
   - Planned Experiments table (from selected_experiments[]) with Start/End Date, Duration, Progress
   - Incremental Execution Strategy: Stage 1/2/3 breakdown and Go/No-Go criteria per experiment
   - Analysis section: Current State, Options Considered (A and B), Confounding Factors
   - Recommendations: Recommended Approach, Justifications (linked to selected_goals), Implementation Steps, Success Metrics
   - Decision Log table
   - Next Steps checklist

   5 Whys Bilateral template (template_mode = "5-whys") — adds:
   - Framework: 5 Whys Bilateral Analysis metadata
   - Problem Statement with five_whys_topic and five_whys_anchor
   - Bilateral Framework diagram
   - Level 5 Identity: Product/Company side vs User/Customer side (Current State, Assumption, Gap, Why it matters)
   - Level 4 Beliefs: same structure
   - Level 3 Systems: same structure
   - Level 2 Patterns: same structure
   - Level 1 Events/Outcomes: What happened, Observable signal, Immediate trigger
   - Root Cause Synthesis table: all 5 levels with alignment status
   - Root Cause Category checkboxes
   - Corrective Actions table (with Level column)
   - Planned Experiments + Incremental Execution Strategy
   - Decision Log and Next Steps

   Porter's 5 Forces template (template_mode = "porters-5-forces") — adds:
   - Framework: Porter's 5 Forces Competitive Analysis metadata
   - Industry Overview with porters_topic, Market Segment, Scoring Scale (1=weak/favorable to 5=strong/unfavorable)
   - Force 1 Threat of New Entrants: Score/5, Rationale, Barriers to Entry checklist
   - Force 2 Bargaining Power of Suppliers: Score/5, Suppliers table, Rationale
   - Force 3 Bargaining Power of Buyers: Score/5, Buyer Profiles table, Rationale
   - Force 4 Threat of Substitutes: Score/5, Substitutes table, Rationale
   - Force 5 Competitive Rivalry: Score/5, Competitors table, Rationale
   - Overall Competitive Position: composite score /25, Strong (≤10) / Moderate (11-17) / Weak (18-25)
   - Strategic Implications: Priority Actions by Force table, Recommendations list
   - Planned Experiments + Incremental Execution Strategy
   - Decision Log and Next Steps

   Write file to strategy/{NNN}-{chosen-name}-v1.0.0.md

9. Update Strategy README
   Check if strategy/README.md exists
   If it doesn't exist, create it with header: "# Strategy Documents" and Table of Contents table
   Generate 1-2 sentence abstract from strategy description and Open Questions
   Add new row to TOC table:
   | {NNN} | [{Title}](./{filename}) | v1.0.0 | {YYYY-MM-DD} | Draft | {abstract} |
   Use Write (new) or Edit (existing, append row at bottom — newest last, never remove existing rows)

10. Validate, Summarize, and Report
    Verify strategy file exists and has content
    Verify strategy/README.md has new entry
    Verify required sections are present based on template_mode (standard/5-whys/porters)
    Verify git branch: git branch --show-current = strategy/{chosen-name}
    Display summary:
    - Title, file path, branch, version, status, framework
    - Context documents read (list with filenames)
    - Validation results (each check as ✅ or ⚠️)
    - Next steps: fill Analysis section, finalize Recommendations, record in Decision Log, run /create-pr
    If git stash was used, remind user: "Run git stash pop on your previous branch to restore changes"

---

## Realign Workflow (Phases R0–R8)
> Only entered when --realign flag is detected. Replaces Phases 1–10 entirely.

11. R0: Branch Setup for Realignment
    Run: git branch --show-current → store as current_branch
    Use AskUserQuestion:
    - "Create new branch: strategy/realign-{YYYYMMDD}"
    - "Write on current branch ({current_branch})"
    - "Cancel — I'll prepare manually"
    If option 1: run git checkout -b strategy/realign-{YYYYMMDD} (handle uncommitted changes same as Phase 7)
    If option 2: continue on current branch, warn in summary
    If option 3: stop execution

12. R1: Discover and Read All Strategy Documents
    Use Glob to list all strategy/*.md (excluding README.md) → store as strategy_docs[]
    If empty: display "No strategy documents found. Nothing to realign." and stop
    For each file, read it and extract:
    - title (first # Heading), version (**Version:** value), status (**Status:**), framework (**Framework:** if present)
    - date_created, last_updated
    - key_recommendations (under ## Recommendations → ### Recommended Approach)
    - decision_log_entries (all rows from ## Decision Log)
    - assumptions (all rows from ## Assumptions)
    - core_identity_claims (statements about market position, target audience, core bets)

13. R2: Read Strategy README and Cross-Check TOC
    Read strategy/README.md if it exists, parse TOC table rows: {NNN, title, filename, version, date, status}
    For each TOC entry: check if file exists (flag MISSING_FILE) and if TOC version matches file version (flag VERSION_MISMATCH)

14. R3: Synthesize Current Strategic Identity
    From all strategy docs, synthesize:
    - Market Position: what docs collectively say about who we are in the market
    - Target Audience: target audience decisions across docs
    - Core Bets: high-confidence assumptions across docs
    - Contradictions: conflicting claims between docs — format as "⚠️ Contradiction: {doc-A} says '{claim A}' vs {doc-B} says '{claim B}'"
    Display identity summary (5-10 bullets), contradictions list, and README TOC discrepancies
    This step is informational only — no user input required

15. R4: Per-Document Gap Analysis
    For each strategy doc:
    - Compare assumptions against newer documents — flag any contradicted by newer docs
    - Compare recommendations against later documents — flag conflicts
    - Check if decision log references decisions superseded by newer docs
    Score each doc: NEEDS_UPDATE (at least one gap) or CURRENT (no significant gaps)
    Display realignment report: for each NEEDS_UPDATE doc, list stale assumptions, conflicting recommendations, superseded decisions

16. R5: Confirm Realignment Scope
    If no docs need updating: display "All strategy documents appear current. No realignment needed." and stop
    If 4 or fewer NEEDS_UPDATE docs: one AskUserQuestion multiSelect with all docs
    If more than 4: batch into groups of 4 with labeled questions ("Select documents to realign — batch 1 of N")
    Union all selections into docs_to_realign[]
    If user selects nothing: display "No documents selected. Exiting realignment." and stop

17. R6: Create New Versions of Selected Documents
    For each document in docs_to_realign[]:
    - Parse current version from **Version:** metadata (e.g., v1.0.0)
    - Bump minor version: v1.0.0 → v1.1.0, v1.2.0 → v1.3.0
    - Determine new filename: replace version segment in original filename
    - Preserve original file — do not modify or delete it
    - Generate updated content:
      - Copy full content of original
      - Update **Version:** to new version and **Last Updated:** to today
      - Add Version History row: | v{new} | {date} | Realigned: {brief summary of changes} |
      - Update ## Assumptions: strikethrough stale assumptions with ~~text~~ and add new rows
      - Update ## Recommendations: add "> ⚠️ Realignment Note ({date}): This recommendation was superseded by {doc-name}." before outdated items
      - Add new Decision Log row documenting the realignment
    - Write new file using Write tool
    - Add new TOC row in strategy/README.md directly below original version's row (do not remove old row):
      | {NNN} | [{Title} (v{new})](./{new-filename}) | v{new} | {date} | Realigned | {updated abstract} |

18. R7: PRD Alignment (Conditional)
    Use AskUserQuestion:
    - "Yes — create new PRD version as draft (-draft suffix)"
    - "Yes — create new PRD version as production (no suffix)"
    - "No — skip PRD update"
    If Yes (draft or production):
    - Glob docs/002-prd-v*.md (excluding -draft files) → select highest version, parse version
    - Bump minor version, check it doesn't already exist (bump again if needed)
    - Filename: docs/002-prd-v{new-version}.md or docs/002-prd-v{new-version}-draft.md
    - Read current PRD, identify sections referencing outdated strategic claims
    - Create new PRD file: copy content, update Version, add Version History row, update affected sections, add "> Realignment Note ({date}): ..." callouts

19. R8: Realignment Summary Report
    Display:
    - Contradictions found: N
    - Documents analyzed: N
    - Documents updated: N
    - For each realigned doc: old filename → new filename with brief summary of changes
    - strategy/README.md: Updated (N new version entries added)
    - PRD: Updated (filename + mode) or Skipped
    Next steps:
    - Review each updated strategy document for accuracy
    - Fill in any [Realignment Note] placeholders manually
    - Run /create-pr to submit the realignment branch for review
    - Once merged, run /update-progress to reflect any completed stories
