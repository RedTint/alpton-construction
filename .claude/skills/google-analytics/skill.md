# Google Analytics Command

Comprehensive Google Analytics integration tool for planning analytics implementation and generating tracking code with GA4 configuration, event tracking, and privacy compliance.

## Execution Steps

### Phase 1: Parse Input and Detect Operation Mode

1. **Detect Operation Mode**
   - Check for mode flags in command arguments:
     - `--plan`: Create analytics plan with event tracking strategy
     - `--implement`: Generate tracking code based on analytics plan
   - Flags are mutually exclusive - only one mode per command
   - If multiple flags present, display error
   - If no flag present, default to `--plan` mode

2. **Extract Additional Parameters**
   - For `--plan` mode:
     - No additional parameters required
     - Will read existing documentation for context
   - For `--implement` mode:
     - Optional: Specify analytics plan file
     - Default: Use latest `301-google-analytics-v*.md`

3. **Validate Input**
   - Ensure exactly one operation mode flag
   - For implement mode, verify analytics plan exists
   - Display error for invalid combinations

---

## MODE 1: Plan (`--plan`)

Create comprehensive Google Analytics implementation plan with event tracking strategy.

### Phase 2P: Read Documentation Context

1. **Find and Read Latest Documentation**
   - Use Glob to find latest versions:
     - `docs/002-prd-v*.md` - Product requirements and features
     - `docs/100-userflows-v*.md` - User flows and journeys
     - `docs/200-atomic-stories-v*.md` - User acceptance criteria
     - `docs/300-frontend-v*.md` - Frontend architecture
     - `docs/350-api-contract-v*.md` - API endpoints (for server-side tracking)
   - Read each document to extract context

2. **Extract Key Information**
   - **From PRD:**
     - Product features and capabilities
     - Business goals and success metrics
     - User personas
     - Key performance indicators (KPIs)

   - **From User Flows:**
     - User journeys and paths
     - Critical conversion points
     - Page transitions and navigation
     - Form submissions and interactions

   - **From Atomic Stories:**
     - Feature completion status
     - User acceptance criteria
     - Implemented functionality

   - **From Frontend Architecture:**
     - Framework (React, Vue, Next.js, etc.)
     - Routing strategy (client-side, SSR, SSG)
     - State management approach
     - Component structure

   - **From API Contract:**
     - Backend endpoints (for server-side tracking)
     - User authentication methods
     - Data collection opportunities

### Phase 3P: Identify Conversion Funnels

1. **Analyze User Journeys**
   - Map user flows to conversion funnels
   - Identify 2-5 key conversion funnels
   - Examples:
     - **Sign-up Funnel**: Landing → Sign-up Form → Email Verification → Onboarding
     - **Purchase Funnel**: Product Browse → Add to Cart → Checkout → Payment → Confirmation
     - **Content Engagement**: Article List → Article View → Related Articles → Newsletter Signup
     - **Feature Adoption**: Dashboard → Feature Discovery → Feature Usage → Repeat Usage

2. **Define Funnel Steps**
   - For each funnel, identify:
     - Entry point (first interaction)
     - Intermediate steps
     - Success criteria (conversion)
     - Drop-off points (potential abandonment)

3. **Prioritize Funnels**
   - Rank funnels by business importance
   - Consider:
     - Revenue impact
     - User engagement
     - Product adoption
     - Strategic priorities

### Phase 4P: Map Analytics Events

1. **Define Page View Events**
   - List all pages/routes that need tracking
   - Include dynamic routes (e.g., `/product/:id`)
   - Specify page metadata to track:
     - Page title
     - Page category
     - User context (logged in/out)
     - Custom dimensions

2. **Define Interaction Events**
   - Map user interactions to GA4 events
   - Standard event types:
     - **Clicks**: Buttons, links, CTAs
     - **Form Events**: Start, field interactions, validation errors, submission
     - **Scrolling**: Depth tracking (25%, 50%, 75%, 100%)
     - **Engagement**: Time on page, video plays, downloads
     - **Search**: Search queries, filters, result clicks
     - **Navigation**: Menu interactions, tab switches

