# Research Command

Conduct comprehensive internet research on any topic, save research materials with references and annotations, and provide actionable next steps for continued exploration.

## Purpose

The `/research` command helps you gather, organize, and synthesize information from the internet. It creates dated research documents with full references, excerpts, annotations, and confidence assessments. Perfect for exploring new technologies, market research, competitive analysis, or any topic requiring thorough investigation.

## Execution Steps

### Phase 1: Parse Research Query and Setup

1. **Extract Research Topic**
   - Parse command arguments to get research query
   - If no query provided, use AskUserQuestion to prompt for topic
   - Clean and format query for search optimization
   - Examples:
     - "AI code generation tools 2026"
     - "React Server Components best practices"
     - "Microservices vs monolith for SaaS"

2. **Use AskUserQuestion for Research Scope**
   Present multiSelect question to refine search:

   **Question:** "What aspects should be included in your research?"
   **Header:** "Research Scope"
   **multiSelect:** true
   **Options:**
   - **Technical Overview**: Fundamental concepts, how it works, architecture
   - **Best Practices**: Industry standards, recommended approaches, common patterns
   - **Use Cases & Examples**: Real-world applications, case studies, code examples
   - **Comparisons & Alternatives**: Competitive analysis, pros/cons, trade-offs
   - **Trends & Future Outlook**: Latest developments, predictions, roadmap
   - **Community & Ecosystem**: Popular tools, libraries, frameworks, community size
   - **Challenges & Pitfalls**: Common problems, limitations, gotchas to avoid
   - **Getting Started**: Tutorials, quickstarts, learning resources

3. **Generate Research Filename**
   - Get current timestamp: `date +"%y%m%d%H%M"`
   - Format: `YYMMddHHmm-{short-description}.md`
   - Short description: Extract 2-4 keywords from query, kebab-case
   - Example: `260226143-ai-code-generation.md`
   - Truncate to max 50 chars total

4. **Create Research Directory**
   - Use Bash: `mkdir -p docs/research`
   - Verify directory exists
   - Check if README.md exists (for later update)

### Phase 2: Conduct Internet Research

1. **Execute Primary Web Search**
   - Use WebSearch tool with optimized query
   - Query format: "{research topic} {current year} {scope keywords}"
   - Example: "AI code generation tools 2026 best practices"
   - Capture search results with titles and URLs

2. **Fetch Top Sources**
   - For top 5-10 search results, use WebFetch
   - Extract key information based on selected scope:
     - **Technical Overview**: Architecture, components, how it works
     - **Best Practices**: Recommended patterns, dos and don'ts
     - **Use Cases**: Real applications, success stories
     - **Comparisons**: Feature matrices, benchmarks, trade-offs
     - **Trends**: Latest updates, roadmap, emerging patterns
     - **Community**: GitHub stars, npm downloads, Stack Overflow activity
     - **Challenges**: Known issues, limitations, workarounds
     - **Getting Started**: Tutorials, quickstart guides, documentation links

3. **Conduct Targeted Follow-up Searches**
   Based on selected scope, execute additional searches:
   - If "Comparisons & Alternatives" selected: "{topic} vs {competitor}"
   - If "Best Practices" selected: "{topic} best practices tutorial"
   - If "Challenges & Pitfalls" selected: "{topic} problems issues gotchas"
   - If "Use Cases & Examples" selected: "{topic} examples case studies"
   - If "Trends & Future Outlook" selected: "{topic} 2026 trends future"

4. **Aggregate and Organize Findings**
   - Group findings by scope category
   - Extract key excerpts with exact quotes
   - Note source URLs for each finding
   - Track publish dates when available
   - Identify authoritative sources (official docs, recognized experts)

### Phase 3: Analyze and Synthesize Research

1. **Assess Source Quality**
   For each source, evaluate:
   - **Authority**: Official documentation, recognized expert, reputable publication
   - **Recency**: Publication date (favor recent sources)
   - **Depth**: Superficial vs comprehensive coverage
   - **Bias**: Vendor/marketing content vs objective analysis

   Assign quality score: High / Medium / Low

