---
description: Conduct internet research with dated materials, references, excerpts, confidence/relevance scoring, and next steps
---

// Note: This is a condensed version of the Claude Code skill
// Original skill: 676 lines (21,339 chars) - reduced to fit 12,000 char limit
// For full automation with WebSearch/WebFetch, use Claude Code's /research command

1. Parse Research Query and Setup
   Extract research topic from command arguments
   If no query provided, prompt user for topic

   // Original: AskUserQuestion with multiSelect for scope
   // Antigravity: Manually select research scope from 8 options:
   Scope Options:
   - Technical Overview (concepts, architecture)
   - Best Practices (standards, patterns)
   - Use Cases & Examples (case studies)
   - Comparisons & Alternatives (competitive analysis)
   - Trends & Future Outlook (predictions)
   - Community & Ecosystem (tools, libraries)
   - Challenges & Pitfalls (problems, gotchas)
   - Getting Started (tutorials)

   Generate research filename:
   ```bash
   date +"%y%m%d%H%M"
   ```
   Format: YYMMddHHmm-{short-description}.md
   Example: 260226230-ai-code-generation.md

   Create research directory:
   ```bash
   mkdir -p docs/research
   ```

2. Conduct Primary Internet Research
   // Original: Uses WebSearch tool
   // Antigravity: Manually search the web

   Execute web searches:
   - Primary query: "{research topic} 2026 {scope keywords}"
   - Capture top 5-10 results with URLs

   For each top result, extract:
   - Title and URL
   - Publish date
   - Key excerpts (direct quotes)
   - Source authority (official docs, expert, publication)

3. Conduct Follow-Up Searches Based on Scope
   If "Comparisons" selected: Search "{topic} vs {competitor}"
   If "Best Practices" selected: Search "{topic} best practices"
   If "Challenges" selected: Search "{topic} problems issues"
   If "Use Cases" selected: Search "{topic} examples case studies"
   If "Trends" selected: Search "{topic} 2026 trends"

   Aggregate findings by category
   Track source URLs and publish dates

4. Analyze and Score Sources
   For each source, assess:
   - **Authority:** Official docs > recognized expert > blog
   - **Recency:** Favor recent sources (2025-2026)
   - **Depth:** Comprehensive > superficial
   - **Bias:** Objective > marketing content

   Assign Confidence Score (⭐ to ⭐⭐⭐⭐⭐):
   - ⭐ (1): Single unverified source
   - ⭐⭐ (2): Few sources, limited authority
   - ⭐⭐⭐ (3): Multiple sources, verified
   - ⭐⭐⭐⭐ (4): Many sources, high authority, recent
   - ⭐⭐⭐⭐⭐ (5): Consensus across authoritative sources

   Assign Relevance Score (⭐ to ⭐⭐⭐⭐⭐):
   - ⭐ (1): Tangentially related
   - ⭐⭐ (2): Somewhat related
   - ⭐⭐⭐ (3): Clearly related
   - ⭐⭐⭐⭐ (4): Highly relevant
   - ⭐⭐⭐⭐⭐ (5): Perfectly aligned

5. Create Research Document
   Write to docs/research/{filename}.md

   Document Structure:
   ```markdown
   ---
   research_id: {YYMMddHHmm}
   topic: {research topic}
   date: {YYYY-MM-DD HH:MM}
   scope: [{selected scope}]
   sources_count: {N}
   avg_confidence: {1-5}
   avg_relevance: {1-5}
   ---

   # Research: {Topic}

   **Research ID:** {YYMMddHHmm}
   **Date:** {Month DD, YYYY HH:MM}
   **Scope:** {Scope areas}

   ## Executive Summary

   {2-3 paragraph overview of findings}

   **Key Takeaways:**
   - {Takeaway 1}
   - {Takeaway 2}
   - {Takeaway 3}

   **Confidence:** {⭐⭐⭐⭐} (Average)
   **Relevance:** {⭐⭐⭐⭐⭐} (Average)

   ---

   ## Findings by Category

   ### {Scope Category 1}

   **Summary:** {1-2 paragraph synthesis}

   **Key Points:**
   - {Point 1}
   - {Point 2}

   **Sources:**
   - [{Title}]({URL}) — {Annotation}
     - **Excerpt:** "{Direct quote}"
     - **Confidence:** ⭐⭐⭐⭐
     - **Relevance:** ⭐⭐⭐⭐⭐
     - **Date:** {YYYY-MM-DD}
     - **Type:** {Official Docs / Blog / Tutorial}

   ---

   ## Confidence Assessment

   **Overall Confidence:** {⭐⭐⭐⭐}

   **Rationale:**
   - {# of authoritative sources}
   - {Consensus or debate}
   - {Recency of information}

   **Uncertainties:**
   - {What remains unclear}
   - {Conflicting information}

   ---

   ## Next Steps

   ### Immediate Actions

   1. **{Next action}**
      - Why: {Rationale}
      - How: {Approach}

   ### Follow-Up Research Prompts

   To deepen understanding:

   1. **"{Follow-up query 1}"**
      - Focus: {What to explore}
      - Expected insight: {What you'd learn}

   2. **"{Follow-up query 2}"**
      - Focus: {What to explore}

   3. **"{Follow-up query 3}"**
      - Focus: {What to explore}

   ### Suggested Commands

   ```bash
   # Continue research
   /research "{follow-up query}"

   # Create ADR based on findings
   /create-adr {decision}

   # Update documentation
   /define @{relevant-doc}
   ```

   ---

   ## Appendix: All Sources

   1. [{Title}]({URL}) — {Date} — Confidence: ⭐⭐⭐⭐ — Relevance: ⭐⭐⭐⭐⭐
   2. [{Title}]({URL}) — {Date} — Confidence: ⭐⭐⭐ — Relevance: ⭐⭐⭐⭐

   **Total Sources:** {N}
   **Date Range:** {Earliest} to {Latest}

   ---

   **Generated:** {YYYY-MM-DD HH:MM} via `/research`
   **Research ID:** {YYMMddHHmm}
   ```

