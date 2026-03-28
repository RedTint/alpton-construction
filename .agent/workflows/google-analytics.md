---
description: Plan and implement Google Analytics 4 integration with event tracking strategy, privacy compliance, and comprehensive testing
---

1. Parse Input and Detect Operation Mode
   Check for mode flags in command arguments:
   - `--plan`: Create analytics plan with event tracking strategy
   - `--implement`: Generate tracking code based on analytics plan

   If multiple flags present, display error
   If no flag present, default to `--plan` mode

   For implement mode, verify analytics plan exists at docs/301-google-analytics-v*.md

2. MODE 1: Plan - Read Documentation Context
   // Only execute if --plan mode

   Find and read latest versions of:
   - docs/002-prd-v*.md (Product requirements and features)
   - docs/100-userflows-v*.md (User flows and journeys)
   - docs/200-atomic-stories-v*.md (User acceptance criteria)
   - docs/300-frontend-v*.md (Frontend architecture)
   - docs/350-api-contract-v*.md (API endpoints for server-side tracking)

   Extract key information:
   - Product features, business goals, KPIs
   - User journeys, conversion points, page transitions
   - Feature completion status
   - Frontend framework (React/Vue/Next.js)
   - Backend endpoints and authentication

3. MODE 1: Plan - Identify Conversion Funnels
   // Only execute if --plan mode

   Analyze user journeys and map to 2-5 key conversion funnels
   Examples:
   - Sign-up Funnel: Landing → Sign-up Form → Email Verification → Onboarding
   - Purchase Funnel: Product Browse → Add to Cart → Checkout → Payment → Confirmation
   - Feature Adoption: Dashboard → Feature Discovery → Usage → Repeat Usage

   For each funnel, define:
   - Entry point (first interaction)
   - Intermediate steps
   - Success criteria (conversion)
   - Drop-off points (potential abandonment)

   Prioritize funnels by business importance (revenue, engagement, adoption)

4. MODE 1: Plan - Map Analytics Events
   // Only execute if --plan mode

   Define Page View Events:
   - List all pages/routes needing tracking
   - Include dynamic routes (e.g., /product/:id)
   - Specify metadata: page title, category, user context, custom dimensions

   Define Interaction Events:
   - Clicks: Buttons, links, CTAs
   - Form Events: Start, field interactions, validation errors, submission
   - Scrolling: Depth tracking (25%, 50%, 75%, 100%)
   - Engagement: Time on page, video plays, downloads
   - Search: Search queries, filters, result clicks
   - Navigation: Menu interactions, tab switches

   Define Conversion Events:
   - sign_up (User registration)
   - purchase (E-commerce transaction)
   - subscribe (Newsletter/subscription)
   - download (File/resource download)
   - contact (Contact form submission)
   - E-commerce: view_item, add_to_cart, begin_checkout, purchase

   Define Custom Events (product-specific):
   - feature_activated, project_created, team_invited, export_completed
   - Include parameters: category, label, value, custom dimensions

5. MODE 1: Plan - Define Key Metrics and KPIs
   // Only execute if --plan mode

   Primary Metrics:
   - Acquisition: Sessions, users, traffic sources
   - Engagement: Session duration, pages per session, bounce rate
   - Conversion: Conversion rate per funnel, goal completions
   - Retention: Return user rate, cohort analysis
   - Revenue: Transactions, average order value (if e-commerce)

   Secondary Metrics:
   - Feature-specific metrics
   - User behavior indicators
   - Performance indicators

   Custom Dimensions:
   - User properties: user type (free/premium/enterprise), account age, feature flags
   - Content properties: category, author, publication date
   - Technical properties: environment (prod/staging), A/B test variants

6. MODE 1: Plan - Create GA4 Configuration Plan
   // Only execute if --plan mode

   GA4 Property Setup:
   - Property name and configuration
   - Data streams (web, iOS, Android)
   - Data retention settings
   - User ID tracking (if authenticated)

   Event Tracking Configuration:
   - Enhanced measurement: page views, scrolls, outbound clicks, site search, video, downloads
   - Custom event configuration
   - E-commerce tracking (if applicable)

   Conversion Goals:
   - Mark events as conversions: sign_up, purchase, subscribe

7. MODE 1: Plan - Document Privacy and Compliance
   // Only execute if --plan mode

   GDPR/CCPA Compliance:
   - Cookie consent requirements
   - Data anonymization settings
   - IP anonymization (enabled by default in GA4)
   - User opt-out mechanism
   - Data retention policies

   Privacy Settings:
   - User data collection settings
   - Advertising features (enable/disable)
   - Data sharing settings
   - Cookie domain configuration

   Legal Requirements:
   - Privacy policy updates needed
   - Cookie banner requirements
   - Consent management platform (CMP) integration
   - User rights (data access, deletion)

