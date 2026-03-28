# Background Workers v1.0.0

**Project:** {{PROJECT_NAME}}
**Version:** v1.0.0
**Date:** 2026-03-28

> Use `/define @450-workers-v1.0.0.md` to elaborate if the project requires background jobs.
> Delete this file if no background processing is needed.

## Worker Overview

| Job | Schedule / Trigger | Priority | Description |
|-----|-------------------|----------|-------------|
| [Job name] | [Cron / Event-driven] | High | |

## Job Definitions

### Job 1: [Name]

- **Trigger:** [Cron: `0 * * * *` / Event: `user.created`]
- **Frequency:** [Every hour / On event]
- **Timeout:** [30s / 5m]
- **Retries:** [3 with exponential backoff]
- **Description:** [What this job does]

**Steps:**
1. [Step 1]
2. [Step 2]

**On failure:**
- Retry up to 3 times
- Alert on final failure
- Log to dead-letter queue

### Job 2: [Name]

[To be defined]

## Queue Configuration

| Queue | Concurrency | Retry Policy | Notes |
|-------|-------------|--------------|-------|
| `default` | 5 | 3x exponential | |
| `critical` | 10 | 5x immediate | High priority |
| `bulk` | 2 | 1x | Long-running |

## Error Handling

- All jobs wrapped in try/catch
- Failures logged with job ID, payload, and error
- Dead-letter queue for jobs that exhaust retries
- Alert sent to on-call on critical job failures

## Monitoring

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Job success rate | > 99% | < 95% |
| Queue depth | < 100 | > 500 |
| Job duration | < [Ns] | > [2Ns] |

## Resource Requirements

| Job | CPU | Memory | Notes |
|-----|-----|--------|-------|
| [Job name] | Low | Low | |
