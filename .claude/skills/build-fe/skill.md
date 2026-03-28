# Build Frontend Command

Build and scaffold frontend implementation based on specifications from documentation files. Reads atomic stories, filters for FE: tagged UACs, and generates components, pages, hooks, and services following the design system and architecture patterns.

## Execution Steps

### Phase 0: Epic Context Pre-load

1. **Parse Arguments**
   - Check if `--story-file {path}` argument was provided (passed by `/build` orchestrator)
   - If provided: store as `storyFilePath`; extract `epicId` from YAML frontmatter `epic_id` field
   - If not provided: skip epic context loading, proceed to Phase 1 with atomic stories as UAC source

2. **Load Epic Architectural Context** (only if `--story-file` provided)
   - Read `docs/epics/{epicId}/epic.md` for epic scope, goals, and naming conventions
   - Glob `docs/epics/{epicId}/done/*.md` → read all completed story files as established pattern reference
   - Glob `docs/epics/{epicId}/in-progress/*.md` → read sibling in-progress stories to avoid conflicts
   - Build preamble summary:
     ```
     📚 Epic Context Loaded:
     Epic: {epicId} — {epic_name}
     Completed Stories ({N}): patterns established in done/
     In-Progress Stories ({M}): sibling work to avoid duplicating
     ```

3. **Transition Story to In-Progress**
   - Read story file YAML frontmatter at `storyFilePath`
   - If `story_status` is `pending`:
     - Move file from `.../pending/{filename}` to `.../in-progress/{filename}`:
       ```bash
       mv {storyFilePath} {epicDir}/in-progress/{filename}
       ```
     - Update frontmatter: `story_status: in-progress`, `updated_at: {ISO now}`
     - Run: `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}`
   - Display:
     ```
     🚧 Story {storyId} transitioned: pending → in-progress
     ```

### Phase 1: Git Branch Safety Check

1. **Check Current Git Branch**
   - Use Bash: `git rev-parse --abbrev-ref HEAD`
   - Store current branch name in variable
   - Examples: `main`, `develop`, `staging`, `feature/user-auth`

2. **Identify Protected Branches**
   - Protected branch list: `main`, `master`, `develop`, `staging`, `production`
   - Check if current branch matches any protected branch (case-insensitive)

3. **Handle Protected Branch Detection**
   - If on protected branch:
     - Display error:
       ```
       ❌ PROTECTED BRANCH DETECTED ❌

       You are currently on branch: {branch_name}

       Build skills cannot run on protected branches to prevent accidental commits.

       Please create and switch to a feature branch:

       git checkout -b feature/build-fe-{description}

       Then run the build command again.
       ```
     - Exit immediately
     - Do NOT proceed with build

4. **Verify Branch is Clean (Optional)**
   - Use Bash: `git status --porcelain`
   - If uncommitted changes exist:
     - Display warning:
       ```
       ⚠️  Uncommitted Changes Detected

       You have uncommitted changes in your working directory.
       Build may create new files that mix with existing changes.

       Consider:
       1. Commit or stash existing changes first
       2. Continue anyway (not recommended)

       Proceed with build? [y/N]
       ```
     - Use AskUserQuestion to confirm
     - If user declines, exit gracefully

5. **Display Branch Confirmation**
   - If on safe branch (non-protected):
     - Display:
       ```
       ✅ Git Branch Check Passed

       Working Branch: {branch_name}
       Protected:      No

       Proceeding with frontend build...
       ```

### Phase 2: Parse Input and Identify Pending Frontend UACs

1. **Detect Draft Documents**
   - Use Glob to find all draft documents: `docs/**/*-draft.md`
   - If draft documents exist:
     - Display warning:
       ```
       ⚠️  DRAFT DOCUMENTS DETECTED ⚠️

       The following draft documents will be EXCLUDED from build:
       - docs/002-prd-v1.3.0-draft.md
       - docs/350-api-contract-v1.1.0-draft.md

       To include drafts in build, finalize with:
       /define --finalize @{document-name-draft.md}
       ```
   - Continue with build (excluding drafts from all reads)

2. **Find Latest Atomic Stories Document**
   - If `--story-file` was provided (Phase 0): skip this step — UACs come from the story file directly
   - Otherwise: Use Glob to find all versions of atomic stories: `docs/200-atomic-stories-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Sort by version number to identify latest production version
   - Read the latest atomic stories document
   - Parse version number from filename (e.g., v1.1.0)

3. **Find Latest Progress Document**
   - If `--story-file` was provided: skip this step — story file frontmatter is the source of truth
   - Otherwise: Use Glob to find all versions of progress tracking: `docs/progress/000-progress-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Sort by version number to identify latest production version
   - Read the latest progress document
   - Verify version alignment with atomic stories
   - If versions don't match:
     - Display warning: "Progress version (v1.0.0) doesn't match atomic stories (v1.1.0)"
     - Suggest running `/update-progress` first
     - Ask user if they want to continue anyway

4. **Extract All Frontend UACs**
   - If `--story-file` was provided:
     - Read body of story file at `storyFilePath`
     - Extract all `- [ ] FE:` and `- [x] FE:` checkbox lines from `## User Acceptance Criteria` section
     - Pending UACs = lines with `- [ ] FE:`; skip `- [x] FE:` (already done)
     - Display: "Reading UACs from story file: {storyFilePath}"
   - Otherwise: Parse atomic stories document for UAC sections
     - Filter for lines starting with "- FE:" or "- ✅ FE:" or "- ⏳ FE:"
     - Extract story ID, story title, and UAC description
     - Build list of all FE: tagged UACs across all stories
   - Example output:
     ```
     Story 101 - Build Frontend Command
     - FE: Reads 125-design-system-v1.0.0.md for component specs
     - FE: Reads 350-api-contract-v1.0.0.md for API client generation
     - FE: Generates React components based on design system
     ```

5. **Identify Pending UACs**
   - If `--story-file` was provided: pending UACs = unchecked `- [ ] FE:` lines from story file body
   - Otherwise: Cross-reference with progress document to find:
     - UACs marked as ⏳ Pending
     - UACs marked as 🚧 In Progress
   - Skip UACs marked as ✅ Completed
   - Filter out UACs from cancelled or optional stories
   - Build prioritized list of pending work
   - Display count: "Found {N} pending FE: UACs across {M} stories"