3. **Define Conversion Events**
   - Mark key conversion points:
     - **sign_up**: User registration
     - **purchase**: E-commerce transaction
     - **subscribe**: Newsletter/subscription
     - **download**: File/resource download
     - **contact**: Contact form submission
   - Include recommended e-commerce events:
     - `view_item`, `add_to_cart`, `begin_checkout`, `purchase`

4. **Define Custom Events**
   - Product-specific events based on PRD and user stories
   - Examples:
     - `feature_activated`
     - `project_created`
     - `team_invited`
     - `export_completed`
   - Include event parameters:
     - Event category
     - Event label
     - Event value
     - Custom dimensions

### Phase 5P: Define Key Metrics and KPIs

1. **Define Primary Metrics**
   - Based on business goals from PRD
   - Examples:
     - **Acquisition**: Sessions, users, traffic sources
     - **Engagement**: Session duration, pages per session, bounce rate
     - **Conversion**: Conversion rate per funnel, goal completions
     - **Retention**: Return user rate, cohort analysis
     - **Revenue**: Transactions, average order value (if e-commerce)

2. **Define Secondary Metrics**
   - Feature-specific metrics
   - User behavior indicators
   - Performance indicators

3. **Define Custom Dimensions**
   - User properties:
     - User type (free, premium, enterprise)
     - Account age
     - Feature flags
   - Content properties:
     - Content category
     - Author
     - Publication date
   - Technical properties:
     - Environment (production, staging)
     - A/B test variants

### Phase 6P: Create GA4 Configuration Plan

1. **Define GA4 Property Setup**
   - Property name and configuration
   - Data streams (web, iOS, Android)
   - Data retention settings
   - User ID tracking (if authenticated)

2. **Define Event Tracking Configuration**
   - Enhanced measurement settings:
     - Page views (automatic)
     - Scrolls (automatic)
     - Outbound clicks (automatic)
     - Site search (automatic)
     - Video engagement (automatic)
     - File downloads (automatic)
   - Custom event configuration
   - E-commerce tracking (if applicable)

3. **Define Conversion Goals**
   - Mark events as conversions in GA4
   - Set up conversion tracking
   - Examples:
     - `sign_up` → Key event
     - `purchase` → Key event
     - `subscribe` → Key event

### Phase 7P: Document Privacy and Compliance

1. **GDPR/CCPA Compliance**
   - Cookie consent requirements
   - Data anonymization settings
   - IP anonymization (enabled by default in GA4)
   - User opt-out mechanism
   - Data retention policies

2. **Privacy Settings**
   - User data collection settings
   - Advertising features (enable/disable)
   - Data sharing settings
   - Cookie domain configuration

3. **Legal Requirements**
   - Privacy policy updates needed
   - Cookie banner requirements
   - Consent management platform (CMP) integration
   - User rights (data access, deletion)

### Phase 8P: Create Analytics Provider Comparison

1. **Compare Analytics Platforms**
   - **Google Analytics 4 (GA4)**:
     - Pros: Free, comprehensive, AI insights, integration with Google Ads
     - Cons: Learning curve, data sampling on high traffic
     - Best for: Most web applications, e-commerce, content sites

   - **Mixpanel**:
     - Pros: Advanced user analytics, cohort analysis, A/B testing
     - Cons: Pricing can be high, complex setup
     - Best for: Product analytics, SaaS applications

   - **Amplitude**:
     - Pros: Product analytics focus, behavioral cohorts
     - Cons: Pricing, steeper learning curve
     - Best for: Product-led growth, mobile apps

   - **Plausible/Fathom**:
     - Pros: Privacy-focused, simple, lightweight
     - Cons: Limited features, paid
     - Best for: Privacy-conscious sites, simple tracking needs

2. **Recommendation**
   - Focus on GA4 for v1.3.0
   - Rationale: Free, comprehensive, widely supported
   - Future consideration: Add Mixpanel/Amplitude for advanced product analytics

### Phase 9P: Generate Testing and Validation Checklist