2. **Calculate Confidence and Relevance**

   **Confidence Score (1-5):**
   - ⭐ (1): Single source, unverified, potentially biased
   - ⭐⭐ (2): Few sources, some verification, limited authority
   - ⭐⭐⭐ (3): Multiple sources, generally verified, decent authority
   - ⭐⭐⭐⭐ (4): Many sources, well-verified, high authority, recent
   - ⭐⭐⭐⭐⭐ (5): Consensus across authoritative sources, official documentation

   **Relevance Score (1-5):**
   - ⭐ (1): Tangentially related, minimal alignment with query
   - ⭐⭐ (2): Somewhat related, partial alignment
   - ⭐⭐⭐ (3): Clearly related, good alignment with query
   - ⭐⭐⭐⭐ (4): Highly relevant, strong alignment, addresses key aspects
   - ⭐⭐⭐⭐⭐ (5): Perfectly aligned, directly answers research question

3. **Identify Key Themes and Patterns**
   - Recurring concepts across multiple sources
   - Consensus opinions vs debates
   - Common recommendations
   - Frequently mentioned tools/frameworks
   - Emerging trends or shifts

4. **Extract Actionable Insights**
   - What are the main takeaways?
   - What decisions can be made based on this research?
   - What questions remain unanswered?
   - What contradictions or uncertainties exist?

### Phase 4: Generate Research Document

1. **Create Document Structure**

   ```markdown
   ---
   research_id: {YYMMddHHmm}
   topic: {research topic}
   date: {YYYY-MM-DD HH:MM}
   scope: [{selected scope areas}]
   sources_count: {N}
   avg_confidence: {1-5}
   avg_relevance: {1-5}
   ---

   # Research: {Topic}

   **Research ID:** {YYMMddHHmm}
   **Date:** {Month DD, YYYY HH:MM}
   **Scope:** {Comma-separated scope areas}

   ## Executive Summary

   {2-3 paragraph overview of key findings}

   **Key Takeaways:**
   - {Takeaway 1}
   - {Takeaway 2}
   - {Takeaway 3}

   **Confidence:** {⭐⭐⭐⭐⭐} (Average across all sources)
   **Relevance:** {⭐⭐⭐⭐⭐} (Average across all sources)

   ---

   ## Findings by Category

   ### {Scope Category 1}

   **Summary:**
   {1-2 paragraph synthesis of findings in this category}

   **Key Points:**
   - {Point 1}
   - {Point 2}
   - {Point 3}

   **Sources:**
   - [{Source Title}]({URL}) — {Annotation}
     - **Excerpt:** "{Direct quote}"
     - **Confidence:** ⭐⭐⭐⭐
     - **Relevance:** ⭐⭐⭐⭐⭐
     - **Date:** {YYYY-MM-DD}
     - **Type:** Official Docs / Blog Post / Tutorial / Research Paper

   - [{Source Title}]({URL}) — {Annotation}
     - **Excerpt:** "{Direct quote}"
     - **Confidence:** ⭐⭐⭐
     - **Relevance:** ⭐⭐⭐⭐

   ---

   ## Deep Dive: {Main Topic}

   {Comprehensive analysis of main research question}

   ### Current State

   {What exists today}

   ### Best Practices

   {Recommended approaches}

   ### Common Patterns

   {Frequently seen implementations}

   ### Challenges

   {Known problems and limitations}

   ---

   ## Source Analysis

   ### High-Quality Sources (⭐⭐⭐⭐⭐)

   1. **[{Title}]({URL})**
      - **Author/Publisher:** {Name}
      - **Date:** {YYYY-MM-DD}
      - **Why High Quality:** {Explanation}
      - **Key Contribution:** {What this source adds}

   ### Supporting Sources (⭐⭐⭐ - ⭐⭐⭐⭐)

   {List of supporting sources with brief annotations}

   ### Additional References

   {Other sources consulted}

   ---

   ## Confidence Assessment

   **Overall Confidence:** {⭐⭐⭐⭐⭐}

   **Rationale:**
   - {Reason for confidence level}
   - {Number of authoritative sources}
   - {Consensus or debate status}
   - {Recency of information}

   **Uncertainties:**
   - {What remains unclear}
   - {Conflicting information}
   - {Gaps in research}

   ---

   ## Relevance Assessment

   **Overall Relevance:** {⭐⭐⭐⭐⭐}

   **How This Research Addresses Your Query:**
   - {Direct answer to main question}
   - {Coverage of sub-questions}
   - {Alignment with scope}

   **What's Missing:**
   - {Aspects not fully covered}
   - {Questions raised but not answered}

   ---

   ## Synthesis & Recommendations

   ### Main Conclusions

   1. **{Conclusion 1}**
      {Supporting evidence}

   2. **{Conclusion 2}**
      {Supporting evidence}

   3. **{Conclusion 3}**
      {Supporting evidence}

   ### Recommended Actions

   Based on this research:
   1. {Actionable recommendation 1}
   2. {Actionable recommendation 2}
   3. {Actionable recommendation 3}

   ### When to Use / Not Use

   **Use when:**
   - {Scenario 1}
   - {Scenario 2}

   **Avoid when:**
   - {Scenario 1}
   - {Scenario 2}

   ---

   ## Next Steps

   ### Immediate Actions

   1. **{Next action}**
      - Why: {Rationale}
      - How: {Approach}

   2. **{Next action}**
      - Why: {Rationale}
      - How: {Approach}

   ### Follow-Up Research Prompts

   To deepen your understanding, consider researching:

   1. **"{Follow-up query 1}"**
      - Focus: {What this would explore}
      - Expected insight: {What you'd learn}

   2. **"{Follow-up query 2}"**
      - Focus: {What this would explore}
      - Expected insight: {What you'd learn}

   3. **"{Follow-up query 3}"**
      - Focus: {What this would explore}
      - Expected insight: {What you'd learn}

   ### Suggested Commands

   ```bash
   # Continue research with refined query
   /research "{follow-up query 1}"

   # Create ADR based on findings
   /create-adr {decision based on research}

   # Update documentation with insights
   /define @{relevant-doc}
   ```

   ---

   ## Related Research

   {Links to other research documents in /docs/research if relevant}

   ---

   ## Appendix: All Sources

   1. [{Title}]({URL}) — {Date} — Confidence: ⭐⭐⭐⭐ — Relevance: ⭐⭐⭐⭐⭐
   2. [{Title}]({URL}) — {Date} — Confidence: ⭐⭐⭐ — Relevance: ⭐⭐⭐⭐
   3. ...

   **Total Sources:** {N}
   **Date Range:** {Earliest} to {Latest}
   **Primary Domains:** {list of main source domains}

   ---

   **Generated:** {YYYY-MM-DD HH:MM} via `/research` command
   **Research ID:** {YYMMddHHmm}
   ```