6. **Validate Prerequisites**
   - Check that required documentation files exist (production versions only):
     - 125-design-system-v*.md (exclude `-draft` files)
     - 150-tech-stacks-v*.md (exclude `-draft` files)
     - 200-atomic-stories-v*.md (exclude `-draft` files)
     - 300-frontend-v*.md (exclude `-draft` files)
     - 350-api-contract-v*.md (exclude `-draft` files)
   - **Note:** Draft versions are intentionally excluded from build
   - If any production files missing:
     - Display error: "Required documentation missing: {filename}"
     - Suggest running `/setup` or `/define @{filename}` first
     - Ask user if they want to continue without missing files
   - Verify that pending UACs exist
   - If no pending UACs:
     - Display message: "No pending FE: UACs found. All frontend work is complete!"
     - Suggest running `/update-progress` to verify
     - Exit gracefully

### Phase 3: Gather Context from Documentation

1. **Read Tech Stack Document**
   - Use Glob to find latest: `docs/150-tech-stacks-v*.md`
   - Read entire document
   - Extract frontend technology decisions:
     - Framework choice (Next.js, Vite + React, etc.)
     - Styling approach (Tailwind CSS, CSS Modules, etc.)
     - State management (Context + React Query, Zustand, etc.)
     - UI component library (shadcn/ui, Radix, etc.)
     - Form handling (React Hook Form + Zod)
     - Testing tools (Vitest, Playwright)
   - Note any specific library versions or configurations
   - Store extracted context for code generation

2. **Read Design System Document**
   - Use Glob to find latest: `docs/125-design-system-v*.md`
   - Read entire document
   - Extract design specifications:
     - Typography (font families, sizes, weights)
     - Color palette (primary, secondary, semantic colors)
     - Spacing system (scale and guidelines)
     - Component inventory (buttons, forms, cards, navigation)
     - Layout patterns (grid system, breakpoints)
     - Folder structure recommendations
   - Note naming conventions and style guidelines
   - Store for component styling

3. **Check for Relevant Frontend Learnings** (Optional but Recommended)
   - Check if `docs/learnings/000-README.md` exists
   - If exists, scan for frontend-related learnings:
     - Search "Frontend" domain section
     - Search for keywords from current UACs (React, component, styling, state management)
     - Look for learnings about performance, testing, accessibility
   - Display relevant learnings:
     ```
     💡 Frontend Learnings:
     - LEARN-042: Fixed WebSocket memory leak in React useEffect
     - LEARN-035: Optimized React Context with useMemo pattern
     - LEARN-018: Tailwind CSS responsive design best practices

     Reference these learnings to avoid known issues.
     ```
   - If no learnings or README missing, skip silently
   - Continue with build regardless

4. **Read Frontend Architecture Document**
   - Read `docs/300-frontend-v1.0.0.md` (ALWAYS use latest version)
   - **CRITICAL**: This document contains evolving best practices
   - Extract architecture patterns:
     - Component types (presentation, container, HOC)
     - Composition patterns (compound components, render props)
     - State management approach (local, context, URL, server state)
     - Routing structure and lazy loading
     - Code organization and naming conventions
     - Performance optimization techniques
     - Error handling patterns
   - Store all conventions and best practices
   - **NOTE**: Re-read this document for each build to catch updates

5. **Read API Contract Document**
   - Use Glob to find latest: `docs/350-api-contract-v*.md`
   - Read entire document
   - Extract API specifications:
     - Base URLs (dev, staging, prod)
     - Authentication method (JWT, OAuth, etc.)
     - Endpoint definitions (path, method, params)
     - Request/response schemas
     - Error response formats
     - Rate limiting information
   - Build type definitions for API client
   - Store for service layer generation

6. **Read User Flows Document**
   - Use Glob to find latest: `docs/100-userflows-v*.md`
   - Read entire document
   - Extract user interaction patterns:
     - Page flows and navigation
     - User journeys and scenarios
     - Interaction patterns
     - Edge cases and error flows
   - Map flows to required components and pages
   - Store for component generation context

7. **Aggregate Context Summary**
   - Display comprehensive context summary:
     ```
     📚 Context Gathered:
     - Tech Stack: Next.js 14+ (App Router), Tailwind CSS, React Query
     - Components: 15 UI components defined in design system
     - API Endpoints: 12 endpoints documented
     - User Flows: 4 primary flows, 3 error flows
     - Architecture Patterns: Presentation/Container split, Context API
     ```

### Phase 4: Analyze Frontend Requirements

1. **Map UACs to Components**
   - For each pending FE: UAC:
     - Identify which components need to be created
     - Determine if it's a page, feature component, or common component
     - Extract UI requirements (inputs, buttons, displays)
     - Note any state management needs
     - Identify API integrations required
   - Build component dependency graph
   - Example:
     ```
     Story 101 - User Login
     - FE: Login form with email and password inputs
       → Components: LoginPage, LoginForm, Input, Button
       → API: POST /auth/login
       → State: Authentication context
     ```

2. **Determine File Structure**
   - Based on docs/300-frontend-v1.0.0.md structure:
     ```
     src/
     ├── components/
     │   ├── common/        # Reusable UI (Button, Input, Card)
     │   ├── layout/        # Layout (Header, Footer, Sidebar)
     │   └── features/      # Feature-specific (UserProfile, Dashboard)
     ├── pages/             # Route pages
     ├── hooks/             # Custom hooks
     ├── services/api/      # API client functions
     ├── types/             # TypeScript types
     ├── utils/             # Utilities
     └── contexts/          # Context providers
     ```
   - Map each component to appropriate directory
   - Plan file creation order (dependencies first)

3. **Generate Component Specifications**
   - For each component to be created:
     - Define props interface
     - Specify state requirements
     - List event handlers needed
     - Document API calls required
     - Note styling approach (Tailwind classes, CSS modules)
     - Identify child components
   - Example specification:
     ```typescript
     // LoginForm.tsx
     interface LoginFormProps {
       onSuccess: (user: User) => void
       onError: (error: Error) => void
     }
     State: email, password, loading, error
     API: userService.login(credentials)
     Styling: Tailwind CSS with design system colors
     Children: Input (2x), Button (1x)
     ```

4. **Plan API Service Layer**
   - Group endpoints by resource (users, auth, products, etc.)
   - Create service modules for each resource
   - Define TypeScript types for requests/responses
   - Plan API client configuration:
     - Base URL setup
     - Authentication token injection
     - Error handling interceptors
     - Request retry logic
   - Example:
     ```typescript
     // services/api/auth.ts
     export const authService = {
       login: (credentials: LoginDto) => api.post('/auth/login', credentials),
       register: (data: RegisterDto) => api.post('/auth/register', data),
       logout: () => api.post('/auth/logout')
     }
     ```

