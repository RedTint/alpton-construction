---
description: Generate high-converting landing pages with proven frameworks (Alex Hormozi, StoryBrand, Feature Showcase, Hybrid) based on project documentation
---

// Note: This is a condensed version of the Claude Code skill
// Original skill: 744 lines with extensive detail on 4 landing page frameworks
// For full automation with framework selection, use Claude Code's /create-landing-page command

1. Parse Landing Page Configuration
   Extract command options:
   - --product: Product showcase landing page
   - --saas: SaaS signup/trial landing page
   - --waitlist: Coming soon / waitlist capture
   - --lead-magnet: Lead generation offer
   - --event: Event registration
   - --path [path]: Specify deployment location
   - --standalone: Create standalone HTML file

   Default: Infer from PRD or use general product page

2. Read Project Documentation
   Find and read latest versions:
   ```bash
   # Find files
   ls docs/002-prd-v*.md | sort -V | tail -1
   ls docs/200-atomic-stories-v*.md | sort -V | tail -1
   ls docs/100-userflows-v*.md | sort -V | tail -1
   ls docs/125-design-system-v*.md | sort -V | tail -1
   ls docs/progress/000-progress-v*.md | sort -V | tail -1
   ```

   Extract from documentation:
   - Project name and tagline
   - Target audience and personas
   - Core features (3-5 key features)
   - Unique value proposition (UVP)
   - Pain points solved
   - Brand colors, typography (from design system)

3. Choose Landing Page Framework
   // Original: Uses AskUserQuestion with 4 framework options
   // Antigravity: Manually select framework

   **Framework Options:**

   A. **Alex Hormozi Value Ladder** (High-converting offers)
   - Structure: Bold outcome promise → Pain amplification → Value stack ($$ value) → Guarantee → Urgency → Strong CTA
   - Best for: SaaS products, paid tools, premium offerings
   - Example headline: "Get X Without Y in Z Days"

   B. **StoryBrand Framework** (Story-driven)
   - Structure: Customer problem → Guide (your product) → Plan (3 steps) → Call to action → Success/Failure outcomes
   - Best for: Complex products, B2B SaaS, transformation stories
   - Example headline: "You Deserve X, But Struggle With Y"

   C. **Feature Showcase** (Product-led)
   - Structure: Clear value prop → Hero screenshot → 3-6 feature grid → Benefits → Social proof → CTA
   - Best for: Developer tools, technical products, feature-rich platforms
   - Example headline: "The API Platform Developers Love"

   D. **Conversion-Optimized Hybrid** (Recommended - Balanced)
   - Structure: Hero → Social proof → Problem/Solution → Features → How it works → Pricing → FAQ → Final CTA
   - Best for: Most products, combines all best practices
   - Combines emotion (Hormozi/StoryBrand) with logic (Feature Showcase)

   **Manual Decision:** Choose A, B, C, or D based on your product type

4. Choose Tech Stack
   // Original: Uses AskUserQuestion for tech stack selection
   // Antigravity: Manually select tech stack

   **Tech Stack Options:**
   - Plain HTML/CSS/JS (Recommended for simplicity - standalone, no dependencies)
   - React Component (Integrate with existing React app)
   - Next.js Page (SEO-optimized Next.js page component)
   - Tailwind CSS (Use Tailwind for styling)
   - Match Project Stack (Use tech from docs/150-tech-stacks-v*.md)

   **Manual Decision:** Choose tech stack that matches your project

5. Choose Optional Sections
   // Original: Uses AskUserQuestion with multiSelect
   // Antigravity: Manually select sections to include

   **Optional Sections:**
   - Testimonials (Recommended - increases trust)
   - Pricing Table (Show pricing tiers)
   - FAQ Section (Recommended - addresses objections)
   - Demo Video (30-80% conversion lift)
   - Trust Badges (Security, compliance, certifications)
   - Founder's Note (Personal message)

   **Manual Decision:** List sections you want to include

6. Create Landing Page Directory
   // turbo
   mkdir -p landing

7. Map Features to Benefits
   From atomic stories and PRD:
   - Extract 3-6 key features
   - Convert feature to benefit statement:
     * Feature: "Real-time collaboration"
     * Benefit: "Work together instantly, no refresh needed"

8. Generate Landing Page Copy (Based on Framework)
   Create content for selected framework:

   **For Alex Hormozi Style:**
   - Headline: Bold outcome promise
   - Subheadline: Amplify pain point
   - Value Stack: List features as $$ values
   - Guarantee: Risk reversal (30-day refund, cancel anytime)
   - Urgency: Limited time / scarcity
   - CTA: Action with benefit

   **For StoryBrand:**
   - Hero: "You deserve X, but struggle with Y"
   - Guide: "We understand because [empathy]"
   - Plan: 3-step process
   - Success: "Imagine if [transformation]"
   - CTA: "Start Your Journey"

   **For Feature Showcase:**
   - Hero: Value prop + screenshot
   - Features: 3-6 features with icons
   - Benefits: Outcome-focused
   - Social proof: Logos, testimonials
   - CTA: "Get Started Free"

   **For Hybrid:**
   - Combine all elements
   - Multiple CTAs throughout
   - Balance emotion and logic

