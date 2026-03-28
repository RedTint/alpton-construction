---
version: "1.0.0"
project_name: "{{PROJECT_NAME}}"
date_created: "{{DATE}}"
last_updated: "{{DATE}}"

# Overall Progress
overall_completion: 0
total_stories: 0
completed_stories: 0
in_progress_stories: 0
blocked_stories: 0
pending_stories: 0
cancelled_stories: 0

# Story Points
total_points: 0
completed_points: 0
in_progress_points: 0
pending_points: 0

# Version Progress
mvp_completion: 0
mvp_stories: 0
mvp_completed: 0
future_versions: []

# Category Progress
categories: []

# Velocity Metrics
velocity:
  current_sprint_points: 0
  avg_points_per_week: 0
  historical_avg_points: 0
  trend: "stable"
  last_3_sprints: [0, 0, 0]

# Timeline
timeline:
  project_start_date: "{{DATE}}"
  mvp_target_date: null
  mvp_completion_date: null
  projected_completion_date: null
  days_elapsed: 0
  estimated_days_remaining: null

# Test Coverage
test_coverage:
  overall_percentage: 0
  unit_tests_count: 0
  integration_tests_count: 0
  e2e_tests_count: 0
  target_coverage: 80

# Blockers
active_blockers_count: 0
resolved_blockers_count: 0
blockers: []

# Risk Assessment
risks:
  high: 0
  medium: 0
  low: 0

# Links
atomic_stories_file: "docs/200-atomic-stories-v1.0.0.md"
prd_file: "docs/002-prd-v1.0.0.md"
linked_docs: []

# Metadata
generated_by: "/setup"
format_version: "2.0.0"
---

# Progress Tracking v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** 1.0.0
**Date:** {{DATE}}
**Last Updated:** {{DATE}}
**Aligned With:** 200-atomic-stories-v1.0.0.md

## Progress Summary

**Overall Completion:** 0% (0 of 0 stories completed)

**By Version:**
- **MVP (v1.0.0):** 0% (0/0 stories) ⏳ Not started

## Change Log

### {{DATE}} - 🚀 Project Initialized
- 📁 **Documentation structure created** via `/setup`
- 📊 **Total:** 0 stories / 0 points

---

## Completed Work Summary

*(No stories completed yet)*

## In Progress

*(No stories in progress)*

## Pending

*(Run `/new-feature` to add stories, then `/update-progress` to track them)*

## Blockers & Issues

**Active Blockers:** None

## Velocity & Timeline

- **Project Start:** {{DATE}}
- **Current Sprint Points:** 0
- **Velocity:** Not yet established

## Next Steps

### Immediate Actions (This Sprint)

1. **Define your project:**
   - Fill out `docs/001-project-init.md`
   - Run `/define @002-prd-v1.0.0.md`

2. **Create your first stories:**
   - Run `/new-feature {description}` for each MVP feature
   - Review story files in `docs/epics/`

3. **Start building:**
   - Run `/build` to implement pending stories