5. **Identify Shared Utilities and Hooks**
   - Extract common patterns from UACs:
     - Form validation logic → `useForm` hook
     - API data fetching → `useApi` hook
     - Authentication state → `useAuth` hook
     - Date formatting → `formatDate` utility
   - Plan custom hooks creation
   - Document utility functions needed

### Phase 5: Generate Frontend Implementation

1. **Create Directory Structure**
   - Use Bash to create directories if they don't exist:
     ```bash
     mkdir -p src/components/common
     mkdir -p src/components/layout
     mkdir -p src/components/features
     mkdir -p src/pages
     mkdir -p src/hooks
     mkdir -p src/services/api
     mkdir -p src/types
     mkdir -p src/utils
     mkdir -p src/contexts
     mkdir -p src/styles
     ```
   - Verify all directories created successfully
   - Display confirmation

2. **Generate TypeScript Type Definitions**
   - Create type files in `src/types/`:
     - API types based on API contract schemas
     - Component prop types
     - Domain model types
     - Enum types for constants
   - Follow naming conventions from docs/300-frontend-v1.0.0.md
   - Example:
     ```typescript
     // src/types/user.ts
     export interface User {
       id: string
       email: string
       firstName: string
       lastName: string
       role: 'admin' | 'user'
     }

     export interface LoginDto {
       email: string
       password: string
     }
     ```
   - Use Write tool to create each type file
   - Validate TypeScript syntax

3. **Generate API Service Layer**
   - Create API client configuration in `src/services/api/client.ts`:
     - Base URL from tech stack document
     - Axios or Fetch wrapper
     - Authentication token injection
     - Request/response interceptors
     - Error handling middleware
   - Create service modules for each resource:
     - `src/services/api/auth.ts`
     - `src/services/api/users.ts`
     - etc.
   - Follow patterns from docs/300-frontend-v1.0.0.md
   - Use tech stack choices (React Query, etc.)
   - Example:
     ```typescript
     // src/services/api/client.ts
     import axios from 'axios'

     const api = axios.create({
       baseURL: import.meta.env.VITE_API_BASE_URL,
       headers: { 'Content-Type': 'application/json' }
     })

     api.interceptors.request.use((config) => {
       const token = localStorage.getItem('accessToken')
       if (token) {
         config.headers.Authorization = `Bearer ${token}`
       }
       return config
     })

     export { api }
     ```
   - Use Write tool for each service file

4. **Generate Common UI Components**
   - Create reusable components in `src/components/common/`:
     - Button.tsx (with variants from design system)
     - Input.tsx (with validation states)
     - Card.tsx (with header/body/footer)
     - Modal.tsx, Tooltip.tsx, etc.
   - Apply design system specifications:
     - Typography from 125-design-system
     - Color palette
     - Spacing system
     - Component variants and states
   - Follow component patterns from docs/300-frontend-v1.0.0.md:
     - Presentation components (stateless)
     - TypeScript interfaces for props
     - Accessible markup (ARIA labels)
   - Example:
     ```typescript
     // src/components/common/Button.tsx
     import React from 'react'

     interface ButtonProps {
       variant?: 'primary' | 'secondary' | 'tertiary'
       size?: 'small' | 'medium' | 'large'
       disabled?: boolean
       loading?: boolean
       onClick?: () => void
       children: React.ReactNode
     }

     export function Button({
       variant = 'primary',
       size = 'medium',
       disabled = false,
       loading = false,
       onClick,
       children
     }: ButtonProps) {
       const baseClasses = 'btn'
       const variantClasses = {
         primary: 'btn-primary',
         secondary: 'btn-secondary',
         tertiary: 'btn-tertiary'
       }
       const sizeClasses = {
         small: 'btn-sm',
         medium: 'btn-md',
         large: 'btn-lg'
       }

       return (
         <button
           className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
           disabled={disabled || loading}
           onClick={onClick}
         >
           {loading ? 'Loading...' : children}
         </button>
       )
     }
     ```
   - Use Write tool for each component

5. **Generate Feature Components**
   - Create feature-specific components in `src/components/features/`:
     - Organize by feature domain (auth, dashboard, profile, etc.)
     - Create container components (stateful)
     - Create presentation components (stateless)
     - Implement state management (hooks, context)
     - Integrate API services
   - Follow architecture patterns from docs/300-frontend-v1.0.0.md
   - Example:
     ```typescript
     // src/components/features/auth/LoginForm.tsx
     import React, { useState } from 'react'
     import { Button } from '@/components/common/Button'
     import { Input } from '@/components/common/Input'
     import { authService } from '@/services/api/auth'
     import type { LoginDto } from '@/types/auth'

     interface LoginFormProps {
       onSuccess: (user: User) => void
       onError: (error: Error) => void
     }

     export function LoginForm({ onSuccess, onError }: LoginFormProps) {
       const [email, setEmail] = useState('')
       const [password, setPassword] = useState('')
       const [loading, setLoading] = useState(false)

       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault()
         setLoading(true)

         try {
           const response = await authService.login({ email, password })
           onSuccess(response.data.user)
         } catch (error) {
           onError(error as Error)
         } finally {
           setLoading(false)
         }
       }

       return (
         <form onSubmit={handleSubmit}>
           <Input
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             placeholder="Email"
             required
           />
           <Input
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             placeholder="Password"
             required
           />
           <Button type="submit" loading={loading}>
             Login
           </Button>
         </form>
       )
     }
     ```
   - Use Write tool for each component

6. **Generate Pages**
   - Create page components in `src/pages/`:
     - One page per route
     - Compose feature and common components
     - Handle page-level state and data fetching
     - Implement routing structure
   - Follow user flows from docs/100-userflows
   - Example:
     ```typescript
     // src/pages/Login.tsx
     import React from 'react'
     import { useNavigate } from 'react-router-dom'
     import { LoginForm } from '@/components/features/auth/LoginForm'
     import { useAuth } from '@/hooks/useAuth'

     export function LoginPage() {
       const navigate = useNavigate()
       const { login } = useAuth()

       const handleSuccess = (user: User) => {
         login(user)
         navigate('/dashboard')
       }

       const handleError = (error: Error) => {
         console.error('Login failed:', error)
       }

       return (
         <div className="login-page">
           <h1>Login</h1>
           <LoginForm onSuccess={handleSuccess} onError={handleError} />
         </div>
       )
     }
     ```
   - Use Write tool for each page