8. MODE 1: Plan - Create Analytics Provider Comparison
   // Only execute if --plan mode

   Compare platforms:
   - Google Analytics 4 (GA4): Free, comprehensive, AI insights, Google Ads integration
   - Mixpanel: Advanced user analytics, cohort analysis, A/B testing
   - Amplitude: Product analytics focus, behavioral cohorts
   - Plausible/Fathom: Privacy-focused, simple, lightweight

   Recommendation: GA4 for v1.3.0 (free, comprehensive, widely supported)
   Future consideration: Add Mixpanel/Amplitude for advanced product analytics

9. MODE 1: Plan - Generate Testing and Validation Checklist
   // Only execute if --plan mode

   Development Testing:
   - Verify GA4 script loads correctly
   - Check page_view events fire on navigation
   - Test all custom events with parameters
   - Validate e-commerce events (if applicable)
   - Test user ID tracking (if implemented)
   - Verify cookie consent integration

   GA4 DebugView Testing:
   - Enable debug mode in development
   - Verify events appear in DebugView
   - Check event parameters are correct
   - Validate user properties

   Production Validation:
   - Verify tracking in Real-Time reports
   - Check event counts match expectations
   - Monitor conversion tracking
   - Validate data flow for 24-48 hours

   Privacy Validation:
   - Verify cookie consent blocks tracking until accepted
   - Test opt-out functionality
   - Confirm IP anonymization
   - Check data retention settings

10. MODE 1: Plan - Write Analytics Plan Document
    // Only execute if --plan mode

    Find latest version of analytics plan (if exists)
    Increment version or create v1.0.0

    Write to: docs/301-google-analytics-v{version}.md

    Include sections:
    - Overview: Purpose, goals, analytics platform
    - Conversion Funnels: 2-5 key funnels with steps
    - Event Tracking Plan: All events with parameters (markdown table)
    - Key Metrics and KPIs: Primary and secondary metrics
    - GA4 Configuration: Property setup, data streams
    - Custom Dimensions: User and content properties
    - Privacy and Compliance: GDPR/CCPA requirements
    - Analytics Provider Comparison: GA4 vs alternatives
    - Testing Checklist: Validation steps
    - Implementation Notes: Frontend framework-specific guidance

    Validate document:
    - Check all sections present
    - Ensure event tracking table is complete
    - Verify markdown formatting

11. MODE 2: Implement - Read Analytics Plan
    // Only execute if --implement mode

    Find analytics plan document: docs/301-google-analytics-v*.md
    Get latest version
    If not found, display error and suggest running --plan first

    Parse analytics plan:
    - Extract all events from tracking table
    - Extract event parameters and configuration
    - Extract privacy settings

    Read frontend architecture: docs/300-frontend-v*.md
    Extract framework and routing details

12. MODE 2: Implement - Generate Analytics Files
    // Only execute if --implement mode

    Create Configuration:
    Write to: frontend/src/lib/analytics/config.ts
    Include: GA4 measurement ID, environment detection, privacy settings

    Create Core Functions:
    Write to: frontend/src/lib/analytics/gtag.ts
    Include: GA4 initialization, event tracking functions, pageview tracking

    Create React Hook:
    Write to: frontend/src/hooks/useAnalytics.ts
    Include: usePageView, useTrackEvent hooks with TypeScript types

    Create GA4 Component:
    Write to: frontend/src/components/GoogleAnalytics.tsx
    Include: Script loading, consent management, debug mode

    Update .env.example:
    Add: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

13. MODE 2: Implement - Generate Tests
    // Only execute if --implement mode

    Generate 15+ Unit Tests:
    - config.test.ts: Environment detection, config validation
    - gtag.test.ts: Event tracking, pageview tracking, initialization
    - useAnalytics.test.ts: Hook behavior, event firing

    Generate 12+ E2E Tests:
    - analytics.e2e.ts: Script loading, pageview events, custom events, consent flow

    Total: 27+ comprehensive tests
    Files created in:
    - frontend/src/lib/analytics/__tests__/
    - frontend/e2e/analytics/

14. MODE 2: Implement - Generate Summary
    // Only execute if --implement mode

    Display comprehensive implementation summary:
    - Files created (5 implementation + test files)
    - Tests generated (15 unit + 12 E2E = 27 total)
    - Environment variable to set (GA_MEASUREMENT_ID)
    - Next steps:
      1. Add GA4 property in Google Analytics
      2. Copy measurement ID to .env
      3. Import GoogleAnalytics component in app layout
      4. Run tests: npm test analytics
      5. Test with GA4 DebugView in development
      6. Deploy and validate in production

    Privacy compliance reminder:
    - Update privacy policy
    - Add cookie consent banner
    - Test opt-out functionality

15. Display Completion Message
    Show appropriate completion message based on mode:

    If --plan mode:
    ✅ Analytics plan created at docs/301-google-analytics-v{version}.md
    Next: Review plan, then run /google-analytics --implement

    If --implement mode:
    ✅ Analytics implementation complete!
    Files created: 5 implementation files + 27 tests
    Next: Configure GA4 property and test implementation
