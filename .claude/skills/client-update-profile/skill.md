# Client Update Profile Command

Update relevant fields in a client's `001.client-profile.md` using natural language input. Intelligently determines which YAML frontmatter fields and markdown body sections to update based on what was described, then appends a Change Log entry with the date and summary.

## Execution Steps

### Phase 1: Parse Input and Identify Client

1. **Extract Client Identifier**
   - Parse command argument format: `/client-update --profile {client-identifier} {details}`
   - `{client-identifier}` can be:
     - Client slug (e.g., `acme-corp`, `rishi`)
     - Client ID (e.g., `001`, `002`)
     - Client full name (e.g., `"Acme Corp"`, `Rishi`)
   - `{details}` is natural language describing what to update (e.g., "website is https://acme.com, tech stack is React and Node.js")
   - If only one argument is provided (no identifier prefix), infer that the details are the only argument and ask for the client

2. **Locate Client Folder**
   - Use Glob: `docs/clients/*/001.client-profile.md`
   - Match against `{client-identifier}`:
     - If numeric ID: match folder prefix (e.g., `001-*`)
     - If slug or name: fuzzy match against folder name (case-insensitive, ignore hyphens/spaces)
   - If no match found:
     - List all available clients from `docs/clients/README.md`
     - Use AskUserQuestion: "Which client would you like to update?" with options from the list
   - If multiple ambiguous matches: use AskUserQuestion to clarify

3. **Validate Profile File**
   - Verify `{client-folder}/001.client-profile.md` exists
   - If missing: display error and suggest running `/client-new {name}` first

### Phase 2: Read Current Profile

1. **Read Full Profile File**
   - Use Read tool to load `{client-folder}/001.client-profile.md`
   - Parse YAML frontmatter fields:
     - `client_id`, `client_name`, `status`, `industry`, `website`
     - `engagement_type`, `started`, `timeline_start`, `timeline_end`
     - `primary_contact`, `technical_lead`, `billing_contact`, `updated_at`
   - Parse markdown body sections:
     - **Contact Information** table (Primary Contact, Technical Lead, Billing Contact rows)
     - **About the Client** — free text paragraphs
     - **Engagement Summary** — Type, Scope, Budget, Timeline fields
     - **Technical Context** — Tech Stack, Constraints, Integrations fields
     - **Goals & Success Criteria** — numbered list
     - **Key Notes** — bulleted list
     - **Change Log** — table with Date, Change, Updated By columns

2. **Store Current State**
   - Keep record of all current field values for comparison
   - This determines what changed for the Change Log entry

### Phase 3: Interpret Natural Language Details

Analyze `{details}` to determine which fields to update. Map keywords and context to specific fields:

**YAML Frontmatter Fields:**
| Keyword / Pattern | Maps to Frontmatter Field |
|-------------------|--------------------------|
| "industry is X", "they work in X", "sector: X" | `industry` |
| "website is X", "site: X", "url: X" | `website` |
| "engagement type is X", "type of work is X", "retainer/project/consulting" | `engagement_type` |
| "started X", "start date X", "timeline starts X" | `timeline_start` |
| "ends X", "project ends X", "deadline X", "timeline ends X" | `timeline_end` |
| "primary contact is X", "main contact X" | `primary_contact` |
| "technical lead is X", "tech lead X" | `technical_lead` |
| "billing contact is X", "invoice to X" | `billing_contact` |
| "status is X", "project status X" | `status` |

**Markdown Body Sections:**
| Keyword / Pattern | Maps to Body Section |
|-------------------|---------------------|
| "tech stack is X", "they use X", "built on X" | Technical Context > Tech Stack |
| "constraints: X", "limitation: X", "requirement: X" | Technical Context > Constraints |
| "integrations: X", "connects to X", "integrates with X" | Technical Context > Integrations |
| "scope is X", "we are doing X", "project scope" | Engagement Summary > Scope |
| "budget is X", "budget range X" | Engagement Summary > Budget |
| "timeline is X-Y" (when both dates mentioned) | Engagement Summary > Timeline |
| "about X", "description: X", "who they are: X" | About the Client |
| "goal: X", "success criteria: X", "they want X" | Goals & Success Criteria |
| "note: X", "important: X", "remember: X" | Key Notes |
| contact details (name/email/phone for a role) | Contact Information table |