7. **Generate Custom Hooks**
   - Create hooks in `src/hooks/`:
     - `useAuth()` - Authentication state and actions
     - `useApi()` - API request wrapper
     - `useForm()` - Form state and validation
     - Feature-specific hooks
   - Follow hook patterns from docs/300-frontend-v1.0.0.md
   - Example:
     ```typescript
     // src/hooks/useAuth.ts
     import { useContext } from 'react'
     import { AuthContext } from '@/contexts/AuthContext'

     export function useAuth() {
       const context = useContext(AuthContext)

       if (!context) {
         throw new Error('useAuth must be used within AuthProvider')
       }

       return context
     }
     ```
   - Use Write tool for each hook

8. **Generate Context Providers**
   - Create contexts in `src/contexts/`:
     - AuthContext for authentication state
     - ThemeContext for theme preferences
     - Other global state as needed
   - Follow state management approach from docs/300-frontend-v1.0.0.md
   - Example:
     ```typescript
     // src/contexts/AuthContext.tsx
     import React, { createContext, useState, useEffect } from 'react'
     import type { User } from '@/types/user'

     interface AuthContextType {
       user: User | null
       isAuthenticated: boolean
       login: (user: User) => void
       logout: () => void
     }

     export const AuthContext = createContext<AuthContextType | undefined>(undefined)

     export function AuthProvider({ children }: { children: React.ReactNode }) {
       const [user, setUser] = useState<User | null>(null)

       const login = (user: User) => {
         setUser(user)
         localStorage.setItem('user', JSON.stringify(user))
       }

       const logout = () => {
         setUser(null)
         localStorage.removeItem('user')
         localStorage.removeItem('accessToken')
       }

       useEffect(() => {
         const savedUser = localStorage.getItem('user')
         if (savedUser) {
           setUser(JSON.parse(savedUser))
         }
       }, [])

       return (
         <AuthContext.Provider value={{
           user,
           isAuthenticated: !!user,
           login,
           logout
         }}>
           {children}
         </AuthContext.Provider>
       )
     }
     ```
   - Use Write tool for each context

9. **Generate Utility Functions**
   - Create utilities in `src/utils/`:
     - Date formatting
     - String manipulation
     - Validation helpers
     - Other common functions
   - Example:
     ```typescript
     // src/utils/date.ts
     export function formatDate(date: string | Date): string {
       const d = typeof date === 'string' ? new Date(date) : date
       return d.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       })
     }
     ```
   - Use Write tool for each utility file

10. **Generate Routing Configuration**
    - Create routing setup based on tech stack choice
    - For React Router:
      ```typescript
      // src/routes.tsx
      import { Navigate } from 'react-router-dom'
      import { LoginPage } from './pages/Login'
      import { DashboardPage } from './pages/Dashboard'

      export const routes = [
        { path: '/login', element: <LoginPage /> },
        { path: '/dashboard', element: <DashboardPage /> },
        { path: '/', element: <Navigate to="/dashboard" replace /> }
      ]
      ```
    - For Next.js App Router:
      - Create `app/` directory structure
      - Create `page.tsx` files for each route
      - Create `layout.tsx` for shared layouts
    - Use Write tool to create routing files

### Phase 6: Generate Tests

1. **Create Test Directory Structure**
   - Create test directories:
     ```bash
     mkdir -p src/components/common/__tests__
     mkdir -p src/components/features/__tests__
     mkdir -p src/hooks/__tests__
     mkdir -p src/utils/__tests__
     mkdir -p tests/e2e
     ```
   - Verify all test directories created

2. **Generate Unit Tests for Components**
   - For each component created, generate corresponding test file
   - Use Vitest + React Testing Library (from tech stack)
   - Test file naming: `ComponentName.test.tsx`
   - Test coverage requirements:
     - ✅ Component renders without errors
     - ✅ Props are applied correctly
     - ✅ User interactions work (clicks, inputs)
     - ✅ State changes behave correctly
     - ✅ API calls are triggered properly (mocked)
     - ✅ Error states display correctly
     - ✅ Loading states work
   - Example:
     ```typescript
     // src/components/common/__tests__/Button.test.tsx
     import { describe, it, expect, vi } from 'vitest'
     import { render, screen, fireEvent } from '@testing-library/react'
     import { Button } from '../Button'

     describe('Button', () => {
       it('renders children correctly', () => {
         render(<Button>Click me</Button>)
         expect(screen.getByText('Click me')).toBeInTheDocument()
       })

       it('calls onClick handler when clicked', () => {
         const handleClick = vi.fn()
         render(<Button onClick={handleClick}>Click me</Button>)
         fireEvent.click(screen.getByText('Click me'))
         expect(handleClick).toHaveBeenCalledTimes(1)
       })

       it('applies variant classes correctly', () => {
         const { container } = render(<Button variant="secondary">Click me</Button>)
         expect(container.firstChild).toHaveClass('btn-secondary')
       })

       it('disables button when disabled prop is true', () => {
         render(<Button disabled>Click me</Button>)
         expect(screen.getByText('Click me')).toBeDisabled()
       })

       it('shows loading state when loading is true', () => {
         render(<Button loading>Click me</Button>)
         expect(screen.getByText('Loading...')).toBeInTheDocument()
       })
     })
     ```
   - Use Write tool for each test file

3. **Generate Unit Tests for Hooks**
   - Test custom hooks using @testing-library/react-hooks
   - Test file naming: `useHookName.test.ts`
   - Test coverage:
     - ✅ Hook returns correct initial state
     - ✅ Hook state updates correctly
     - ✅ Hook side effects work (API calls, localStorage)
     - ✅ Hook error handling works
   - Example:
     ```typescript
     // src/hooks/__tests__/useAuth.test.ts
     import { describe, it, expect, beforeEach } from 'vitest'
     import { renderHook, act } from '@testing-library/react'
     import { useAuth } from '../useAuth'
     import { AuthProvider } from '@/contexts/AuthContext'

     describe('useAuth', () => {
       beforeEach(() => {
         localStorage.clear()
       })

       it('returns initial unauthenticated state', () => {
         const { result } = renderHook(() => useAuth(), {
           wrapper: AuthProvider
         })
         expect(result.current.user).toBeNull()
         expect(result.current.isAuthenticated).toBe(false)
       })

       it('updates state on login', () => {
         const { result } = renderHook(() => useAuth(), {
           wrapper: AuthProvider
         })
         const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' }

         act(() => {
           result.current.login(mockUser)
         })

         expect(result.current.user).toEqual(mockUser)
         expect(result.current.isAuthenticated).toBe(true)
       })

       it('clears state on logout', () => {
         const { result } = renderHook(() => useAuth(), {
           wrapper: AuthProvider
         })
         const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' }

         act(() => {
           result.current.login(mockUser)
           result.current.logout()
         })

         expect(result.current.user).toBeNull()
         expect(result.current.isAuthenticated).toBe(false)
       })
     })
     ```
   - Use Write tool for each test file