2. **Write Research Document**
   - Use Write tool to create `docs/research/{filename}.md`
   - Ensure all sections are complete
   - Verify markdown formatting
   - Include all sources with proper links

### Phase 5: Update Research README

1. **Check if README Exists**
   - Read `docs/research/README.md` if exists
   - If not, create new README with header and structure

2. **Extract Research Metadata**
   - Research ID (timestamp)
   - Topic
   - Scope areas
   - Source count
   - Confidence and Relevance scores
   - Date

3. **Generate Abstract Entry**
   Format for README:
   ```markdown
   ### {YYMMddHHmm} - {Topic}
   **Date:** {Month DD, YYYY HH:MM}
   **Scope:** {Scope areas}
   **Sources:** {N} | **Confidence:** ⭐⭐⭐⭐ | **Relevance:** ⭐⭐⭐⭐⭐

   {1-2 sentence abstract of key findings}

   **Key Takeaways:**
   - {Takeaway 1}
   - {Takeaway 2}

   **File:** [{filename}](./{filename})

   ---
   ```

4. **Update or Create README**

   If README doesn't exist, create:
   ```markdown
   # Research Materials

   This folder contains research documents generated by the `/research` command. Each research session is saved with a timestamp and includes comprehensive findings, references, and next steps.

   ## Index

   **Total Research Documents:** {N}
   **Latest:** {Most recent topic}
   **Coverage Areas:** {List of topics researched}

   ---

   ## Research Documents

   {Abstract entries in reverse chronological order}
   ```

   If README exists, insert new abstract at top of "Research Documents" section

