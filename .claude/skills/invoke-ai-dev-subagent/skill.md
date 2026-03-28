# Invoke AI Dev Subagent Command

Spawn one or multiple AI dev persona subagents to execute tasks independently. Subagents can work in parallel, sequentially, or in combination. Each subagent fully embodies their persona's identity, beliefs, and expertise.

## Execution Steps

### Phase 1: Parse Command Arguments

1. **Detect Invocation Mode**
   - Parse arguments to determine:
     - Single agent: `/invoke-ai-dev-subagent {persona} {task}`
     - Multiple parallel: `/invoke-ai-dev-subagent --parallel {persona1},{persona2} {task1} | {task2}`
     - Multiple sequential: `/invoke-ai-dev-subagent --sequential {persona1} > {persona2} {task}`
     - Hybrid persona: `/invoke-ai-dev-subagent {persona1}+{persona2} {task}`

2. **Extract Persona Names**
   - Split on `,` for parallel invocations
   - Split on `>` for sequential chains
   - Split on `+` for hybrid personas
   - Normalize to kebab-case: `pixel-perfectionist`, `the-bloodhound`, `tunnel-rat`, `the-regressor`

3. **Extract Task Descriptions**
   - For parallel: split on `|` to get individual tasks
   - For sequential: single task passed through chain
   - For single/hybrid: single task description

### Phase 2: Validate Personas Exist

1. **Check Persona Availability**
   - For each persona name, check if `.ai-dev-persona/{persona-name}/` exists
   - Use Glob: `.ai-dev-persona/{persona-name}/{persona-name}.md`
   - If persona doesn't exist:
     - Display error: "❌ Persona not found: {persona-name}"
     - List available personas from `.ai-dev-persona/personas.json`
     - Suggest: "Create with /create-ai-dev-persona"
     - Stop execution

2. **Load Persona Definitions**
   - Read `.ai-dev-persona/{persona-name}/{persona-name}.md` for full system prompt
   - Read `.ai-dev-persona/{persona-name}/metadata.json` for:
     - `display_name`
     - `entrance_message`
     - `document_radar`
     - `focus_areas`
     - `technical_skills`
     - `avoidance_zones`

### Phase 3: Prepare Subagent Context

1. **Build Persona Injection Prompt**
   - For each persona, create comprehensive context:
     ```markdown
     # 🎭 PERSONA ACTIVATION: {DISPLAY_NAME}

     **CRITICAL: You are NOT a generic AI assistant. You ARE {display_name}.**

     ## Your Entrance
     {entrance_message}

     ## Your Complete Persona Definition
     {Full content from persona .md file}

     ## Your Document Radar
     These are the project documents you track and reference:
     {For each document in document_radar:}
     - {priority} - {path} - {reason}

     ## Your Focus Areas
     {List focus_areas with bullets}

     ## Your Avoidance Zones
     {List avoidance_zones with bullets}

     ## System Behavior Rules
     1. **Think as this persona** - Use their mental models and methodologies
     2. **Communicate as this persona** - Adopt their voice, tone, and patterns
     3. **Decide as this persona** - Apply their values and beliefs
     4. **Reference document radar** - Consult tracked docs for context
     5. **Exhibit signature patterns** - Show their quirks naturally
     6. **Stay in character** - This is not role-play. This is transformation.

     ---

     ## Your Task
     {task_description}

     ---

     **Remember:** You ARE {display_name}. Every decision, every word, every output
     reflects their identity. Speak in their voice. Apply their methodology.
     Show their signature patterns.
     ```

2. **Determine Subagent Type**
   - Ask user to select subagent type, or auto-detect from task:
     - **Explore** - For codebase exploration, discovery, audits, understanding
     - **general-purpose** - For complex multi-step tasks requiring multiple tools
     - **Plan** - For planning implementation strategies (less common for persona tasks)
   - Default to `general-purpose` if unclear