4. **Generate Unit Tests for Utilities**
   - Test utility functions with edge cases
   - Test file naming: `utilityName.test.ts`
   - Test coverage:
     - ✅ Happy path scenarios
     - ✅ Edge cases (empty strings, null, undefined)
     - ✅ Error cases
   - Example:
     ```typescript
     // src/utils/__tests__/date.test.ts
     import { describe, it, expect } from 'vitest'
     import { formatDate } from '../date'

     describe('formatDate', () => {
       it('formats ISO date string correctly', () => {
         const result = formatDate('2026-02-10T12:00:00Z')
         expect(result).toBe('February 10, 2026')
       })

       it('formats Date object correctly', () => {
         const date = new Date('2026-02-10T12:00:00Z')
         const result = formatDate(date)
         expect(result).toBe('February 10, 2026')
       })

       it('handles invalid date gracefully', () => {
         const result = formatDate('invalid-date')
         expect(result).toBe('Invalid Date')
       })
     })
     ```
   - Use Write tool for each test file

5. **Generate E2E Tests Based on User Flows**
   - Read docs/100-userflows-v*.md for user journey scenarios
   - Create Playwright tests for critical user flows
   - Test file naming: `flow-name.spec.ts`
   - Map each user flow diagram to test scenario
   - Test coverage:
     - ✅ Complete user journeys (happy paths)
     - ✅ Error flows and edge cases
     - ✅ Navigation between pages
     - ✅ Form submissions
     - ✅ API integration (use MSW or test API)
     - ✅ Authentication flows
   - Example from User Flow 1 (New Project Setup):
     ```typescript
     // tests/e2e/user-login.spec.ts
     import { test, expect } from '@playwright/test'

     test.describe('User Login Flow', () => {
       test('successful login redirects to dashboard', async ({ page }) => {
         // Navigate to login page
         await page.goto('/login')

         // Verify login form is visible
         await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()

         // Fill in credentials
         await page.getByPlaceholder('Email').fill('test@example.com')
         await page.getByPlaceholder('Password').fill('password123')

         // Submit form
         await page.getByRole('button', { name: 'Login' }).click()

         // Verify redirect to dashboard
         await expect(page).toHaveURL('/dashboard')
         await expect(page.getByText('Welcome back')).toBeVisible()
       })

       test('invalid credentials show error message', async ({ page }) => {
         await page.goto('/login')

         await page.getByPlaceholder('Email').fill('test@example.com')
         await page.getByPlaceholder('Password').fill('wrongpassword')
         await page.getByRole('button', { name: 'Login' }).click()

         // Verify error message displayed
         await expect(page.getByText('Invalid credentials')).toBeVisible()
         // Verify still on login page
         await expect(page).toHaveURL('/login')
       })

       test('form validation prevents empty submission', async ({ page }) => {
         await page.goto('/login')

         // Try to submit empty form
         await page.getByRole('button', { name: 'Login' }).click()

         // Verify validation messages
         await expect(page.getByText('Email is required')).toBeVisible()
         await expect(page.getByText('Password is required')).toBeVisible()
       })
     })
     ```
   - Example from User Flow 2 (Legacy Codebase Documentation):
     ```typescript
     // tests/e2e/documentation-viewer.spec.ts
     import { test, expect } from '@playwright/test'

     test.describe('Documentation Viewer Flow', () => {
       test('user can navigate and view documentation', async ({ page }) => {
         // Navigate to viewer
         await page.goto('/')

         // Verify sidebar navigation is visible
         await expect(page.getByRole('navigation')).toBeVisible()

         // Click on PRD document
         await page.getByText('002-prd-v1.0.0.md').click()

         // Verify document content loaded
         await expect(page.getByRole('heading', { name: /Product Requirements/ })).toBeVisible()

         // Verify markdown rendering
         await expect(page.locator('h2')).toBeVisible()

         // Test version selector
         await page.getByLabel('Select version').click()
         await page.getByText('v1.1.0').click()

         // Verify version change
         await expect(page).toHaveURL(/v1\.1\.0/)
       })

       test('user can search documentation', async ({ page }) => {
         await page.goto('/')

         // Enter search query
         await page.getByPlaceholder('Search documentation').fill('authentication')
         await page.keyboard.press('Enter')

         // Verify search results
         await expect(page.getByText(/results for "authentication"/)).toBeVisible()
         await expect(page.locator('.search-result')).toHaveCount.greaterThan(0)

         // Click on result
         await page.locator('.search-result').first().click()

         // Verify navigation to result
         await expect(page.getByText('authentication', { exact: false })).toBeVisible()
       })
     })
     ```
   - Generate E2E test for each major user flow from docs/100-userflows
   - Use Write tool for each E2E test file

6. **Generate Test Configuration Files**
   - Create Vitest configuration:
     ```typescript
     // vitest.config.ts
     import { defineConfig } from 'vitest/config'
     import react from '@vitejs/plugin-react'
     import path from 'path'

     export default defineConfig({
       plugins: [react()],
       test: {
         globals: true,
         environment: 'jsdom',
         setupFiles: ['./src/test/setup.ts'],
         coverage: {
           provider: 'v8',
           reporter: ['text', 'json', 'html'],
           exclude: [
             'node_modules/',
             'src/test/',
             '**/*.d.ts',
             '**/*.config.*',
             '**/mockData',
           ]
         }
       },
       resolve: {
         alias: {
           '@': path.resolve(__dirname, './src')
         }
       }
     })
     ```
   - Create Playwright configuration:
     ```typescript
     // playwright.config.ts
     import { defineConfig, devices } from '@playwright/test'

     export default defineConfig({
       testDir: './tests/e2e',
       fullyParallel: true,
       forbidOnly: !!process.env.CI,
       retries: process.env.CI ? 2 : 0,
       workers: process.env.CI ? 1 : undefined,
       reporter: 'html',
       use: {
         baseURL: 'http://localhost:5173',
         trace: 'on-first-retry',
       },
       projects: [
         {
           name: 'chromium',
           use: { ...devices['Desktop Chrome'] },
         },
         {
           name: 'firefox',
           use: { ...devices['Desktop Firefox'] },
         },
         {
           name: 'webkit',
           use: { ...devices['Desktop Safari'] },
         },
       ],
       webServer: {
         command: 'npm run dev',
         url: 'http://localhost:5173',
         reuseExistingServer: !process.env.CI,
       },
     })
     ```
   - Create test setup file:
     ```typescript
     // src/test/setup.ts
     import { expect, afterEach } from 'vitest'
     import { cleanup } from '@testing-library/react'
     import matchers from '@testing-library/jest-dom/matchers'

     expect.extend(matchers)

     afterEach(() => {
       cleanup()
     })
     ```
   - Use Write tool for configuration files