9. Generate HTML Structure
   Create semantic HTML file: landing/index.html

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>[Project Name] - [Tagline]</title>
     <meta name="description" content="[Value proposition - 155 chars]">
     <!-- Open Graph for social sharing -->
     <meta property="og:title" content="[Project Name]">
     <meta property="og:description" content="[Value prop]">
     <link rel="stylesheet" href="styles.css">
   </head>
   <body>
     <!-- Hero Section -->
     <section class="hero">
       <h1>[Headline]</h1>
       <p>[Subheadline]</p>
       <button class="cta-primary">[CTA Text]</button>
     </section>

     <!-- Social Proof -->
     <section class="social-proof">
       <p>Trusted by [X] users</p>
       <!-- Company logos -->
     </section>

     <!-- Features/Benefits -->
     <section class="features">
       <div class="feature">
         <h3>[Feature 1]</h3>
         <p>[Benefit description]</p>
       </div>
       <!-- Repeat for 3-6 features -->
     </section>

     <!-- How It Works -->
     <section class="how-it-works">
       <h2>How It Works</h2>
       <ol>
         <li>Sign up / Start</li>
         <li>[Core action]</li>
         <li>Get results</li>
       </ol>
     </section>

     <!-- Optional: Testimonials, Pricing, FAQ -->

     <!-- Final CTA -->
     <section class="final-cta">
       <h2>[Restate benefit]</h2>
       <button class="cta-primary">[CTA with urgency]</button>
     </section>
   </body>
   </html>
   ```

10. Generate CSS Styles
    Create landing/styles.css with responsive design

    Use colors from design system or defaults:
    - Primary: #3B82F6 (blue)
    - Secondary: #10B981 (green)
    - Neutral: Grayscale palette

    Mobile-first responsive:
    - Breakpoints: 640px, 768px, 1024px
    - CSS Grid for layout
    - Flexbox for components

11. Generate JavaScript (if needed)
    Create landing/script.js for interactivity:
    - Smooth scroll to sections
    - CTA button tracking
    - Form validation (if forms included)
    - Mobile menu toggle

12. Mark Placeholder Content
    Add markers for content that needs replacement:
    - [YOUR_LOGO_HERE]
    - [PRODUCT_SCREENSHOT]
    - [CUSTOMER_TESTIMONIAL]
    - [COMPANY_LOGOS]

    Add HTML comments:
    ```html
    <!-- Replace with actual product screenshot -->
    <!-- Add real customer testimonials -->
    ```

13. Create Landing Page README
    Generate landing/README.md with:
    - Overview and purpose
    - Customization guide (copy, images, colors)
    - Deployment instructions
    - A/B testing recommendations
    - Conversion optimization checklist:
      - [ ] Add real screenshots
      - [ ] Collect testimonials
      - [ ] Set up analytics tracking
      - [ ] Configure CTA links
      - [ ] Test on mobile
      - [ ] Check page load speed
      - [ ] Add SEO meta tags

14. Create Content Guide
    Generate landing/CONTENT_GUIDE.md with:
    - Copywriting tips for chosen framework
    - Headline formulas
    - Benefits vs Features table
    - How to collect testimonials
    - CTA action phrases
    - A/B test variations

15. Display Creation Summary
    Show comprehensive summary:
    - Framework used
    - Tech stack
    - Sections included
    - Files created
    - Next steps:
      1. Preview: open landing/index.html
      2. Replace placeholder content
      3. Customize copy
      4. Set up analytics
      5. Deploy to production

    **Optimization Tips:**
    - Test different headlines (A/B test)
    - Add video demo (30-80% lift)
    - Collect testimonials ASAP
    - Monitor scroll depth
    - Page load < 3s is critical

16. Optional: Commit to Git
    // Original: Uses AskUserQuestion
    // Antigravity: Decide manually

    If committing:
    ```bash
    git add landing/
    git commit -m "feat: create landing page ([framework style])

- Framework: [Alex Hormozi / StoryBrand / Feature Showcase / Hybrid]
- Tech stack: [HTML/React/Next.js]
- Sections: [list sections]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
    ```

// IMPORTANT LIMITATIONS:
// 1. Framework selection is manual (no interactive AskUserQuestion)
// 2. Tech stack selection is manual
// 3. Section selection is manual
// 4. Content generation requires following framework guidelines
// 5. For full automation, use Claude Code's /create-landing-page command

// CONVERSION NOTES:
// - Original: 744 lines, 28,104 characters
// - Antigravity: Condensed to fit 12,000 char limit
// - Removed: Detailed framework explanations, extensive examples
// - Kept: Essential workflow steps, framework options, key guidance