### Phase 6: Validate Research Quality

1. **Verify Document Completeness**
   - ✅ Executive Summary present
   - ✅ All selected scope categories covered
   - ✅ Sources include URLs and excerpts
   - ✅ Confidence and Relevance scores calculated
   - ✅ Next Steps section with follow-up prompts
   - ✅ All markdown formatting correct

2. **Check Source Quality**
   - ✅ Minimum 5 sources cited
   - ✅ At least 1 high-quality (⭐⭐⭐⭐⭐) source
   - ✅ Excerpts are direct quotes (not paraphrased)
   - ✅ URLs are valid and accessible
   - ✅ Dates included when available

3. **Validate Assessments**
   - ✅ Confidence scores justified
   - ✅ Relevance scores align with query
   - ✅ Uncertainties acknowledged
   - ✅ Conflicting information noted

4. **Review Next Steps**
   - ✅ Immediate actions are specific
   - ✅ Follow-up prompts are actionable
   - ✅ Suggested commands are relevant

### Phase 7: Generate Summary Report

1. **Collect Research Metrics**
   - Total sources found
   - High-quality sources (⭐⭐⭐⭐⭐)
   - Average confidence score
   - Average relevance score
   - Scope categories covered
   - Research document size (word count)

2. **Display Comprehensive Summary**
   Show detailed output to user with:
   - Research ID and filename
   - Number of sources
   - Confidence and relevance scores
   - Key findings preview
   - Next steps preview
   - File locations

## Input Format

**Command:**
```
/research {research query}
```

**Examples:**
```bash
# Technology research
/research "AI code generation tools 2026"

# Market research
/research "SaaS pricing strategies for developer tools"

# Best practices
/research "React Server Components vs Client Components"

# Competitive analysis
/research "Microservices vs monolith architecture for startups"

# Trend analysis
/research "TypeScript adoption trends 2026"

# Tool comparison
/research "Vite vs Webpack build performance"
```

## Output Format

```
🔍 Research complete!

📋 Research Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Topic:        AI code generation tools 2026
Research ID:  260226143
Date:         February 26, 2026 14:30
Scope:        Technical Overview, Best Practices, Use Cases, Comparisons

📊 Research Metrics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Sources:     12
High Quality:      4 (⭐⭐⭐⭐⭐)
Confidence:        ⭐⭐⭐⭐ (4.2/5)
Relevance:         ⭐⭐⭐⭐⭐ (4.8/5)
Document Size:     ~3,500 words

✨ Key Findings:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GitHub Copilot, Cursor, and Replit AI lead the market in 2026
2. Best practices emphasize prompt engineering and context management
3. 73% of developers now use AI coding assistants daily (up from 45% in 2024)
4. Performance: Copilot excels at autocomplete, Cursor at multi-file edits

🎯 Recommended Actions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Test Cursor for complex refactoring tasks (outperforms alternatives)
2. Adopt prompt templates for consistency (best practice from 8/12 sources)
3. Monitor token costs if using API-based tools (can exceed $100/month)

🔗 Top Sources:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐⭐⭐⭐⭐ GitHub Copilot Official Docs (2026-02-15)
⭐⭐⭐⭐⭐ State of AI Code Generation Survey (2026-01-20)
⭐⭐⭐⭐⭐ Cursor vs Copilot Benchmark Study (2026-02-10)
⭐⭐⭐⭐   ThePrimeagen: AI Coding Tools Review (2026-01-05)

📂 Files Created:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Research:  docs/research/260226143-ai-code-generation.md
README:    docs/research/README.md (updated)

🚀 Next Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### Immediate Actions
1. Try Cursor with 7-day trial
2. Benchmark Copilot on your codebase
3. Set up prompt templates library

### Follow-Up Research Prompts
1. "/research 'AI code generation cost analysis enterprise'"
   → Explore pricing models and ROI for teams

2. "/research 'prompt engineering best practices for code generation'"
   → Deep dive on effective prompting strategies

3. "/research 'AI code security vulnerabilities 2026'"
   → Investigate security concerns and mitigations

### Suggested Commands
```bash
# Continue research on pricing
/research "AI code generation cost analysis enterprise"