7. **Generate Test Utilities and Mocks**
   - Create test utilities in `src/test/`:
     - Mock API responses
     - Test data factories
     - Custom render functions with providers
   - Example:
     ```typescript
     // src/test/test-utils.tsx
     import React from 'react'
     import { render, RenderOptions } from '@testing-library/react'
     import { AuthProvider } from '@/contexts/AuthContext'
     import { BrowserRouter } from 'react-router-dom'

     interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
       initialRoute?: string
     }

     export function renderWithProviders(
       ui: React.ReactElement,
       options?: CustomRenderOptions
     ) {
       const { initialRoute = '/', ...renderOptions } = options || {}

       if (initialRoute !== '/') {
         window.history.pushState({}, 'Test page', initialRoute)
       }

       function Wrapper({ children }: { children: React.ReactNode }) {
         return (
           <BrowserRouter>
             <AuthProvider>
               {children}
             </AuthProvider>
           </BrowserRouter>
         )
       }

       return render(ui, { wrapper: Wrapper, ...renderOptions })
     }

     export * from '@testing-library/react'
     export { renderWithProviders as render }
     ```
   - Create mock data factory:
     ```typescript
     // src/test/mockData.ts
     import type { User } from '@/types/user'

     export const mockUser = (overrides?: Partial<User>): User => ({
       id: 'usr_123',
       email: 'test@example.com',
       firstName: 'Test',
       lastName: 'User',
       role: 'user',
       createdAt: '2026-02-10T12:00:00Z',
       updatedAt: '2026-02-10T12:00:00Z',
       ...overrides
     })
     ```
   - Use Write tool for test utilities

8. **Calculate Test Coverage Requirements**
   - Based on docs/400-testing-strategy-v1.0.0.md:
     - Target: 80% code coverage minimum
     - Critical paths: 90%+ coverage
   - Display expected coverage:
     ```
     📊 Test Coverage Targets:
     - Unit Tests: 80% minimum
     - Critical Paths: 90% minimum
     - E2E Tests: All major user flows covered
     ```

### Phase 7: Validate Generated Code

1. **TypeScript Compilation Check**
   - Run TypeScript compiler to check for errors:
     ```bash
     npx tsc --noEmit
     ```
   - If errors found:
     - Display errors with file locations
     - Attempt to fix common issues:
       - Missing type imports
       - Type mismatches
       - Undefined properties
     - Re-run compilation after fixes
   - Display: "✅ TypeScript compilation successful" or error details

2. **Linting Validation**
   - Run ESLint on generated files:
     ```bash
     npx eslint src/ --ext .ts,.tsx
     ```
   - Auto-fix issues where possible:
     ```bash
     npx eslint src/ --ext .ts,.tsx --fix
     ```
   - Display linting results
   - Note any unfixable issues for manual review

3. **Code Style Validation**
   - Run Prettier to format code:
     ```bash
     npx prettier --write "src/**/*.{ts,tsx,css}"
     ```
   - Ensure consistent code formatting
   - Display: "✅ Code formatted with Prettier"

4. **Architecture Pattern Compliance**
   - Verify generated code follows docs/300-frontend-v1.0.0.md:
     - ✅ Component naming conventions (PascalCase)
     - ✅ Hook naming (useXxx pattern)
     - ✅ File structure matches recommended layout
     - ✅ Import order follows conventions
     - ✅ Component types (presentation/container) properly separated
   - Display compliance report

5. **Design System Compliance**
   - Verify components use design system specifications:
     - ✅ Colors from palette defined in docs/125-design-system
     - ✅ Typography scales applied correctly
     - ✅ Spacing system used consistently
     - ✅ Component variants match design system
   - Display compliance checklist

6. **API Integration Validation**
   - Verify API services match docs/350-api-contract:
     - ✅ Endpoint paths correct
     - ✅ Request/response types match schemas
     - ✅ Authentication headers included
     - ✅ Error handling implemented
   - Display integration checklist

7. **Run Unit Tests**
   - Execute Vitest on generated tests:
     ```bash
     npm run test
     ```
   - Display test results:
     - Total tests run
     - Tests passed/failed
     - Coverage percentage
   - If tests fail:
     - Display failing test details
     - Attempt to fix common issues
     - Re-run tests after fixes
   - Example output:
     ```
     ✅ Unit Tests Results:
     - Tests: 45 passed, 0 failed (45 total)
     - Coverage: 87.3% (target: 80%)
     - Duration: 2.4s
     ```
   - If coverage below 80%:
     - Display warning: "Coverage below target (75% < 80%)"
     - List uncovered files
     - Suggest adding more tests

8. **Run E2E Tests**
   - Execute Playwright tests:
     ```bash
     npm run test:e2e
     ```
   - Display E2E test results:
     - Total scenarios tested
     - Scenarios passed/failed
     - User flows covered
   - If E2E tests fail:
     - Display failing scenario details
     - Check if dev server is running
     - Suggest manual review
   - Example output:
     ```
     ✅ E2E Tests Results:
     - Scenarios: 12 passed, 0 failed (12 total)
     - User Flows: 4/4 covered (100%)
     - Browsers: Chrome ✅ Firefox ✅ Safari ✅
     - Duration: 45s
     ```
   - Note: E2E tests require dev server to be running
   - If dev server not running:
     - Display: "Starting dev server for E2E tests..."
     - Start server in background
     - Run tests
     - Stop server after tests complete

9. **Generate Validation Report**
   - Summarize all validation results:
     ```
     ✅ Validation Results:

     TypeScript Compilation: ✅ Passed (0 errors)
     ESLint: ✅ Passed (3 warnings auto-fixed)
     Prettier: ✅ Code formatted
     Architecture Compliance: ✅ 100% (all patterns followed)
     Design System: ✅ 100% (all specs applied)
     API Integration: ✅ 100% (all endpoints match contract)
     Unit Tests: ✅ 45/45 passed (coverage: 87.3%)
     E2E Tests: ✅ 12/12 passed (4 user flows covered)

     ⚠️ Warnings:
     - None

     ❌ Errors:
     - None
     ```

### Phase 8: Update Progress Tracking

1. **Read Current Progress Document**
   - Read latest `docs/progress/000-progress-v*.md`
   - Parse current completion status
   - Identify version alignment

2. **Mark Completed UACs**
   - For each FE: UAC that was implemented:
     - Change status from ⏳ to ✅
     - Update completion date
     - Add implementation notes
   - Example update:
     ```
     Before: - ⏳ FE: Generates React components based on design system
     After:  - ✅ FE: Generates React components based on design system
     ```
   - Use Edit tool to update progress document