3. **Determine Tool Grants**
   - Based on persona focus areas, grant appropriate tools:
     - **Frontend personas** (Pixel Perfectionist): Read, Write, Edit, Glob, Grep, Bash (for npm/testing)
     - **Backend personas** (Tunnel Rat): Read, Write, Edit, Glob, Grep, Bash (for database/API)
     - **Review personas** (The Bloodhound): Read, Glob, Grep (read-only for reviews)
     - **Full-stack personas** (The Regressor): All tools
   - Allow user override if needed

### Phase 4: Execute Subagent Invocations

#### Single Agent Mode

1. **Spawn Single Subagent**
   - Use Task tool with prepared persona context
   - Example:
     ```
     Task({
       subagent_type: "general-purpose",
       description: "{Persona} - {brief task}",
       prompt: "{Full persona injection prompt with task}",
       allowed_tools: [appropriate tools]
     })
     ```

2. **Monitor Execution**
   - Wait for task completion (blocking)
   - Capture result

3. **Display Result**
   - Show subagent output to user
   - Include persona sign-off

#### Parallel Mode (Multiple Agents Working Simultaneously)

1. **Spawn All Subagents in Single Message**
   - CRITICAL: Must send all Task calls in ONE message for parallel execution
   - Example:
     ```
     // Send these Task calls in a single response:
     Task({ subagent_type: "general-purpose", description: "Pixel Perfectionist - Build UI", prompt: "..." })
     Task({ subagent_type: "general-purpose", description: "Tunnel Rat - Build API", prompt: "..." })
     Task({ subagent_type: "general-purpose", description: "The Bloodhound - Review code", prompt: "..." })
     ```

2. **Wait for All Completions**
   - All agents run concurrently
   - Results come back as they complete

3. **Aggregate Results**
   - Display results from each persona
   - Show which persona completed which task
   - Highlight any conflicts or synergies

#### Sequential Mode (Agent Chain)

1. **Spawn First Agent**
   - Execute first persona with first task
   - Wait for completion (blocking)

2. **Pass Output to Next Agent**
   - Take output from Agent 1
   - Inject into Agent 2's task context:
     ```markdown
     ## Context from Previous Agent ({Persona 1})
     {Agent 1's complete output}

     ## Your Task
     {Original task} taking into account {Persona 1}'s work above.
     ```

3. **Continue Chain**
   - Repeat for each persona in sequence
   - Each agent builds on previous work

4. **Display Final Result**
   - Show complete chain output
   - Highlight how each persona contributed

#### Hybrid Persona Mode (Multiple Personas Fused)

1. **Synthesize Combined Persona**
   - Merge identities, beliefs, methodologies (like `/set-ai-dev-persona` does)
   - Create unified entrance message
   - Combine document radars (deduplicated)
   - Merge focus areas
   - Intersection of avoidance zones

2. **Spawn Single Agent with Fused Persona**
   - Single Task call with combined persona definition
   - Agent embodies multiple personas simultaneously

### Phase 5: Generate Summary Report

1. **Display Execution Summary**
   ```
   ✅ AI Dev Subagent(s) Invoked Successfully!

   🎭 Execution Mode: {Single / Parallel / Sequential / Hybrid}
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   {If single:}
   **Persona:** {Display Name}
   **Task:** {Task description}
   **Agent ID:** {agent_id} (for resuming)

   {If parallel:}
   **Personas Working in Parallel:**
   1. {Display Name 1} - {Task 1} (Agent ID: {id1})
   2. {Display Name 2} - {Task 2} (Agent ID: {id2})
   3. {Display Name 3} - {Task 3} (Agent ID: {id3})

   {If sequential:}
   **Sequential Chain:**
   {Display Name 1} → {Display Name 2} → {Display Name 3}
   **Task:** {Task passed through chain}

   {If hybrid:}
   **Hybrid Persona:** {Name 1} + {Name 2}
   **Combined Focus:** {Focus areas from both}
   **Task:** {Task description}

   📊 Results:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   {Subagent output(s) displayed below}

   ⚙️ Next Steps:
   - Review subagent output above
   - Resume any agent with TaskOutput({agent_id})
   - Invoke additional agents if needed
   ```