**Multi-field detection:**
- A single details string may update multiple fields simultaneously
- Example: "website is acme.com, tech stack is React and Node.js, primary contact is Jane Doe jane@acme.com"
  - Updates: `website` frontmatter, Tech Stack body, Contact Information table row

**Ambiguity handling:**
- If a field value is unclear, make a reasonable inference and note it in the Change Log
- For contact information that includes email/phone: parse into separate table cells

### Phase 4: Apply Updates

1. **Update YAML Frontmatter**
   - For each frontmatter field identified in Phase 3:
     - Use Edit tool to replace the current value with the new value
     - Preserve quoted string format: `field: "new value"` for strings, `field: null` for nulls
   - Always update `updated_at` to today's date in `YYYY-MM-DD` format
   - Example edit for industry:
     ```
     Old: industry: null
     New: industry: "SaaS / FinTech"
     ```

2. **Update Markdown Body — Header Block**
   - If `industry` changed: update `**Industry:** {value}` line in header
   - If `website` changed: update `**Website:** {value}` line in header
   - If `status` changed: update `**Status:** {value}` line in header

3. **Update Contact Information Table**
   - If primary/technical/billing contact info provided:
     - Find the matching row in the Contact Information table
     - Update Name, Email, and/or Phone columns as provided
     - Use Edit tool to replace the specific table row

4. **Update About the Client**
   - If new description or additional about text provided:
     - If existing text is a placeholder (`{2-3 paragraph description...}`): replace entirely with the new text
     - If existing text has real content: append new paragraph or use Edit to replace section

5. **Update Engagement Summary**
   - If engagement type changed: update `**Type:** {value}` line
   - If scope provided: update `**Scope:** {value}` line
   - If budget provided: update `**Budget:** {value}` line
   - If timeline provided: update `**Timeline:** {value}` line

6. **Update Technical Context**
   - If tech stack provided: update `**Tech Stack:** {value}` line
   - If constraints provided: update `**Constraints:** {value}` line
   - If integrations provided: update `**Integrations:** {value}` line

7. **Update Goals & Success Criteria**
   - If goals provided:
     - If existing goals are placeholders (`{Goal 1}` etc.): replace numbered list
     - If existing goals are real: append new goals or replace (infer from context)

8. **Update Key Notes**
   - If notes provided:
     - If existing notes are a placeholder: replace with new bullet
     - If existing notes are real: append new bullet point(s) to existing list

9. **Append Change Log Entry**
   - Get today's date in `YYYY-MM-DD` format via Bash: `date +"%Y-%m-%d"`
   - Build a concise change summary listing updated fields (e.g., "Updated website, tech stack, primary contact")
   - Use Edit tool to insert a new row at the TOP of the Change Log table (after the header row):
     ```markdown
     | {YYYY-MM-DD} | {Change summary} | /client-update --profile |
     ```
   - Preserve all existing rows below

### Phase 5: Refresh Epic Stats

1. **Run Aggregation Script**
   - Execute:
     ```bash
     node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --epic=008
     ```
   - If script exits non-zero: display warning but do not abort (profile was already updated)

### Phase 6: Display Summary Report

```
✅ Client profile updated!

👤 Client:   {CLIENT_NAME} ({client-folder})
📄 File:     docs/clients/{slug}/001.client-profile.md
🕐 Updated:  {YYYY-MM-DD}

📝 Changes Applied:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{List each field updated with old → new value}

  - industry:          "{old}" → "{new}"
  - website:           null → "{new}"
  - Tech Stack:        (placeholder) → "{new}"
  - Contact (Primary): (empty) → "{Name} — {email}"

📋 Change Log Entry Added:
  | {YYYY-MM-DD} | {Change summary} | /client-update --profile |

🎯 Next Steps:
- View full profile:    edit docs/clients/{slug}/001.client-profile.md
- Review client docs:   /client-review {slug}
- Add deliverable:      /client-update --add-issue {details}
- Log a meeting:        /client-update --add-meeting
```