3. **Calculate New Completion Percentage**
   - Count total FE: UACs
   - Count completed FE: UACs
   - Calculate percentage: (completed / total) * 100
   - Display: "Frontend Progress: 45% → 78% (+33%)"

4. **Add Build Notes**
   - Add entry to progress document changelog:
     ```
     ### [Current Date] - Frontend Build
     - ✅ Implemented 12 FE: UACs from Stories 101, 102, 103
     - Generated 15 components, 8 pages, 5 hooks
     - Created API service layer with 12 endpoints
     - All validation checks passed
     ```

5. **Update Story Status**
   - If all UACs in a story are complete:
     - Mark story as ✅ Completed
     - Update story completion date
   - Display story completion summary

6. **Update Epic Story File** (only if `--story-file` was provided in Phase 0)
   - Update story file YAML frontmatter at current path (now in `in-progress/`):
     - Set `test_unit_status: "passing"` (or `"failing"` if tests failed)
     - Set `test_e2e_status: "passing"` (or `"failing"` if E2E tests failed)
     - Set `test_integration_status: "pending"` (integration tests run at /build-be)
     - Update `uac_completed` count — count checked `- [x] FE:` boxes in body
     - Recalculate `uac_pending` and `uac_completion_pct`
     - Set `updated_at: {ISO now}`
   - Also update body: mark implemented UACs as checked (`- [ ] FE:` → `- [x] FE:`)
   - Move story file from `in-progress/` → `qa/`:
     ```bash
     mv {epicDir}/in-progress/{filename} {epicDir}/qa/{filename}
     ```
   - Update frontmatter `story_status: qa`
   - Run: `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}`
   - Display:
     ```
     ✅ Story {storyId} transitioned: in-progress → qa
     UACs: {completed}/{total} FE: UACs checked
     Epic stats refreshed for {epicId}
     ```

7. **Verify Version Alignment**
   - Ensure progress document version matches atomic stories version
   - If mismatch:
     - Suggest running `/update-progress` for full reconciliation
   - Display version alignment status

### Phase 9: Generate Summary Report

1. **Collect Build Statistics**
   - Count files created:
     - Components (common, layout, features)
     - Pages
     - Hooks
     - Services
     - Types
     - Utilities
     - Contexts
   - Calculate total lines of code generated
   - Note which UACs were implemented

2. **Generate File Tree**
   - Display comprehensive file tree of generated code:
     ```
     src/
     ├── components/
     │   ├── common/
     │   │   ├── Button.tsx
     │   │   ├── Input.tsx
     │   │   └── Card.tsx (3 files)
     │   ├── features/
     │   │   ├── auth/
     │   │   │   ├── LoginForm.tsx
     │   │   │   └── RegisterForm.tsx (2 files)
     │   │   └── dashboard/
     │   │       └── DashboardWidget.tsx (1 file)
     │   └── layout/
     │       ├── Header.tsx
     │       └── Footer.tsx (2 files)
     ├── pages/
     │   ├── Login.tsx
     │   ├── Dashboard.tsx
     │   └── Profile.tsx (3 files)
     ├── hooks/
     │   ├── useAuth.ts
     │   └── useApi.ts (2 files)
     ├── services/api/
     │   ├── client.ts
     │   ├── auth.ts
     │   └── users.ts (3 files)
     ├── types/
     │   ├── user.ts
     │   └── auth.ts (2 files)
     ├── contexts/
     │   └── AuthContext.tsx (1 file)
     └── utils/
         └── date.ts (1 file)

     Total: 20 files created
     ```

3. **Display Comprehensive Summary**
   ```
   ✅ Frontend build completed successfully!

   📝 Git Information:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Working Branch:  feature/build-fe-user-auth
   Protected:       No
   Status:          Ready for commit

   Next: Review changes and commit with descriptive message

   📊 Build Statistics:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Components:  8 created (3 common, 3 features, 2 layout)
   Pages:       3 created
   Hooks:       2 created
   Services:    3 API services (12 endpoints)
   Types:       2 type definition files
   Contexts:    1 context provider
   Utilities:   1 utility file
   Unit Tests:  15 test files (45 test cases)
   E2E Tests:   4 test files (12 scenarios)
   Total Files: 39 files (20 source + 19 test)
   Lines of Code: ~2,100 lines (1,247 source + 853 test)

   📚 Documentation Used:
   - docs/150-tech-stacks-v1.0.0.md (Next.js, Tailwind, React Query)
   - docs/125-design-system-v1.0.0.md (15 component specs)
   - docs/300-frontend-v1.0.0.md (architecture patterns)
   - docs/350-api-contract-v1.0.0.md (12 API endpoints)
   - docs/100-userflows-v1.1.0.md (4 user flows)
   - docs/200-atomic-stories-v1.1.0.md (3 stories)

   ✅ UACs Implemented:
   Story 101 - Build Frontend Command:
   - ✅ FE: Reads 125-design-system for component specs
   - ✅ FE: Reads 350-api-contract for API client generation
   - ✅ FE: Generates React components based on design system
   - ✅ FE: Creates pages and routing structure
   - ✅ FE: Implements API client with type safety

   Story 102 - User Authentication:
   - ✅ FE: Login form with email and password inputs
   - ✅ FE: Registration form with validation
   - ✅ FE: Authentication context and hooks

   ✅ Validation Results:
   - TypeScript: ✅ No errors
   - ESLint: ✅ Passed (auto-fixed 3 warnings)
   - Prettier: ✅ Code formatted
   - Architecture: ✅ 100% compliant
   - Design System: ✅ 100% compliant
   - API Contract: ✅ 100% compliant

   🧪 Test Results:
   - Unit Tests: ✅ 45/45 passed
   - Test Coverage: ✅ 87.3% (target: 80%)
   - E2E Tests: ✅ 12/12 scenarios passed
   - User Flows: ✅ 4/4 flows covered (100%)
   - Browsers: ✅ Chrome, Firefox, Safari

   📈 Progress Updated:
   - Frontend completion: 45% → 78% (+33%)
   - 12 FE: UACs marked as completed
   - 2 stories fully completed
   - Progress tracking updated to v1.1.0

   📁 Generated File Tree:
   [See detailed tree above]

   🎯 Next Steps:

   1. **Test Generated Code:**
      - Run dev server: npm run dev
      - Test components in browser
      - Verify API integration works

   2. **Run Tests:**
      - Unit tests: npm run test
      - E2E tests: npm run test:e2e

   3. **Review and Refine:**
      - Review generated components
      - Customize styling as needed
      - Add additional error handling

   4. **Continue Development:**
      - Run /build-fe again for remaining UACs
      - Or run /build-be for backend implementation
      - Or run /build-devops for infrastructure

   5. **Update Progress:**
      - Run /update-progress to verify tracking
      - Review docs/progress/000-progress-v1.1.0.md

   ✨ Frontend implementation ready for testing! ✨
   ```

