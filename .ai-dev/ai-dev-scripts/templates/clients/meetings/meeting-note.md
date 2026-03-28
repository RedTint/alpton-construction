---
client_id: "{{CLIENT_ID}}"
client_name: "{{CLIENT_NAME}}"
meeting_num: "{{MEETING_NUM}}"
meeting_type: "{{MEETING_TYPE}}"
type_code: "{{TYPE_CODE}}"
datetime: "{{YYYYMMDD-HHii}}"
duration_minutes: {{DURATION}}
attendees: []
absent: []
open_action_items: 0
completed_action_items: 0
decisions_count: 0
created_at: "{{YYYYMMDD-HHii}}"
updated_at: "{{YYYYMMDD-HHii}}"
---

# {{MEETING_TITLE}}

- **Date:** {{YYYYMMDD-HHii}}
- **Type:** {{MEETING_TYPE}} ({{TYPE_CODE}})
- **Client:** {{CLIENT_NAME}}
- **Attendees:** {{ATTENDEES}}
- **Duration:** {{DURATION}} minutes
- **Absent:** {{ABSENT}}

---

## ACTION ITEMS

1. **{Action description}** — Assignee: {name}, Due: {YYYY-MM-DD}, Status: Open

---

## DECISIONS

1. **{Decision title}**
   - Rationale: {Why this decision was made}
   - Impact: {What this affects}
   - Alternatives Considered: {What else was considered}

---

## DISCUSSION POINTS

### {Topic 1}

{Discussion summary}

---

## NEXT STEPS

- {Next step 1}
- {Next step 2}

---

## NOTES

- {Additional context or follow-up items}