1. **Development Testing**
   - ✅ Verify GA4 script loads correctly
   - ✅ Check page_view events fire on navigation
   - ✅ Test all custom events with parameters
   - ✅ Validate e-commerce events (if applicable)
   - ✅ Test user ID tracking (if implemented)
   - ✅ Verify cookie consent integration

2. **GA4 DebugView Testing**
   - ✅ Enable debug mode in development
   - ✅ Verify events appear in DebugView
   - ✅ Check event parameters are correct
   - ✅ Validate user properties

3. **Production Validation**
   - ✅ Verify tracking in Real-Time reports
   - ✅ Check event counts match expectations
   - ✅ Monitor conversion tracking
   - ✅ Validate data flow for 24-48 hours

4. **Privacy Validation**
   - ✅ Verify cookie consent blocks tracking until accepted
   - ✅ Test opt-out functionality
   - ✅ Confirm IP anonymization
   - ✅ Check data retention settings

### Phase 10P: Write Analytics Plan Document

1. **Generate Document Path**
   - Find latest version of analytics plan (if exists)
   - Increment version or create v1.0.0
   - Path: `docs/301-google-analytics-v{version}.md`

2. **Write Comprehensive Analytics Plan**
   - Create document with sections:
     - **Overview**: Purpose, goals, analytics platform
     - **Conversion Funnels**: 2-5 key funnels with steps
     - **Event Tracking Plan**: All events with parameters
     - **Key Metrics and KPIs**: Primary and secondary metrics
     - **GA4 Configuration**: Property setup, data streams
     - **Custom Dimensions**: User and content properties
     - **Privacy and Compliance**: GDPR/CCPA requirements
     - **Analytics Provider Comparison**: GA4 vs alternatives
     - **Testing Checklist**: Validation steps
     - **Implementation Notes**: Frontend framework-specific guidance

3. **Include Event Tracking Table**
   - Format as markdown table with all events

4. **Validate Document**
   - Check all sections present
   - Ensure event tracking table is complete
   - Verify markdown formatting

---

## MODE 2: Implement (`--implement`)

Generate analytics tracking code based on analytics plan.

### Phase 2I: Read Analytics Plan

1. **Find Analytics Plan Document**
   - Use Glob to find: `docs/301-google-analytics-v*.md`
   - Get latest version
   - If not found, display error and suggest running `--plan` first

2. **Parse Analytics Plan**
   - Extract all events from tracking table
   - Extract event parameters and configuration
   - Extract privacy settings

3. **Read Frontend Architecture**
   - Use Glob to find: `docs/300-frontend-v*.md`
   - Extract framework and routing details

### Phase 3I: Generate Analytics Files

1. **Create Configuration** (`frontend/src/lib/analytics/config.ts`)
2. **Create Core Functions** (`frontend/src/lib/analytics/gtag.ts`)
3. **Create React Hook** (`frontend/src/hooks/useAnalytics.ts`)
4. **Create GA4 Component** (`frontend/src/components/GoogleAnalytics.tsx`)
5. **Update .env.example**

### Phase 4I: Generate Tests

1. **Generate 15+ Unit Tests**
2. **Generate 12+ E2E Tests**

### Phase 5I: Generate Summary

Display comprehensive implementation summary with next steps.

## Input Format

```
/google-analytics --plan
/google-analytics --implement
```

## Output Format

See detailed output formats in MODE 1 and MODE 2 sections above.

## Important Notes

- **GA4 Focus**: Targets Google Analytics 4 (event-based)
- **Privacy First**: GDPR/CCPA compliant
- **Test Coverage**: 27+ tests generated
- **Framework Agnostic**: Adapts to React/Vue/Next.js

## Error Handling

- **Analytics Plan Not Found**: Suggest running --plan first
- **Invalid Mode**: Display error with correct usage
- **Frontend Not Found**: Generate generic React implementation

## Success Criteria

1. ✅ Analytics plan created with all sections
2. ✅ Implementation files generated
3. ✅ Tests created (27+ total)
4. ✅ Privacy compliance included
5. ✅ Comprehensive summary provided
