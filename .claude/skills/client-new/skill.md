# Client New Command

Scaffold a complete new client folder under `docs/clients/` with all template documents, then prompt for key profile details to fill in immediately.

## Execution Steps

### Phase 1: Parse and Validate Client Name

1. **Extract Client Name**
   - Parse the command argument as the client display name
   - Examples: `"Acme Corp"`, `"Beta Startup"`, `"Jordan Smith"`
   - If no name provided, use AskUserQuestion:
     - "What is the client's name? (e.g., Acme Corp, Beta Startup)"

2. **Validate Client Name**
   - Must not be empty
   - Must not contain only numbers or special characters
   - If invalid, prompt again with helpful guidance

3. **Check for Duplicate Clients**
   - Use Glob to scan `docs/clients/*/001.client-profile.md`
   - Grep each for the client name (case-insensitive)
   - If a match is found:
     - Display: "⚠️ A client with a similar name already exists: `{folder}`"
     - Use AskUserQuestion: "Create anyway?" (Yes / No — view existing)
     - If No: display existing client folder path and exit

### Phase 2: Run Setup Script

1. **Execute `client-new-setup.sh`**
   - Run via Bash:
     ```bash
     bash .ai-dev/ai-dev-scripts/client-new-setup.sh --client-name "{CLIENT_NAME}"
     ```
   - Capture stdout to extract `CLIENT_DIR`, `CLIENT_ID`, `CLIENT_SLUG`
   - If the script exits non-zero:
     - Display the error output
     - Abort with: "❌ Client scaffold failed — see error above"

2. **Parse Script Output**
   - Extract from the script's printed lines:
     - `CLIENT_DIR` (e.g., `docs/clients/001-acme-corp`)
     - `CLIENT_ID` (e.g., `001`)
     - `CLIENT_SLUG` (e.g., `acme-corp`)

### Phase 3: Prompt for Key Profile Details

After the folder is scaffolded, optionally fill in the most important profile fields right away so the client doc isn't left as a blank template.

1. **Ask for Quick Profile Info**
   Use AskUserQuestion (single multi-question pass):
   - "What industry is this client in?" (e.g., SaaS, E-commerce, Healthcare, Finance)
   - "What is the engagement type?" (Development / Consulting / Retainer / One-time Project)
   - "Briefly describe the project scope (1-2 sentences)"

2. **Apply Answers to Profile**
   - Use Edit tool to update `{CLIENT_DIR}/001.client-profile.md`:
     - Replace `{Industry}` with user's answer
     - Replace `Consulting | Development | Retainer | One-time Project` with selected type
     - Replace `{Brief scope description}` with user's scope text

   - If user skips / provides empty answers: leave template placeholders as-is

### Phase 4: Update Epic Stats (Optional)

1. **Refresh Epic 008 Aggregate Stats**
   - Run the aggregation script:
     ```bash
     node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --epic=008
     ```
   - This keeps the dashboard in sync if it's running
   - If it exits non-zero, display a warning but do not abort

### Phase 5: Summary Report

Display a clear confirmation of what was created:

```
✅ Client created successfully!

📁 Client Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:    {CLIENT_NAME}
ID:      {CLIENT_ID}
Folder:  docs/clients/{CLIENT_ID}-{CLIENT_SLUG}/

📄 Files Created:
  ├── 000.README.md          — Overview and quick links
  ├── 001.client-profile.md  — Who the client is
  ├── 002.client-deliverables.md — Deliverables checklist
  ├── 003.client-context.md  — Running context log
  ├── 004.client-issues.md   — Issue tracker
  └── meetings/
      └── README.md          — Meeting notes index

🗂️  Client index updated: docs/clients/README.md

🎯 Next Steps:
1. Fill in full profile:        edit docs/clients/{ID}-{slug}/001.client-profile.md
2. Add first deliverable:       /client-update --add-issue {details}
3. Load context before working: /client-review {slug}
4. Log a meeting:               /client-update --add-meeting
```

## Input Format

**Command:**
```
/client-new {client-name}
```

**Examples:**
```
/client-new Acme Corp
/client-new "Beta Startup"
/client-new Jordan Smith Photography
/client-new          ← (will prompt interactively)
```

## Important Notes

- **Script-Backed:** All file I/O is handled by `client-new-setup.sh` — the skill only orchestrates and fills in profile details
- **Token-Efficient:** Templates live in `.ai-dev/ai-dev-scripts/templates/clients/` — the LLM does not generate file content from scratch
- **Idempotent Script:** If a folder already exists the script exits cleanly without overwriting
- **Index Auto-Updated:** `docs/clients/README.md` is updated by the script; the skill does not need to edit it manually
- **Numbering:** Client IDs are zero-padded (`001`, `002`, ...) and auto-incremented from existing folders

## Error Handling

**No client name provided:**
- Prompt via AskUserQuestion: "What is the client's name?"

**Script not found:**
- Display: "❌ Setup script not found: `.ai-dev/ai-dev-scripts/client-new-setup.sh`"
- Suggest: "Run from the project root directory, or check that `.ai-dev/` is initialized"

**Client already exists:**
- Display warning with existing folder path
- Ask user to confirm before proceeding (or exit cleanly)

**Bash script exits non-zero:**
- Show the full error output from the script
- Do not attempt to manually recreate what the script does
- Suggest running the script directly for debugging:
  ```bash
  bash .ai-dev/ai-dev-scripts/client-new-setup.sh --client-name "Acme Corp"
  ```

**docs/clients/ missing:**
- The script creates it automatically — this should not be an issue
- If it still fails, check project root and docs/ directory structure

## Success Criteria

1. ✅ Client name parsed and validated
2. ✅ Duplicate check performed
3. ✅ `client-new-setup.sh` executed successfully (exit 0)
4. ✅ `docs/clients/{ID}-{slug}/` folder created with 6 files
5. ✅ `docs/clients/README.md` updated with new client row
6. ✅ Key profile fields filled in (or left as template placeholders if skipped)
7. ✅ User receives summary report with next-step commands