6. Update Research README
   Check if docs/research/README.md exists
   If not, create new README

   README Structure:
   ```markdown
   # Research Materials

   Research documents from `/research` command.

   ## Index

   **Total Research Documents:** {N}
   **Latest:** {Most recent topic}

   ---

   ## Research Documents

   ### {YYMMddHHmm} - {Topic}
   **Date:** {Month DD, YYYY HH:MM}
   **Scope:** {Scope areas}
   **Sources:** {N} | **Confidence:** ⭐⭐⭐⭐ | **Relevance:** ⭐⭐⭐⭐⭐

   {1-2 sentence abstract}

   **Key Takeaways:**
   - {Takeaway 1}
   - {Takeaway 2}

   **File:** [{filename}](./{filename})

   ---
   ```

   Insert new entry at top of "Research Documents" section

7. Validate Research Document
   Check completeness:
   - ✅ Executive Summary present
   - ✅ All scope categories covered
   - ✅ Sources with URLs and excerpts
   - ✅ Confidence/Relevance scores
   - ✅ Next Steps with follow-up prompts
   - ✅ Markdown formatting correct

   Verify minimum quality:
   - ✅ At least 5 sources cited
   - ✅ At least 1 high-quality source (⭐⭐⭐⭐⭐)
   - ✅ Excerpts are direct quotes
   - ✅ URLs are valid
   - ✅ Dates included when available

8. Display Summary
   Show research completion summary:
   - Research ID and filename
   - Number of sources
   - Confidence and relevance scores
   - Key findings preview (3 bullet points)
   - Top 3 sources
   - Next steps preview
   - File locations

   Example output:
   ```
   🔍 Research complete!

   📋 Research Summary:
   Topic:        AI code generation tools 2026
   Research ID:  260226230
   Scope:        Technical Overview, Best Practices, Use Cases

   📊 Research Metrics:
   Total Sources:     12
   High Quality:      4 (⭐⭐⭐⭐⭐)
   Confidence:        ⭐⭐⭐⭐ (4.2/5)
   Relevance:         ⭐⭐⭐⭐⭐ (4.8/5)

   ✨ Key Findings:
   1. GitHub Copilot, Cursor, Replit AI lead market
   2. 73% of developers use AI coding assistants
   3. Cursor excels at multi-file edits

   🎯 Recommended Actions:
   1. Test Cursor for refactoring tasks
   2. Adopt prompt templates
   3. Monitor token costs

   🔗 Top Sources:
   ⭐⭐⭐⭐⭐ GitHub Copilot Docs (2026-02-15)
   ⭐⭐⭐⭐⭐ State of AI Survey (2026-01-20)
   ⭐⭐⭐⭐   ThePrimeagen Review (2026-01-05)

   📂 Files:
   Research:  docs/research/260226230-ai-code-generation.md
   README:    docs/research/README.md (updated)

   🚀 Next Steps:
   1. Try Cursor 7-day trial
   2. Benchmark Copilot on your codebase
   3. Follow-up: /research "AI code cost analysis"
   ```

// IMPORTANT LIMITATIONS:
// 1. No WebSearch/WebFetch automation (manual web research required)
// 2. Scope selection is manual (no multiSelect AskUserQuestion)
// 3. Source extraction requires manual copy-paste of URLs and excerpts
// 4. Confidence/Relevance scoring done manually
// 5. For full automation, use Claude Code's /research command

// CONVERSION NOTES:
// - Original: 676 lines, 21,339 characters (78% over limit)
// - Antigravity: Condensed to fit 12,000 char limit
// - Removed: Detailed examples, extensive templates, full markdown structure
// - Kept: Core workflow steps, scoring system, essential structure
// - Manual steps required for web research and data entry