4. **Suggest Follow-Up Commands**
   - Based on remaining work:
     - If more FE: UACs pending: "Run /build-fe again to continue"
     - If BE: UACs pending: "Run /build-be for backend"
     - If DevOps: UACs pending: "Run /build-devops for infrastructure"
   - Display clear next actions

## Input Format

**Command:**
```
/build-fe
```

**No arguments required** - The skill automatically:
- Finds latest atomic stories and progress documents
- Identifies pending FE: UACs
- Reads all required documentation
- Generates frontend implementation
- Updates progress tracking

**Optional Usage:**
```
/build-fe --story 101
```
(Future enhancement: Build specific story only)

## Output Format

See detailed summary in Phase 7, Step 3 above.

## Important Notes

- **CRITICAL**: Always re-read docs/300-frontend-v1.0.0.md at the start of each build to catch evolving best practices
- **Test-First Guardrails**: Unit and E2E tests are MANDATORY - they prevent breaking changes during future development
- **User Flow Coverage**: All E2E tests are based on docs/100-userflows to ensure real-world scenarios work
- **Coverage Requirements**: Minimum 80% test coverage enforced - builds should not complete with lower coverage
- **Version Alignment**: Verify atomic stories and progress documents are aligned before building
- **Incremental Builds**: Can run multiple times - only builds pending UACs
- **Tech Stack Adherence**: Strictly follows technology choices from docs/150-tech-stacks
- **Design System Compliance**: All components must match docs/125-design-system specifications
- **API Contract**: API services must exactly match docs/350-api-contract endpoints and schemas
- **Architecture Patterns**: Code must follow patterns in docs/300-frontend-v1.0.0.md
- **Validation Required**: Always validate TypeScript, linting, tests, and compliance before completion
- **Progress Updates**: Always update progress tracking after successful build
- **No Manual Editing**: Generated code and tests should be production-ready with minimal manual edits

## Error Handling

**No Pending UACs Found:**
- Display: "No pending FE: UACs found. All frontend work is complete!"
- Suggest: "Run /update-progress to verify tracking is current"
- Exit gracefully with success status

**Required Documentation Missing:**
- Display: "Required documentation missing: docs/{filename}"
- Suggest: "Run /setup or /define @{filename} to create it"
- Ask user: "Continue without this documentation? (may result in incomplete implementation)"
- If user confirms: Proceed with available documentation, note gaps in output

**Version Mismatch (Atomic Stories vs Progress):**
- Display: "Warning: Progress (v1.0.0) and Atomic Stories (v1.1.0) versions don't match"
- Suggest: "Run /update-progress first to align versions"
- Ask user: "Continue anyway? (may result in tracking inaccuracies)"
- If user confirms: Proceed, note mismatch in output

**TypeScript Compilation Errors:**
- Display: "TypeScript compilation failed: {error details}"
- Attempt automatic fixes:
  - Add missing type imports
  - Fix simple type mismatches
  - Add missing properties
- Re-compile after fixes
- If still failing:
  - Display unfixable errors
  - Note: "Manual fixes required before code is production-ready"
  - Complete build but flag validation failure

**Directory Creation Failed:**
- Display: "Could not create directory: {path}"
- Check permissions
- Suggest: "Verify write permissions in project directory"
- Abort build

**File Write Failed:**
- Display: "Could not write file: {path}"
- Note: "Partial build completed - some files missing"
- List which files were created vs. failed
- Suggest: "Fix permissions and re-run /build-fe"

**Progress Update Failed:**
- Display: "Warning: Could not update progress tracking"
- Note: "Code generated successfully, but progress not updated"
- Suggest: "Run /update-progress manually to sync tracking"
- Complete build successfully (progress update is not critical to code generation)

**API Contract Schema Mismatch:**
- Display: "Warning: Generated types don't match API contract"
- Note discrepancies
- Suggest: "Review docs/350-api-contract and re-run /build-fe"
- Ask user: "Continue anyway?"

## Success Criteria

The `/build-fe` command is successful when:
1. ✅ All pending FE: UACs identified from atomic stories
2. ✅ All required documentation read and parsed
3. ✅ Context gathered from 7 documentation files
4. ✅ Component specifications generated for all UACs
5. ✅ Directory structure created matching docs/300-frontend
6. ✅ TypeScript type definitions created for all API schemas
7. ✅ API service layer generated matching docs/350-api-contract
8. ✅ Common UI components generated per docs/125-design-system
9. ✅ Feature components created for all UACs
10. ✅ Pages created for all routes
11. ✅ Custom hooks generated as needed
12. ✅ Context providers created for global state
13. ✅ Utility functions implemented
14. ✅ Routing configuration set up
15. ✅ TypeScript compilation passes with 0 errors
16. ✅ ESLint validation passes (or auto-fixed)
17. ✅ Code formatted with Prettier
18. ✅ Unit tests generated for all components, hooks, and utilities
19. ✅ E2E tests generated for all user flows from docs/100-userflows
20. ✅ Test configuration files created (vitest.config.ts, playwright.config.ts)
21. ✅ Test utilities and mock data created
22. ✅ All unit tests pass (45/45 or similar)
23. ✅ Test coverage meets 80% minimum target
24. ✅ All E2E tests pass (12/12 or similar)
25. ✅ All major user flows covered by E2E tests
26. ✅ Architecture patterns verified against docs/300-frontend
27. ✅ Design system compliance verified
28. ✅ API integration validated
29. ✅ Progress tracking updated with completed UACs
30. ✅ Completion percentage recalculated
31. ✅ Build notes added to progress changelog
32. ✅ User receives comprehensive summary report
33. ✅ Next steps clearly communicated

## Future Enhancements

### v1.1.0
- Component test generation (Vitest + React Testing Library)
- E2E test generation (Playwright)
- Storybook stories for component documentation
- Accessibility (a11y) validation

### v1.2.0
- Hot module replacement (HMR) setup
- Performance optimization (code splitting, lazy loading)
- Bundle size analysis
- Progressive Web App (PWA) features

### v1.3.0
- Visual regression testing
- Internationalization (i18n) setup
- Advanced state management patterns
- Real-time features (WebSockets)