## Input Format

### Single Agent Invocation
```
/invoke-ai-dev-subagent {persona-name} {task-description}
```

**Examples:**
```
/invoke-ai-dev-subagent pixel-perfectionist Audit the frontend components for design system compliance

/invoke-ai-dev-subagent tunnel-rat Build a REST API endpoint for user authentication with JWT tokens

/invoke-ai-dev-subagent the-bloodhound Review the PR #42 for code smells and architectural issues
```

### Parallel Agent Invocation
```
/invoke-ai-dev-subagent --parallel {persona1},{persona2},{persona3} {task1} | {task2} | {task3}
```

**Examples:**
```
/invoke-ai-dev-subagent --parallel pixel-perfectionist,tunnel-rat Build login UI component | Build /api/auth/login endpoint

/invoke-ai-dev-subagent --parallel pixel-perfectionist,the-bloodhound,tunnel-rat Build dashboard UI | Review frontend code | Build analytics API
```

### Sequential Agent Chain
```
/invoke-ai-dev-subagent --sequential {persona1} > {persona2} > {persona3} {task}
```

**Examples:**
```
/invoke-ai-dev-subagent --sequential tunnel-rat > pixel-perfectionist > the-bloodhound Design user schema, then build UI components, then review everything

/invoke-ai-dev-subagent --sequential pixel-perfectionist > the-bloodhound Build new feature UI, then review it for quality
```

### Hybrid Persona (Fusion)
```
/invoke-ai-dev-subagent {persona1}+{persona2} {task}
```

**Examples:**
```
/invoke-ai-dev-subagent pixel-perfectionist+tunnel-rat Build a full-stack user profile page with pixel-perfect UI and optimized API

/invoke-ai-dev-subagent the-regressor Build the authentication system end-to-end with zero compromises
(Note: The Regressor is already a fusion persona, so no + needed)
```

### Simplified Format (Interactive)
```
/invoke-ai-dev-subagent
```
(Will prompt for persona selection and task description)

## Output Format

### Single Agent Output
```
✅ AI Dev Subagent Invoked Successfully!

🎭 Execution Mode: Single Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Persona:** Pixel Perfectionist
**Task:** Audit frontend components for design system compliance
**Subagent Type:** Explore
**Agent ID:** abc123 (for resuming)

📊 Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Pixel Perfectionist's entrance message}

{Complete output from subagent}

{Pixel Perfectionist's sign-off}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ Next Steps:
- Review audit findings above
- Resume agent: TaskOutput("abc123")
- Fix identified issues
```

### Parallel Agents Output
```
✅ AI Dev Subagents Invoked in Parallel!

🎭 Execution Mode: Parallel (3 agents)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Agents Working Simultaneously:**
1. 🎨 Pixel Perfectionist - Build dashboard UI (Agent: abc123)
2. 🐕‍🦺 The Bloodhound - Review frontend code (Agent: def456)
3. 🐀 Tunnel Rat - Build analytics API (Agent: ghi789)

📊 Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎨 Pixel Perfectionist Output:

{Pixel Perfectionist's work}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🐕‍🦺 The Bloodhound Output:

{The Bloodhound's work}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🐀 Tunnel Rat Output:

{Tunnel Rat's work}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Cross-Agent Analysis:
- Pixel Perfectionist built UI components
- The Bloodhound found 3 code smells in existing code
- Tunnel Rat created optimized API endpoints
- ✅ No conflicts detected
- 🎯 Synergy: UI components can consume Tunnel Rat's API
```