# Document decision
/create-adr adopt-cursor-for-ai-assisted-development

# Update tech stack
/define @150-tech-stacks-v1.0.0.md
```

✨ Research saved successfully! Review the full document for detailed findings and references.
```

## Important Notes

- **Internet Access Required:** This skill uses WebSearch and WebFetch tools
- **Source Validation:** Always verify critical information from multiple sources
- **Bias Awareness:** Note vendor/marketing content vs objective analysis
- **Currency:** Research reflects information available at search time
- **Deep Research:** For topics requiring extensive research, run command multiple times with refined queries
- **Reference Integrity:** All excerpts must be direct quotes with source attribution
- **Confidence vs Truth:** High confidence means consensus, not absolute truth
- **Follow-Up Research:** Use suggested prompts to explore topics more deeply
- **README Management:** README.md provides quick overview of all research
- **Search Optimization:** Queries include current year (2026) for recent results
- **Multi-Select Scope:** Allows focusing research on specific aspects
- **Next Steps Focus:** Emphasizes actionable insights and continued exploration

## Error Handling

**No Research Query Provided:**
- Use AskUserQuestion to prompt for research topic
- Suggest examples: "AI tools", "SaaS pricing", "React patterns"
- Require non-empty query before proceeding

**Internet Connection Failed:**
- Display error: "Cannot connect to internet for research"
- Suggest: "Check network connection and try again"
- Provide offline alternative: "Use /define to work with existing documentation"

**WebSearch Returns No Results:**
- Display warning: "No search results found for query: {query}"
- Suggest:
  - Broaden search terms
  - Remove year constraint
  - Check spelling
  - Try different keywords

**WebFetch Fails for Source:**
- Note in research document: "Source unavailable: {URL}"
- Continue with other sources
- Warn if <3 sources accessible

**README Update Fails:**
- Research document still created successfully
- Display warning: "Could not update README.md"
- Suggest manual addition to README

**Invalid Scope Selection:**
- If no scope selected in multiSelect:
  - Use default: Technical Overview, Best Practices, Use Cases
  - Notify user of default selection

**Directory Creation Failed:**
- Display error: "Could not create docs/research directory"
- Check permissions
- Suggest manual directory creation

**Low Source Quality:**
- If all sources are ⭐⭐ or below:
  - Display warning: "Research confidence is low - limited authoritative sources"
  - Suggest refining query or adding specific keywords
  - Still complete research but note limitations

**Conflicting Information:**
- If sources contradict:
  - Note conflicts in Confidence Assessment section
  - List conflicting viewpoints
  - Recommend additional research to resolve

## Success Criteria

The `/research` command is successful when:
1. ✅ Research query parsed and refined with scope selection
2. ✅ Internet searches executed successfully
3. ✅ Minimum 5 sources fetched and analyzed
4. ✅ Research document created with all required sections
5. ✅ Sources include URLs, excerpts, and annotations
6. ✅ Confidence scores calculated and justified
7. ✅ Relevance scores calculated and justified
8. ✅ Executive summary captures key findings
9. ✅ Next Steps section with 3+ follow-up prompts
10. ✅ Immediate actions are specific and actionable
11. ✅ README.md updated with research abstract
12. ✅ All markdown formatting is correct
13. ✅ User receives comprehensive summary
14. ✅ Research is immediately usable for decision-making

## Future Enhancements

### v1.1.0
- Save search results cache for offline review
- Export research to PDF
- Integration with note-taking tools (Notion, Obsidian)
- Automatic citation formatting (APA, MLA, Chicago)

### v1.2.0
- Research comparison mode (compare multiple topics side-by-side)
- Trend analysis across multiple research sessions
- Automated literature review generation
- Research collaboration (multi-user annotations)

### v1.3.0
- AI-powered insight extraction and summarization
- Automatic knowledge graph generation from research
- Research question recommendation engine
- Integration with academic databases (arXiv, IEEE)
- Periodic research refresh (alert when sources outdated)
