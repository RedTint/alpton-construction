---
client_id: "{{CLIENT_ID}}"
client_name: "{{CLIENT_NAME}}"
total_meetings: 0
open_action_items: 0
updated_at: "{{DATE}}"
---

# Meetings Index: {{CLIENT_NAME}}

**Client:** {{CLIENT_NAME}}
**Last Updated:** {{DATE}}
**Total Meetings:** 0

---

## Meeting Notes

*(No meetings yet — use `/client-update --add-meeting` to create the first one)*

| # | Date | Description | Action Items |
|---|------|-------------|--------------|
| — | — | — | — |

---

## How to Add a Meeting

```bash
/client-update --add-meeting
```

This creates a new meeting note under this folder using the standard meeting template.