### Sequential Chain Output
```
✅ AI Dev Subagent Chain Executed!

🎭 Execution Mode: Sequential Chain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Chain:** Tunnel Rat → Pixel Perfectionist → The Bloodhound
**Task:** Design schema, build UI, review everything

📊 Chain Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Step 1: 🐀 Tunnel Rat (Schema Design)

{Tunnel Rat's entrance}
{Schema design output}
{Tunnel Rat's sign-off}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Step 2: 🎨 Pixel Perfectionist (UI Build)

{Pixel Perfectionist's entrance}
{Built UI using schema from Tunnel Rat}
{Pixel Perfectionist's sign-off}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Step 3: 🐕‍🦺 The Bloodhound (Review)

{The Bloodhound's entrance}
{Review of both schema and UI}
{The Bloodhound's sign-off}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Chain Complete! All three personas contributed successfully.
```

## Important Notes

- **Parallel vs Sequential:** Use `--parallel` when tasks are independent, `--sequential` when each depends on the previous
- **Hybrid Personas:** Combining personas creates synergy but may dilute individual specializations
- **The Regressor:** Already a fusion of all 3 base personas - use for critical full-stack work
- **Document Radar:** Each persona automatically has access to their tracked documents
- **Tool Permissions:** Automatically granted based on persona focus areas
- **Agent IDs:** Save for resuming work later with TaskOutput
- **Blocking Execution:** All modes wait for completion before showing results
- **Voice Consistency:** Each subagent fully embodies their persona throughout execution

## Error Handling

**Persona Not Found:**
- Display available personas from `.ai-dev-persona/personas.json`
- Suggest creation with `/create-ai-dev-persona`

**Invalid Syntax:**
- Show syntax examples for each mode
- Suggest: "Use /invoke-ai-dev-subagent with no args for interactive mode"

**Conflicting Persona Combination:**
- Warn if personas have incompatible avoidance zones
- Ask user to confirm or reselect

**Task Description Missing:**
- Prompt user with AskUserQuestion (free text)
- Ask: "What task should {persona} perform?"

**Subagent Execution Failed:**
- Display error from Task tool
- Show agent ID for debugging
- Suggest retry or different persona

## Success Criteria

The `/invoke-ai-dev-subagent` command is successful when:
1. ✅ Persona(s) validated and loaded
2. ✅ Persona definitions injected into subagent context
3. ✅ Document radar granted (if applicable)
4. ✅ Subagent(s) spawned with appropriate tools
5. ✅ Execution mode correctly handled (single/parallel/sequential/hybrid)
6. ✅ Results returned and displayed to user
7. ✅ Each subagent spoke in their persona voice
8. ✅ Agent IDs captured for potential resume
9. ✅ Summary report generated
10. ✅ User understands what was accomplished

## Advanced Usage Examples

### Example 1: Full-Stack Feature Development
```
/invoke-ai-dev-subagent --parallel tunnel-rat,pixel-perfectionist Build user profile API endpoint | Build user profile UI component
```
Both work simultaneously on their respective layers.

### Example 2: Quality-Focused Review Chain
```
/invoke-ai-dev-subagent --sequential the-bloodhound > pixel-perfectionist Review PR #42, then fix any visual issues found
```
Bloodhound reviews first, then Pixel Perfectionist addresses visual findings.

### Example 3: Omega-Tier Critical Work
```
/invoke-ai-dev-subagent the-regressor Build the authentication system end-to-end with database, API, and UI - perfection required
```
The Regressor (fusion persona) handles everything.

### Example 4: Custom Hybrid for Specific Need
```
/invoke-ai-dev-subagent pixel-perfectionist+the-bloodhound Build and review the design system components in one pass
```
Combined expertise: build with pixel perfection, immediately review with code quality lens.

## Future Enhancements

### v1.1.0
- Background execution mode (non-blocking)
- Agent collaboration (agents can spawn sub-agents)
- Persistent agent sessions (resume across commands)

### v1.2.0
- Conditional chains (if Bloodhound finds issues, spawn Pixel Perfectionist to fix)
- Agent voting (multiple personas debate and vote on decisions)
- Performance metrics (track agent execution time, success rate)

### v1.3.0
- Agent templates (save common invocation patterns)
- Cross-project agent portability
- Agent marketplace (share persona configurations)
