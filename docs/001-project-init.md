# Project Initial Brainstorm

**Date:** 2026-03-28
**Project:** Alpton Construction Website & Admin Portal

## Project Vision

To create a professional, high-converting website for Alpton Construction that showcases their portfolio, details their services, and acts as a lead generation engine through a qualified "BUILD NOW, PAY LATER" inquiry system.

## Target Users

1. **Potential Clients:** Homeowners or businesses looking for construction services, specifically those interested in financing options (BUILD NOW, PAY LATER).
2. **Internal Admins:** Staff members who will review inquiries, qualify leads, and manage the portfolio.

## Key Features (Brain Dump)

- **Single Page Application (SPA) Landing Page:** Fast, modern, elegant frontend for public users.
- **Portfolio Section:** A gallery/list of active and completed projects. Crucially, all pictures must have watermarks applied. 
- **Services Section:** Detailed breakdown of construction services offered.
- **Company Profile:** Information about Alpton Construction's history, mission, and team.
- **Inquiry System (Leads):** A progressive flow/questionnaire to qualify users for the "BUILD NOW, PAY LATER" process. 
- **Admin System:** A secure backend portal to review all user answers from the inquiry system and manage/track leads.

## Technical Considerations

- SPA frontend framework (e.g., Next.js, React, or Vite) for premium interactivity.
- Backend database and API to securely store inquiry responses and serve the admin portal.
- Image processing node/pipeline to automatically apply watermarks to portfolio pictures upon upload by admins.
- Authentication/Authorization system for the Admin Portal.

## Success Metrics

- High completion rate of the "BUILD NOW, PAY LATER" inquiry questionnaire.
- Increased number of qualified leads efficiently tracked by admins.
- Fast page load speeds and flawless responsiveness across devices.

## Questions & Unknowns

- What exact questions/steps are needed for the "BUILD NOW, PAY LATER" pre-qualification?
- What are the branding guidelines (colors, typography, logo) for Alpton Construction?
- What specific stats or details need to be shown on the portfolio projects (e.g., budget, duration, location)?

## Next Steps

1. Run `/define @002-prd-v1.0.0.md` to formalize requirements
2. Run `/define @150-tech-stacks-v1.0.0.md` to decide tech stack
3. Run `/define @200-atomic-stories-v1.0.0.md` to break features into stories