## Input Format

**Command:**
```
/client-update --profile {client-identifier} {natural language details}
```

**Examples:**
```
/client-update --profile rishi website is https://rishi.dev, industry is AI Infrastructure

/client-update --profile acme-corp tech stack is React, Node.js, PostgreSQL. Primary contact is Jane Doe, jane@acme.com, +1-555-0100

/client-update --profile 001 engagement type is Retainer, timeline is 2026-04-01 to 2026-09-30, budget is $5,000/month

/client-update --profile "Beta Startup" goals are: 1. Launch MVP by Q2 2026, 2. Reach 1000 users in 3 months, 3. Achieve product-market fit

/client-update --profile acme about: Acme Corp is a series-B SaaS company building enterprise workflow automation tools. They serve Fortune 500 clients across manufacturing and logistics.

/client-update --profile 002 notes: Prefers async Slack communication. All decisions need sign-off from CTO before proceeding.
```

## Important Notes

- **Natural Language First:** The skill interprets intent — users don't need to know field names
- **Non-Destructive by Default:** Existing real content is preserved unless the new value clearly replaces it
- **Placeholder Detection:** Template placeholder text (e.g., `{Goal 1}`, `{URL or N/A}`) is treated as empty and replaced directly without asking
- **Multi-field Support:** A single invocation can update multiple sections simultaneously
- **Change Log Always Updated:** Every successful invocation appends a row — even partial updates
- **No Script Required:** Updates are context-dependent natural language → Edit tool is the right approach; no shell script needed
- **Contact Parsing:** When contact info is provided as "Name, email, phone", parse into separate table columns
- **Date Normalization:** Accept natural date formats ("April 1, 2026", "Q2 2026", "next month") and store as `YYYY-MM-DD` or descriptive string as appropriate
- **Relative Client Resolution:** If the user is already in the context of a client (e.g., after `/client-review`), default to that client if no identifier is given

## Error Handling

**No client identifier provided:**
- List all clients from `docs/clients/README.md`
- Use AskUserQuestion: "Which client would you like to update?"

**Client not found:**
- Display: "No client matching '{identifier}' found"
- Show available clients with slugs and IDs
- Suggest: `/client-new {name}` if this is a new client

**No details provided (empty {details}):**
- Display error: "Please describe what you'd like to update"
- Examples: `website is acme.com`, `tech stack is React`, `primary contact is Jane Doe`

**Profile file missing:**
- Display: "Profile file not found: docs/clients/{slug}/001.client-profile.md"
- Suggest: `/client-new {name}` to scaffold the client folder

**Ambiguous update intent:**
- Make a best-effort interpretation
- Note the interpretation in the Change Log entry
- Display what was inferred in the summary so the user can verify

**Aggregate script fails:**
- Display warning: "⚠️ Could not refresh Epic 008 stats (aggregate-epics.js returned error)"
- Profile update is still considered successful

## Success Criteria

1. ✅ Client identified from slug, ID, or full name
2. ✅ `001.client-profile.md` read in full (frontmatter + body)
3. ✅ Natural language details parsed into specific field updates
4. ✅ YAML frontmatter updated for all matching fields
5. ✅ `updated_at` frontmatter field updated to today's date
6. ✅ Markdown body sections updated for all matching content
7. ✅ Placeholder text replaced when new value is provided
8. ✅ Change Log table row prepended with date and change summary
9. ✅ Header block (Industry, Website, Status) kept in sync with frontmatter
10. ✅ Epic 008 stats refreshed via `aggregate-epics.js --update --epic=008`
11. ✅ Summary report displayed with before/after for each changed field
