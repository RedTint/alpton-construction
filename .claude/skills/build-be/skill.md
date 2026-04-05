# Build Backend Command

Build and scaffold backend implementation with unit and integration tests based on specifications.

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

### Phase 0b: Pre-build Validation + Dependency Context

1. **Validate Story File** (only if `--story-file` provided)
   - Run:
     ```bash
     node .ai-dev/ai-dev-scripts/validate-stories.js --docs-path=./docs --epic={epicId} --output=table
     ```
   - If the current story has validation errors, display them and recommend fixing first
   - If only warnings, continue

2. **Load Dependency Graph** (only if `--story-file` provided)
   - Run:
     ```bash
     node .ai-dev/ai-dev-scripts/dependency-graph.js --docs-path=./docs --epic={epicId} --output=json
     ```
   - Parse JSON and extract for the current story:
     - **Dependencies**: stories this story depends on → if any are in `done/`, read their implementations for established patterns (API contracts, component interfaces, naming conventions)
     - **Dependents**: stories that depend on this one → understand what interfaces to design and expose
     - **Parallelizable**: whether this story can be built in parallel with others
   - Display:
     ```
     📋 Story Dependencies:
     - Depends on: {list with status}
     - Depended by: {list}
     - Parallelizable: {yes/no}
     ```
   - If a dependency story is NOT done, display warning:
     ```
     ⚠️ Dependency {storyId} is not yet complete ({status}).
     Building anyway, but be aware of potential interface mismatches.
     ```

### Phase 1: Git Branch Safety Check

1. **Check Current Git Branch**
   - Use Bash: `git rev-parse --abbrev-ref HEAD`
   - Store current branch name in variable
   - Examples: `main`, `develop`, `staging`, `feature/user-service`

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

       git checkout -b feature/build-be-{description}

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

       Proceeding with backend build...
       ```

### Phase 2: Parse Input and Identify Pending Backend UACs

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
   - Sort by version number to identify the latest production version
   - Example: If v1.0.0, v1.1.0, v1.2.0 exist, use v1.2.0
   - Read the latest atomic stories document

3. **Filter Backend-Tagged UACs**
   - If `--story-file` was provided:
     - Read body of story file at `storyFilePath`
     - Extract all `- [ ] BE:` and `- [ ] DB:` checkbox lines from `## User Acceptance Criteria` section
     - Pending UACs = unchecked lines only; skip `- [x] BE:` / `- [x] DB:` (already done)
     - Display: "Reading UACs from story file: {storyFilePath}"
   - Otherwise: Search for all UACs tagged with `BE:` or `DB:` prefix in atomic stories
     - Extract UAC text, associated user story, and acceptance criteria details
     - Create a structured list of pending backend UACs

4. **Identify Already Implemented UACs**
   - If `--story-file` was provided: completed UACs = checked `- [x] BE:` / `- [x] DB:` lines in story body
   - Otherwise: Read `docs/progress/000-progress-v*.md` (use latest production version, **exclude** `-draft` files)
   - Find UACs marked as ✅ Complete or 🚧 In Progress
   - Filter out completed UACs from the pending list
   - Focus only on ❌ Not Started UACs for this build session

5. **Group UACs by Feature Area**
   - Organize pending backend UACs by logical grouping:
     - Authentication & Authorization (login, signup, password reset, JWT)
     - User Management (CRUD operations, profile, preferences)
     - Resource Management (projects, documents, tasks, etc.)
     - Data Validation & Business Rules
     - Third-Party Integrations (external APIs, webhooks)
     - Background Jobs & Workers (if applicable)
   - This grouping helps determine which services, repositories, and endpoints to build

6. **Display Filtered UACs to User**
   - Show formatted list:
     ```
     📋 Pending Backend UACs:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     Authentication & Authorization:
     - BE: API endpoint POST /api/auth/login responds with JWT token
     - BE: API endpoint POST /api/auth/signup creates new user account

     User Management:
     - BE: User service validates email uniqueness before account creation
     - BE: API endpoint GET /api/users/:id returns user profile

     [Additional groups...]
     ```
   - If no pending backend UACs found, inform user and exit gracefully

### Phase 3: Gather Context from Documentation

1. **Read API Contract Document**
   - Use Glob to find: `docs/350-api-contract-v*.md`
   - **EXCLUDE** files with `-draft` suffix
   - Read latest production version
   - **CRITICAL**: Read `docs/350-api-contract-v*.md` (use latest version)
   - **This is the primary reference** - defines what the frontend expects from the backend
   - Extract:
     - Authentication mechanisms (JWT structure, token expiry, refresh tokens)
     - API endpoint definitions (method, path, parameters, headers)
     - Request schemas (body structure, query params, path params)
     - Response schemas (success responses, error responses)
     - HTTP status codes for different scenarios
     - Rate limiting requirements
     - CORS configuration
     - API versioning strategy
   - **Important**: Backend implementation MUST match this contract exactly
   - Example endpoint from contract:
     ```
     POST /api/auth/login
     Request: { email: string, password: string }
     Response: {
       token: string,
       refreshToken: string,
       user: { id: string, email: string, name: string }
     }
     Status Codes: 200 (success), 401 (invalid credentials), 422 (validation error)
     ```

2. **Read Database Schema Document**
   - Read `docs/375-database-schema-v*.md` (use latest version)
   - Extract:
     - Entity Relationship Diagram (ERD) structure
     - Table definitions (columns, types, constraints)
     - Relationships (one-to-one, one-to-many, many-to-many)
     - Indexes and performance optimization hints
     - Business rules related to data (validation rules, constraints)
     - Database migrations strategy
   - Map database entities to API resources
   - Example:
     ```
     Table: users
     - id (UUID, primary key)
     - email (VARCHAR, unique, not null)
     - password_hash (VARCHAR, not null)
     - name (VARCHAR, not null)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)

     Business Rules:
     - Email must be unique across all users
     - Password must be hashed using bcrypt before storage
     - Soft delete using deleted_at column
     ```

3. **Check for Relevant Backend Learnings** (Optional but Recommended)
   - Check if `docs/learnings/000-README.md` exists
   - If exists, scan for backend-related learnings:
     - Search "Backend" domain section
     - Search for keywords from current UACs (API, database, authentication, performance)
     - Look for learnings about error handling, query optimization, security
   - Display relevant learnings:
     ```
     💡 Backend Learnings:
     - LEARN-018: PostgreSQL composite index optimization
     - LEARN-027: JWT token refresh pattern for authentication
     - LEARN-033: N+1 query detection and resolution

     Reference these learnings to avoid known issues.
     ```
   - If no learnings or README missing, skip silently
   - Continue with build regardless

4. **Read Backend Architecture Document**
   - **CRITICAL**: Read `docs/325-backend-v*.md` (use latest version)
   - **This is an evolving document** - must be re-read at the start of EVERY /build-be session
   - Extract:
     - Folder structure conventions (where to place files)
     - Code organization patterns (controllers, services, repositories, models)
     - Naming conventions (file names, function names, variable names)
     - Error handling patterns (custom error classes, error middleware)
     - Logging standards (what to log, log levels, structured logging)
     - Security best practices (input validation, SQL injection prevention, XSS prevention)
     - Performance guidelines (caching strategies, query optimization)
     - Definition of Done (linting, testing, documentation requirements)
     - SLA requirements (response time targets, uptime expectations)
   - Example folder structure:
     ```
     src/
       api/
         routes/         # Express/Fastify route definitions
         controllers/    # Request/response handling
         middleware/     # Auth, validation, error handling
       services/         # Business logic layer
       repositories/     # Data access layer
       models/           # Data models, Prisma schema, TypeORM entities
       utils/            # Shared utilities
       config/           # Configuration management
       types/            # TypeScript type definitions
     ```

4. **Read C4 Architecture Diagrams**
   - Read `docs/175-c4-diagrams-v*.md` (use latest version)
   - Extract:
     - System Context: External systems the backend interacts with
     - Container Diagram: Backend services, databases, external APIs
     - Component Diagram: Internal backend component structure
     - Integration points:
       - Third-party APIs (payment gateways, email services, analytics)
       - External authentication providers (OAuth, SAML)
       - Message queues (Redis, RabbitMQ)
       - Caching layers (Redis, Memcached)
       - Storage services (S3, Google Cloud Storage)
   - Identify which integrations are needed for pending UACs
   - Example:
     ```
     External Integrations for Authentication:
     - SendGrid API for email verification
     - Twilio API for SMS 2FA
     - Redis for session storage
     ```

5. **Read Technology Stack Document**
   - Read `docs/150-tech-stacks-v*.md` (use latest version)
   - Extract:
     - Backend runtime (Node.js version, Python version)
     - Backend framework (Express, Fastify, NestJS, FastAPI)
     - Database (PostgreSQL version, connection pooling)
     - ORM/Query Builder (Prisma, TypeORM, Sequelize, SQLAlchemy)
     - Testing frameworks (Jest, Vitest, Pytest)
     - Validation libraries (Zod, Joi, Yup, Pydantic)
     - Authentication libraries (Passport.js, JWT libraries)
     - API documentation tools (Swagger/OpenAPI)
   - Ensure all generated code uses these specific technologies
   - Example:
     ```
     Backend Stack:
     - Runtime: Node.js 20+
     - Framework: Express 4.18+
     - Database: PostgreSQL 15+
     - ORM: Prisma 5+
     - Validation: Zod
     - Testing: Vitest + Supertest
     ```

6. **Consolidate Context**
   - Create a mental map of:
     - Which API endpoints need to be implemented (from API contract + UACs)
     - Which database tables are involved (from DB schema)
     - Which services and repositories need to be created (from architecture)
     - Which third-party integrations are required (from C4 diagrams)
     - Which technology stack to use (from tech stacks doc)
   - Identify any gaps or inconsistencies between documents
   - If critical information is missing, note it for user clarification

### Phase 4: Analyze Backend Requirements

1. **Map UACs to API Endpoints**
   - For each pending backend UAC, determine:
     - Which API endpoint(s) it relates to
     - HTTP method (GET, POST, PUT, PATCH, DELETE)
     - URL path and route parameters
     - Request validation requirements
     - Response format
   - Example mapping:
     ```
     UAC: "BE: API endpoint POST /api/auth/login responds with JWT token"
     →
     Endpoint: POST /api/auth/login
     Controller: AuthController.login
     Service: AuthService.authenticate
     Repository: UserRepository.findByEmail
     ```

2. **Determine Service Layer Architecture**
   - Identify services needed based on feature groupings:
     - AuthService: Login, signup, token refresh, password reset
     - UserService: User CRUD, profile updates, account management
     - ProjectService: Project creation, updates, access control
     - (Additional services based on domain)
   - Define service methods for each UAC
   - Consider service dependencies and interactions
   - Example:
     ```
     AuthService:
     - authenticate(email, password): Promise<{ token, refreshToken, user }>
     - signup(userData): Promise<User>
     - refreshToken(refreshToken): Promise<{ token }>
     - resetPassword(email): Promise<void>
     ```

3. **Determine Repository Layer Architecture**
   - Identify repositories needed based on database entities:
     - UserRepository: Database operations for users table
     - SessionRepository: Database operations for sessions table
     - ProjectRepository: Database operations for projects table
     - (Additional repositories based on schema)
   - Define repository methods for each entity
   - Consider query optimization and indexing
   - Example:
     ```
     UserRepository:
     - findById(id): Promise<User | null>
     - findByEmail(email): Promise<User | null>
     - create(userData): Promise<User>
     - update(id, userData): Promise<User>
     - delete(id): Promise<void>
     ```

4. **Plan Middleware Requirements**
   - Authentication middleware: Verify JWT tokens, extract user from token
   - Authorization middleware: Check user permissions for resources
   - Validation middleware: Validate request body, params, query using schema
   - Error handling middleware: Catch and format errors consistently
   - Logging middleware: Log requests, responses, errors
   - Rate limiting middleware: Prevent abuse
   - CORS middleware: Configure cross-origin requests
   - Example:
     ```
     Middleware Stack for POST /api/projects:
     1. CORS middleware
     2. JSON body parser
     3. Authentication middleware (verify JWT)
     4. Validation middleware (validate project creation schema)
     5. Authorization middleware (check user can create projects)
     6. Route handler (ProjectController.create)
     7. Error handling middleware (catch any errors)
     ```

5. **Identify Third-Party Integration Requirements**
   - From C4 diagrams, determine which external services are needed:
     - Email service integration (SendGrid, AWS SES)
     - Payment processing (Stripe, PayPal)
     - Cloud storage (AWS S3, Google Cloud Storage)
     - Analytics (Segment, Mixpanel)
   - Create adapter/client patterns for each integration
   - Define environment variables for API keys and configuration
   - Example:
     ```
     EmailService (wraps SendGrid):
     - sendVerificationEmail(to, token)
     - sendPasswordResetEmail(to, resetLink)
     - sendWelcomeEmail(to, user)
     ```

6. **Plan Testing Strategy**
   - **Unit Tests**: Test services and repositories in isolation
     - Mock database connections
     - Mock external API calls
     - Test business logic thoroughly
     - Example: UserService.create should validate email, hash password, call repository
   - **Integration Tests**: Test API endpoints end-to-end
     - Use test database
     - Make actual HTTP requests
     - Verify status codes, response schemas
     - Test authentication and authorization flows
     - Example: POST /api/auth/login with valid credentials returns 200 and JWT
   - **Coverage Requirements**: Minimum 80% code coverage
   - Test files should mirror source files:
     ```
     src/services/UserService.ts → src/services/__tests__/UserService.test.ts
     src/api/routes/auth.ts → src/api/routes/__tests__/auth.test.ts
     ```

7. **Determine File Structure**
   - Based on docs/325-backend-v1.0.0.md conventions and pending UACs, plan:
     - Which route files to create (auth.ts, users.ts, projects.ts)
     - Which controller files to create (AuthController.ts, UserController.ts)
     - Which service files to create (AuthService.ts, UserService.ts)
     - Which repository files to create (UserRepository.ts, SessionRepository.ts)
     - Which model files to create (User.ts, Session.ts)
     - Which middleware files to create (authenticate.ts, authorize.ts, validate.ts)
     - Which utility files to create (jwt.ts, password.ts, email.ts)
     - Which type definition files to create (auth.types.ts, user.types.ts)
   - Ensure adherence to folder structure from backend architecture doc

### Phase 5: Generate Backend Implementation

1. **Generate TypeScript Type Definitions**
   - Create type files in `src/types/` based on API contract and database schema:
     - API request/response types (match API contract exactly)
     - Database entity types (match database schema exactly)
     - Service method types
     - Utility types (pagination, filtering, sorting)
   - Example (`src/types/auth.types.ts`):
     ```typescript
     // API Request/Response Types (from API Contract)
     export interface LoginRequest {
       email: string
       password: string
     }

     export interface LoginResponse {
       token: string
       refreshToken: string
       user: {
         id: string
         email: string
         name: string
       }
     }

     export interface SignupRequest {
       email: string
       password: string
       name: string
     }

     // Database Entity Types (from Database Schema)
     export interface User {
       id: string
       email: string
       passwordHash: string
       name: string
       createdAt: Date
       updatedAt: Date
       deletedAt: Date | null
     }

     // JWT Payload Type
     export interface JwtPayload {
       userId: string
       email: string
       iat: number
       exp: number
     }
     ```

2. **Generate Database Models**
   - If using Prisma, create/update `prisma/schema.prisma`:
     ```prisma
     model User {
       id           String    @id @default(uuid())
       email        String    @unique
       passwordHash String    @map("password_hash")
       name         String
       createdAt    DateTime  @default(now()) @map("created_at")
       updatedAt    DateTime  @updatedAt @map("updated_at")
       deletedAt    DateTime? @map("deleted_at")

       sessions Session[]
       projects Project[]

       @@map("users")
     }

     model Session {
       id           String   @id @default(uuid())
       userId       String   @map("user_id")
       refreshToken String   @unique @map("refresh_token")
       expiresAt    DateTime @map("expires_at")
       createdAt    DateTime @default(now()) @map("created_at")

       user User @relation(fields: [userId], references: [id], onDelete: Cascade)

       @@map("sessions")
     }
     ```
   - If using TypeORM, create entity files in `src/models/`:
     ```typescript
     // src/models/User.entity.ts
     import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
     import { Session } from './Session.entity'

     @Entity('users')
     export class User {
       @PrimaryGeneratedColumn('uuid')
       id: string

       @Column({ unique: true })
       email: string

       @Column({ name: 'password_hash' })
       passwordHash: string

       @Column()
       name: string

       @CreateDateColumn({ name: 'created_at' })
       createdAt: Date

       @UpdateDateColumn({ name: 'updated_at' })
       updatedAt: Date

       @Column({ name: 'deleted_at', nullable: true })
       deletedAt: Date | null

       @OneToMany(() => Session, session => session.user)
       sessions: Session[]
     }
     ```

3. **Generate Repository Layer**
   - Create repository files in `src/repositories/`
   - Each repository handles database operations for one entity
   - Use ORM methods, optimize queries with indexes
   - Example (`src/repositories/UserRepository.ts`):
     ```typescript
     import { PrismaClient } from '@prisma/client'
     import type { User } from '../types/user.types'

     export class UserRepository {
       constructor(private prisma: PrismaClient) {}

       async findById(id: string): Promise<User | null> {
         return this.prisma.user.findUnique({
           where: { id, deletedAt: null }
         })
       }

       async findByEmail(email: string): Promise<User | null> {
         return this.prisma.user.findUnique({
           where: { email, deletedAt: null }
         })
       }

       async create(data: {
         email: string
         passwordHash: string
         name: string
       }): Promise<User> {
         return this.prisma.user.create({
           data
         })
       }

       async update(id: string, data: Partial<User>): Promise<User> {
         return this.prisma.user.update({
           where: { id },
           data: { ...data, updatedAt: new Date() }
         })
       }

       async softDelete(id: string): Promise<void> {
         await this.prisma.user.update({
           where: { id },
           data: { deletedAt: new Date() }
         })
       }
     }
     ```

4. **Generate Service Layer**
   - Create service files in `src/services/`
   - Services contain business logic, call repositories, handle transactions
   - Example (`src/services/AuthService.ts`):
     ```typescript
     import { UserRepository } from '../repositories/UserRepository'
     import { SessionRepository } from '../repositories/SessionRepository'
     import { hashPassword, comparePassword } from '../utils/password'
     import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
     import type { LoginResponse, SignupRequest } from '../types/auth.types'

     export class AuthService {
       constructor(
         private userRepository: UserRepository,
         private sessionRepository: SessionRepository
       ) {}

       async authenticate(email: string, password: string): Promise<LoginResponse> {
         // Find user by email
         const user = await this.userRepository.findByEmail(email)
         if (!user) {
           throw new Error('Invalid credentials')
         }

         // Verify password
         const isValidPassword = await comparePassword(password, user.passwordHash)
         if (!isValidPassword) {
           throw new Error('Invalid credentials')
         }

         // Generate tokens
         const token = generateToken({ userId: user.id, email: user.email })
         const refreshToken = generateRefreshToken()

         // Store refresh token in database
         await this.sessionRepository.create({
           userId: user.id,
           refreshToken,
           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
         })

         return {
           token,
           refreshToken,
           user: {
             id: user.id,
             email: user.email,
             name: user.name
           }
         }
       }

       async signup(data: SignupRequest): Promise<LoginResponse> {
         // Check if email already exists
         const existingUser = await this.userRepository.findByEmail(data.email)
         if (existingUser) {
           throw new Error('Email already in use')
         }

         // Hash password
         const passwordHash = await hashPassword(data.password)

         // Create user
         const user = await this.userRepository.create({
           email: data.email,
           passwordHash,
           name: data.name
         })

         // Generate tokens (same as authenticate)
         const token = generateToken({ userId: user.id, email: user.email })
         const refreshToken = generateRefreshToken()

         await this.sessionRepository.create({
           userId: user.id,
           refreshToken,
           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
         })

         return {
           token,
           refreshToken,
           user: {
             id: user.id,
             email: user.email,
             name: user.name
           }
         }
       }

       async refreshToken(oldRefreshToken: string): Promise<{ token: string }> {
         // Verify refresh token exists in database
         const session = await this.sessionRepository.findByRefreshToken(oldRefreshToken)
         if (!session || session.expiresAt < new Date()) {
           throw new Error('Invalid or expired refresh token')
         }

         // Generate new access token
         const user = await this.userRepository.findById(session.userId)
         if (!user) {
           throw new Error('User not found')
         }

         const token = generateToken({ userId: user.id, email: user.email })

         return { token }
       }
     }
     ```

5. **Generate Middleware**
   - Create middleware files in `src/api/middleware/`
   - Example (`src/api/middleware/authenticate.ts`):
     ```typescript
     import { Request, Response, NextFunction } from 'express'
     import { verifyToken } from '../../utils/jwt'
     import type { JwtPayload } from '../../types/auth.types'

     // Extend Express Request type to include user
     declare global {
       namespace Express {
         interface Request {
           user?: JwtPayload
         }
       }
     }

     export const authenticate = (req: Request, res: Response, next: NextFunction) => {
       try {
         const authHeader = req.headers.authorization
         if (!authHeader || !authHeader.startsWith('Bearer ')) {
           return res.status(401).json({ error: 'Missing or invalid authorization header' })
         }

         const token = authHeader.substring(7) // Remove 'Bearer ' prefix
         const payload = verifyToken(token) as JwtPayload

         req.user = payload
         next()
       } catch (error) {
         return res.status(401).json({ error: 'Invalid or expired token' })
       }
     }
     ```
   - Example (`src/api/middleware/validate.ts`):
     ```typescript
     import { Request, Response, NextFunction } from 'express'
     import { z } from 'zod'

     export const validate = (schema: z.ZodSchema) => {
       return (req: Request, res: Response, next: NextFunction) => {
         try {
           schema.parse(req.body)
           next()
         } catch (error) {
           if (error instanceof z.ZodError) {
             return res.status(422).json({
               error: 'Validation failed',
               details: error.errors
             })
           }
           next(error)
         }
       }
     }
     ```

6. **Generate Controllers**
   - Create controller files in `src/api/controllers/`
   - Controllers handle HTTP request/response, delegate to services
   - Example (`src/api/controllers/AuthController.ts`):
     ```typescript
     import { Request, Response, NextFunction } from 'express'
     import { AuthService } from '../../services/AuthService'
     import type { LoginRequest, SignupRequest } from '../../types/auth.types'

     export class AuthController {
       constructor(private authService: AuthService) {}

       login = async (req: Request, res: Response, next: NextFunction) => {
         try {
           const { email, password } = req.body as LoginRequest
           const result = await this.authService.authenticate(email, password)
           res.status(200).json(result)
         } catch (error) {
           next(error)
         }
       }

       signup = async (req: Request, res: Response, next: NextFunction) => {
         try {
           const data = req.body as SignupRequest
           const result = await this.authService.signup(data)
           res.status(201).json(result)
         } catch (error) {
           next(error)
         }
       }

       refreshToken = async (req: Request, res: Response, next: NextFunction) => {
         try {
           const { refreshToken } = req.body
           const result = await this.authService.refreshToken(refreshToken)
           res.status(200).json(result)
         } catch (error) {
           next(error)
         }
       }
     }
     ```

7. **Generate Routes**
   - Create route files in `src/api/routes/`
   - Routes wire together controllers, middleware, and HTTP methods
   - Example (`src/api/routes/auth.ts`):
     ```typescript
     import { Router } from 'express'
     import { z } from 'zod'
     import { AuthController } from '../controllers/AuthController'
     import { validate } from '../middleware/validate'
     import { authenticate } from '../middleware/authenticate'

     // Validation schemas (based on API contract)
     const loginSchema = z.object({
       email: z.string().email(),
       password: z.string().min(8)
     })

     const signupSchema = z.object({
       email: z.string().email(),
       password: z.string().min(8),
       name: z.string().min(2)
     })

     const refreshTokenSchema = z.object({
       refreshToken: z.string()
     })

     export const createAuthRouter = (authController: AuthController) => {
       const router = Router()

       router.post('/login', validate(loginSchema), authController.login)
       router.post('/signup', validate(signupSchema), authController.signup)
       router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken)

       return router
     }
     ```

8. **Generate Utility Functions**
   - Create utility files in `src/utils/`
   - Example (`src/utils/jwt.ts`):
     ```typescript
     import jwt from 'jsonwebtoken'
     import crypto from 'crypto'
     import type { JwtPayload } from '../types/auth.types'

     const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
     const JWT_EXPIRY = '15m' // 15 minutes

     export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
       return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
     }

     export const verifyToken = (token: string): JwtPayload => {
       return jwt.verify(token, JWT_SECRET) as JwtPayload
     }

     export const generateRefreshToken = (): string => {
       return crypto.randomBytes(32).toString('hex')
     }
     ```
   - Example (`src/utils/password.ts`):
     ```typescript
     import bcrypt from 'bcrypt'

     const SALT_ROUNDS = 10

     export const hashPassword = async (password: string): Promise<string> => {
       return bcrypt.hash(password, SALT_ROUNDS)
     }

     export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
       return bcrypt.compare(password, hash)
     }
     ```

9. **Generate Configuration Files**
   - Create config files in `src/config/`
   - Example (`src/config/database.ts`):
     ```typescript
     import { PrismaClient } from '@prisma/client'

     export const prisma = new PrismaClient({
       log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
     })

     export const connectDatabase = async () => {
       try {
         await prisma.$connect()
         console.log('✅ Database connected successfully')
       } catch (error) {
         console.error('❌ Database connection failed:', error)
         process.exit(1)
       }
     }

     export const disconnectDatabase = async () => {
       await prisma.$disconnect()
     }
     ```

10. **Generate Main Application Entry Point**
    - Create or update `src/index.ts` or `src/app.ts`
    - Wire together all routes, middleware, error handling
    - Example (`src/app.ts`):
      ```typescript
      import express from 'express'
      import cors from 'cors'
      import helmet from 'helmet'
      import { createAuthRouter } from './api/routes/auth'
      import { AuthController } from './api/controllers/AuthController'
      import { AuthService } from './services/AuthService'
      import { UserRepository } from './repositories/UserRepository'
      import { SessionRepository } from './repositories/SessionRepository'
      import { prisma } from './config/database'
      import { errorHandler } from './api/middleware/errorHandler'

      const app = express()

      // Middleware
      app.use(helmet())
      app.use(cors())
      app.use(express.json())

      // Dependency Injection
      const userRepository = new UserRepository(prisma)
      const sessionRepository = new SessionRepository(prisma)
      const authService = new AuthService(userRepository, sessionRepository)
      const authController = new AuthController(authService)

      // Routes
      app.use('/api/auth', createAuthRouter(authController))

      // Health check
      app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' })
      })

      // Error handling
      app.use(errorHandler)

      export default app
      ```

11. **Generate Environment Configuration**
    - Create `.env.example` file with all required environment variables:
      ```
      # Database
      DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

      # JWT
      JWT_SECRET="your-super-secret-jwt-key-change-in-production"

      # Server
      PORT=3000
      NODE_ENV=development

      # Third-Party Services
      SENDGRID_API_KEY="your-sendgrid-api-key"
      AWS_ACCESS_KEY_ID="your-aws-access-key"
      AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
      ```

### Phase 6: Generate Tests

1. **Set Up Test Configuration**
   - Create `vitest.config.ts` (if using Vitest):
     ```typescript
     import { defineConfig } from 'vitest/config'
     import path from 'path'

     export default defineConfig({
       test: {
         globals: true,
         environment: 'node',
         setupFiles: ['./src/__tests__/setup.ts'],
         coverage: {
           provider: 'v8',
           reporter: ['text', 'json', 'html'],
           exclude: [
             'node_modules/',
             'src/__tests__/',
             '**/*.test.ts',
             '**/*.spec.ts'
           ],
           thresholds: {
             lines: 80,
             functions: 80,
             branches: 80,
             statements: 80
           }
         }
       },
       resolve: {
         alias: {
           '@': path.resolve(__dirname, './src')
         }
       }
     })
     ```
   - Create test setup file (`src/__tests__/setup.ts`):
     ```typescript
     import { beforeAll, afterAll, beforeEach } from 'vitest'
     import { prisma } from '../config/database'

     beforeAll(async () => {
       // Connect to test database
       await prisma.$connect()
     })

     afterAll(async () => {
       // Disconnect from test database
       await prisma.$disconnect()
     })

     beforeEach(async () => {
       // Clean database before each test
       await prisma.session.deleteMany()
       await prisma.user.deleteMany()
     })
     ```

2. **Generate Unit Tests for Repositories**
   - Test database operations in isolation with test database
   - Example (`src/repositories/__tests__/UserRepository.test.ts`):
     ```typescript
     import { describe, it, expect, beforeEach } from 'vitest'
     import { UserRepository } from '../UserRepository'
     import { prisma } from '../../config/database'

     describe('UserRepository', () => {
       let userRepository: UserRepository

       beforeEach(() => {
         userRepository = new UserRepository(prisma)
       })

       describe('create', () => {
         it('creates a new user successfully', async () => {
           const userData = {
             email: 'test@example.com',
             passwordHash: 'hashedpassword123',
             name: 'Test User'
           }

           const user = await userRepository.create(userData)

           expect(user).toMatchObject({
             email: userData.email,
             name: userData.name
           })
           expect(user.id).toBeDefined()
           expect(user.createdAt).toBeInstanceOf(Date)
         })

         it('throws error when email is duplicate', async () => {
           const userData = {
             email: 'duplicate@example.com',
             passwordHash: 'hashedpassword123',
             name: 'Test User'
           }

           await userRepository.create(userData)

           await expect(userRepository.create(userData)).rejects.toThrow()
         })
       })

       describe('findByEmail', () => {
         it('finds user by email', async () => {
           const userData = {
             email: 'find@example.com',
             passwordHash: 'hashedpassword123',
             name: 'Find Me'
           }

           const createdUser = await userRepository.create(userData)
           const foundUser = await userRepository.findByEmail(userData.email)

           expect(foundUser).toMatchObject({
             id: createdUser.id,
             email: userData.email,
             name: userData.name
           })
         })

         it('returns null for non-existent email', async () => {
           const user = await userRepository.findByEmail('nonexistent@example.com')
           expect(user).toBeNull()
         })

         it('does not return soft-deleted users', async () => {
           const userData = {
             email: 'deleted@example.com',
             passwordHash: 'hashedpassword123',
             name: 'Deleted User'
           }

           const createdUser = await userRepository.create(userData)
           await userRepository.softDelete(createdUser.id)

           const foundUser = await userRepository.findByEmail(userData.email)
           expect(foundUser).toBeNull()
         })
       })
     })
     ```

3. **Generate Unit Tests for Services**
   - Test business logic with mocked repositories
   - Example (`src/services/__tests__/AuthService.test.ts`):
     ```typescript
     import { describe, it, expect, beforeEach, vi } from 'vitest'
     import { AuthService } from '../AuthService'
     import { UserRepository } from '../../repositories/UserRepository'
     import { SessionRepository } from '../../repositories/SessionRepository'
     import * as passwordUtils from '../../utils/password'
     import * as jwtUtils from '../../utils/jwt'

     vi.mock('../../utils/password')
     vi.mock('../../utils/jwt')

     describe('AuthService', () => {
       let authService: AuthService
       let userRepository: UserRepository
       let sessionRepository: SessionRepository

       beforeEach(() => {
         userRepository = {
           findByEmail: vi.fn(),
           create: vi.fn()
         } as any

         sessionRepository = {
           create: vi.fn()
         } as any

         authService = new AuthService(userRepository, sessionRepository)
       })

       describe('authenticate', () => {
         it('returns tokens and user data for valid credentials', async () => {
           const mockUser = {
             id: 'user-123',
             email: 'test@example.com',
             name: 'Test User',
             passwordHash: 'hashedpassword'
           }

           vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser)
           vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true)
           vi.mocked(jwtUtils.generateToken).mockReturnValue('mock-jwt-token')
           vi.mocked(jwtUtils.generateRefreshToken).mockReturnValue('mock-refresh-token')

           const result = await authService.authenticate('test@example.com', 'password123')

           expect(result).toEqual({
             token: 'mock-jwt-token',
             refreshToken: 'mock-refresh-token',
             user: {
               id: mockUser.id,
               email: mockUser.email,
               name: mockUser.name
             }
           })

           expect(sessionRepository.create).toHaveBeenCalledWith({
             userId: mockUser.id,
             refreshToken: 'mock-refresh-token',
             expiresAt: expect.any(Date)
           })
         })

         it('throws error for non-existent user', async () => {
           vi.mocked(userRepository.findByEmail).mockResolvedValue(null)

           await expect(
             authService.authenticate('nonexistent@example.com', 'password123')
           ).rejects.toThrow('Invalid credentials')
         })

         it('throws error for invalid password', async () => {
           const mockUser = {
             id: 'user-123',
             email: 'test@example.com',
             passwordHash: 'hashedpassword'
           }

           vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser)
           vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false)

           await expect(
             authService.authenticate('test@example.com', 'wrongpassword')
           ).rejects.toThrow('Invalid credentials')
         })
       })

       describe('signup', () => {
         it('creates new user and returns tokens', async () => {
           const signupData = {
             email: 'newuser@example.com',
             password: 'password123',
             name: 'New User'
           }

           const mockUser = {
             id: 'user-456',
             email: signupData.email,
             name: signupData.name,
             passwordHash: 'hashedpassword'
           }

           vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
           vi.mocked(passwordUtils.hashPassword).mockResolvedValue('hashedpassword')
           vi.mocked(userRepository.create).mockResolvedValue(mockUser)
           vi.mocked(jwtUtils.generateToken).mockReturnValue('mock-jwt-token')
           vi.mocked(jwtUtils.generateRefreshToken).mockReturnValue('mock-refresh-token')

           const result = await authService.signup(signupData)

           expect(result).toEqual({
             token: 'mock-jwt-token',
             refreshToken: 'mock-refresh-token',
             user: {
               id: mockUser.id,
               email: mockUser.email,
               name: mockUser.name
             }
           })

           expect(passwordUtils.hashPassword).toHaveBeenCalledWith(signupData.password)
           expect(userRepository.create).toHaveBeenCalledWith({
             email: signupData.email,
             passwordHash: 'hashedpassword',
             name: signupData.name
           })
         })

         it('throws error when email already exists', async () => {
           const mockExistingUser = {
             id: 'user-123',
             email: 'existing@example.com'
           }

           vi.mocked(userRepository.findByEmail).mockResolvedValue(mockExistingUser)

           await expect(
             authService.signup({
               email: 'existing@example.com',
               password: 'password123',
               name: 'Test'
             })
           ).rejects.toThrow('Email already in use')
         })
       })
     })
     ```

4. **Generate Integration Tests for API Endpoints**
   - Test full HTTP request/response cycle with real database
   - Example (`src/api/routes/__tests__/auth.integration.test.ts`):
     ```typescript
     import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
     import request from 'supertest'
     import app from '../../../app'
     import { prisma } from '../../../config/database'
     import { hashPassword } from '../../../utils/password'

     describe('Auth API Integration Tests', () => {
       beforeAll(async () => {
         await prisma.$connect()
       })

       afterAll(async () => {
         await prisma.$disconnect()
       })

       beforeEach(async () => {
         // Clean database
         await prisma.session.deleteMany()
         await prisma.user.deleteMany()
       })

       describe('POST /api/auth/signup', () => {
         it('creates new user and returns 201 with tokens', async () => {
           const signupData = {
             email: 'newuser@example.com',
             password: 'password123',
             name: 'New User'
           }

           const response = await request(app)
             .post('/api/auth/signup')
             .send(signupData)
             .expect(201)

           expect(response.body).toMatchObject({
             token: expect.any(String),
             refreshToken: expect.any(String),
             user: {
               id: expect.any(String),
               email: signupData.email,
               name: signupData.name
             }
           })

           // Verify user was created in database
           const user = await prisma.user.findUnique({
             where: { email: signupData.email }
           })
           expect(user).toBeTruthy()
         })

         it('returns 422 for invalid email format', async () => {
           const response = await request(app)
             .post('/api/auth/signup')
             .send({
               email: 'not-an-email',
               password: 'password123',
               name: 'Test'
             })
             .expect(422)

           expect(response.body).toMatchObject({
             error: 'Validation failed'
           })
         })

         it('returns 422 for password less than 8 characters', async () => {
           const response = await request(app)
             .post('/api/auth/signup')
             .send({
               email: 'test@example.com',
               password: 'short',
               name: 'Test'
             })
             .expect(422)

           expect(response.body).toMatchObject({
             error: 'Validation failed'
           })
         })

         it('returns 400 when email already exists', async () => {
           const userData = {
             email: 'existing@example.com',
             password: 'password123',
             name: 'Existing User'
           }

           // Create user first
           await request(app).post('/api/auth/signup').send(userData)

           // Try to create again
           const response = await request(app)
             .post('/api/auth/signup')
             .send(userData)
             .expect(400)

           expect(response.body).toMatchObject({
             error: expect.stringContaining('Email already in use')
           })
         })
       })

       describe('POST /api/auth/login', () => {
         it('returns 200 with tokens for valid credentials', async () => {
           // Create user first
           const passwordHash = await hashPassword('password123')
           const user = await prisma.user.create({
             data: {
               email: 'test@example.com',
               passwordHash,
               name: 'Test User'
             }
           })

           const response = await request(app)
             .post('/api/auth/login')
             .send({
               email: 'test@example.com',
               password: 'password123'
             })
             .expect(200)

           expect(response.body).toMatchObject({
             token: expect.any(String),
             refreshToken: expect.any(String),
             user: {
               id: user.id,
               email: user.email,
               name: user.name
             }
           })
         })

         it('returns 401 for non-existent user', async () => {
           const response = await request(app)
             .post('/api/auth/login')
             .send({
               email: 'nonexistent@example.com',
               password: 'password123'
             })
             .expect(401)

           expect(response.body).toMatchObject({
             error: expect.stringContaining('Invalid credentials')
           })
         })

         it('returns 401 for incorrect password', async () => {
           const passwordHash = await hashPassword('correctpassword')
           await prisma.user.create({
             data: {
               email: 'test@example.com',
               passwordHash,
               name: 'Test User'
             }
           })

           const response = await request(app)
             .post('/api/auth/login')
             .send({
               email: 'test@example.com',
               password: 'wrongpassword'
             })
             .expect(401)

           expect(response.body).toMatchObject({
             error: expect.stringContaining('Invalid credentials')
           })
         })
       })

       describe('POST /api/auth/refresh', () => {
         it('returns new access token for valid refresh token', async () => {
           // Create user and session
           const user = await prisma.user.create({
             data: {
               email: 'test@example.com',
               passwordHash: await hashPassword('password123'),
               name: 'Test User'
             }
           })

           const session = await prisma.session.create({
             data: {
               userId: user.id,
               refreshToken: 'valid-refresh-token',
               expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
             }
           })

           const response = await request(app)
             .post('/api/auth/refresh')
             .send({
               refreshToken: 'valid-refresh-token'
             })
             .expect(200)

           expect(response.body).toMatchObject({
             token: expect.any(String)
           })
         })

         it('returns 401 for invalid refresh token', async () => {
           const response = await request(app)
             .post('/api/auth/refresh')
             .send({
               refreshToken: 'invalid-token'
             })
             .expect(401)

           expect(response.body).toMatchObject({
             error: expect.stringContaining('Invalid or expired refresh token')
           })
         })
       })
     })
     ```

5. **Generate Integration Tests for Protected Endpoints**
   - Test authentication and authorization middleware
   - Example (`src/api/routes/__tests__/users.integration.test.ts`):
     ```typescript
     import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
     import request from 'supertest'
     import app from '../../../app'
     import { prisma } from '../../../config/database'
     import { generateToken } from '../../../utils/jwt'
     import { hashPassword } from '../../../utils/password'

     describe('Users API Integration Tests', () => {
       let authToken: string
       let userId: string

       beforeAll(async () => {
         await prisma.$connect()
       })

       afterAll(async () => {
         await prisma.$disconnect()
       })

       beforeEach(async () => {
         // Clean database
         await prisma.user.deleteMany()

         // Create test user and generate token
         const user = await prisma.user.create({
           data: {
             email: 'test@example.com',
             passwordHash: await hashPassword('password123'),
             name: 'Test User'
           }
         })

         userId = user.id
         authToken = generateToken({ userId: user.id, email: user.email })
       })

       describe('GET /api/users/:id', () => {
         it('returns user profile when authenticated', async () => {
           const response = await request(app)
             .get(`/api/users/${userId}`)
             .set('Authorization', `Bearer ${authToken}`)
             .expect(200)

           expect(response.body).toMatchObject({
             id: userId,
             email: 'test@example.com',
             name: 'Test User'
           })
         })

         it('returns 401 when not authenticated', async () => {
           const response = await request(app)
             .get(`/api/users/${userId}`)
             .expect(401)

           expect(response.body).toMatchObject({
             error: expect.stringContaining('Missing or invalid authorization header')
           })
         })

         it('returns 401 for invalid token', async () => {
           const response = await request(app)
             .get(`/api/users/${userId}`)
             .set('Authorization', 'Bearer invalid-token')
             .expect(401)

           expect(response.body).toMatchObject({
             error: expect.stringContaining('Invalid or expired token')
           })
         })
       })
     })
     ```

6. **Generate Test Utilities and Mock Data**
   - Create test helpers in `src/__tests__/helpers/`
   - Example (`src/__tests__/helpers/mockData.ts`):
     ```typescript
     import { hashPassword } from '../../utils/password'

     export const createMockUser = async (overrides = {}) => {
       return {
         email: 'mock@example.com',
         passwordHash: await hashPassword('password123'),
         name: 'Mock User',
         ...overrides
       }
     }

     export const createMockSession = (userId: string, overrides = {}) => {
       return {
         userId,
         refreshToken: 'mock-refresh-token',
         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
         ...overrides
       }
     }
     ```

7. **Update package.json with Test Scripts**
   - Add test commands to `package.json`:
     ```json
     {
       "scripts": {
         "test": "vitest run",
         "test:watch": "vitest",
         "test:coverage": "vitest run --coverage",
         "test:unit": "vitest run --testPathPattern='.test.ts$'",
         "test:integration": "vitest run --testPathPattern='.integration.test.ts$'"
       }
     }
     ```

### Phase 7: Validate Generated Code

1. **Verify TypeScript Compilation**
   - Run TypeScript compiler to check for type errors:
     ```bash
     npx tsc --noEmit
     ```
   - If errors found:
     - List all compilation errors with file paths and line numbers
     - Fix type mismatches, missing imports, incorrect types
     - Re-run until no errors

2. **Run ESLint**
   - Check code quality and style:
     ```bash
     npx eslint src/ --ext .ts
     ```
   - If errors found:
     - Auto-fix where possible: `npx eslint src/ --ext .ts --fix`
     - Manually fix remaining issues
     - Common issues: unused variables, missing return types, inconsistent naming

3. **Run Prettier**
   - Format all generated code:
     ```bash
     npx prettier --write "src/**/*.ts"
     ```
   - Ensures consistent formatting across all files

4. **Run Unit Tests**
   - Execute all unit tests:
     ```bash
     npm run test:unit
     ```
   - If failures found:
     - Review failed test output
     - Fix implementation or test logic
     - Re-run until all tests pass
   - Verify test coverage meets 80% threshold

5. **Run Integration Tests**
   - Execute all integration tests:
     ```bash
     npm run test:integration
     ```
   - If failures found:
     - Check database connection
     - Verify test data setup
     - Fix endpoint implementation or test logic
     - Re-run until all tests pass

6. **Verify Test Coverage**
   - Generate coverage report:
     ```bash
     npm run test:coverage
     ```
   - Check that overall coverage meets 80% threshold
   - If below threshold:
     - Identify uncovered code paths
     - Add additional test cases
     - Focus on critical business logic first

7. **Validate Against API Contract**
   - Compare generated endpoints with API contract (docs/350-api-contract-v*.md)
   - Verify:
     - ✅ All endpoints match contract (method, path, parameters)
     - ✅ Request schemas match contract
     - ✅ Response schemas match contract
     - ✅ Status codes match contract
     - ✅ Error responses match contract
   - If mismatches found, fix implementation to match contract exactly

8. **Validate Against Database Schema**
   - Compare generated models/repositories with database schema (docs/375-database-schema-v*.md)
   - Verify:
     - ✅ All tables have corresponding models
     - ✅ Column types match schema
     - ✅ Relationships are correctly defined
     - ✅ Indexes are created
     - ✅ Business rules are enforced
   - If mismatches found, update models to match schema

9. **Check Against Backend Architecture Conventions**
   - Review generated code against docs/325-backend-v1.0.0.md conventions
   - Verify:
     - ✅ Files are in correct folders
     - ✅ Naming conventions followed
     - ✅ Architecture patterns implemented correctly
     - ✅ Error handling is consistent
     - ✅ Logging is properly implemented
   - If deviations found, refactor to follow conventions

10. **Verify Environment Variables**
    - Check that all required environment variables are documented in `.env.example`
    - Verify no hardcoded secrets in code
    - Ensure sensitive data uses environment variables

11. **Generate Validation Report**
    - List all validation checks performed
    - Note any warnings or issues that need attention
    - Confirm code is ready for use or list required fixes

### Phase 8: Update Progress Tracking

1. **Read Current Progress Document**
   - Use Glob to find latest progress document: `docs/progress/000-progress-v*.md`
   - Read the document to get current state

2. **Mark Backend UACs as Complete**
   - For each UAC that was implemented in this build session:
     - Change status from `❌ Not Started` to `✅ Complete`
     - Add completion timestamp if format supports it
   - Example:
     ```markdown
     Before:
     - ❌ BE: API endpoint POST /api/auth/login responds with JWT token

     After:
     - ✅ BE: API endpoint POST /api/auth/login responds with JWT token
     ```

3. **Update Progress Summary**
   - Update completion percentages or counts
   - Example:
     ```markdown
     Authentication & Authorization: 8/12 UACs complete (67%)
     ```

4. **Save Updated Progress Document**
   - Use Edit tool to update the progress document
   - Preserve all existing content, only modify status of implemented UACs

5. **Update Epic Story File** (only if `--story-file` was provided in Phase 0)
   - Update story file YAML frontmatter at current path (now in `in-progress/`):
     - Set `test_unit_status: "passing"` (or `"failing"` if unit tests failed)
     - Set `test_integration_status: "passing"` (or `"failing"` if integration tests failed)
     - Set `test_e2e_status: "pending"` (E2E tests run at /build-fe)
     - Update `uac_completed` count — count checked `- [x] BE:` and `- [x] DB:` boxes in body
     - Recalculate `uac_pending` and `uac_completion_pct`
     - Set `updated_at: {ISO now}`
   - Also update body: mark implemented UACs as checked (`- [ ] BE:` → `- [x] BE:`, `- [ ] DB:` → `- [x] DB:`)
   - Move story file from `in-progress/` → `qa/`:
     ```bash
     mv {epicDir}/in-progress/{filename} {epicDir}/qa/{filename}
     ```
   - Update frontmatter `story_status: qa`
   - Run: `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}`
   - Display:
     ```
     ✅ Story {storyId} transitioned: in-progress → qa
     UACs: {completed}/{total} BE:/DB: UACs checked
     Epic stats refreshed for {epicId}
     ```

### Phase 9: Generate Summary Report

1. **Collect Implementation Details**
   - Count files created:
     - Type definitions
     - Models
     - Repositories
     - Services
     - Controllers
     - Routes
     - Middleware
     - Utilities
     - Tests (unit and integration)
   - Note which UACs were implemented
   - Record test results and coverage

2. **Display Comprehensive Summary**
   ```
   ✅ Backend implementation completed successfully!

   📝 Git Information:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Working Branch:  feature/build-be-auth-api
   Protected:       No
   Status:          Ready for commit

   Next: Review changes and commit with descriptive message

   📊 Implementation Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UACs Implemented:  12
   Files Created:     47
   Tests Generated:   38 (24 unit, 14 integration)
   Test Coverage:     87% (exceeds 80% target)

   📁 Generated Files:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Types:          5 files  (auth.types.ts, user.types.ts, ...)
   Models:         4 files  (User.entity.ts, Session.entity.ts, ...)
   Repositories:   4 files  (UserRepository.ts, SessionRepository.ts, ...)
   Services:       3 files  (AuthService.ts, UserService.ts, ...)
   Controllers:    3 files  (AuthController.ts, UserController.ts, ...)
   Routes:         3 files  (auth.ts, users.ts, ...)
   Middleware:     5 files  (authenticate.ts, validate.ts, ...)
   Utilities:      4 files  (jwt.ts, password.ts, ...)
   Config:         2 files  (database.ts, env.ts)
   Tests:         38 files  (24 unit, 14 integration)

   🧪 Test Results:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Unit Tests:        24 passed
   Integration Tests: 14 passed
   Total:             38 passed
   Coverage:          87% (lines: 89%, functions: 85%, branches: 84%)

   ✅ Validation Checks:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ TypeScript compilation successful
   - ✅ ESLint passed (no errors)
   - ✅ Prettier formatting applied
   - ✅ Unit tests passed (24/24)
   - ✅ Integration tests passed (14/14)
   - ✅ Coverage exceeds 80% threshold
   - ✅ API contract compliance verified
   - ✅ Database schema compliance verified
   - ✅ Backend architecture conventions followed

   📋 Implemented UACs:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Authentication & Authorization:
   - ✅ BE: API endpoint POST /api/auth/login responds with JWT token
   - ✅ BE: API endpoint POST /api/auth/signup creates new user account
   - ✅ BE: API endpoint POST /api/auth/refresh refreshes access token
   - ✅ BE: User service validates email format before creating account
   - ✅ BE: Passwords are hashed using bcrypt before storage
   - ✅ BE: JWT tokens expire after 15 minutes

   User Management:
   - ✅ BE: API endpoint GET /api/users/:id returns user profile
   - ✅ BE: API endpoint PUT /api/users/:id updates user profile
   - ✅ BE: User service validates email uniqueness
   - ✅ BE: Soft delete users instead of hard delete
   - ✅ BE: Authorization middleware checks user permissions
   - ✅ BE: Rate limiting prevents abuse (100 requests/minute)

   📝 Progress Updated:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Updated docs/progress/000-progress-v1.1.0.md
   - 12 UACs marked as complete
   - Authentication & Authorization: 100% complete
   - User Management: 85% complete

   🎯 Next Steps:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. Review generated code and tests
   2. Set up environment variables in .env (use .env.example as template)
   3. Run database migrations: npx prisma migrate dev
   4. Start development server: npm run dev
   5. Test API endpoints using Postman or curl
   6. Continue with remaining UACs using: /build-be
   7. Set up DevOps infrastructure using: /build-devops

   ✨ Backend build complete! Ready for testing and integration. ✨
   ```

3. **Provide Next Steps Guidance**
   - Suggest immediate actions (review code, set up environment)
   - Suggest follow-up commands (/build-be for remaining UACs, /build-devops)
   - Provide testing instructions

## Input Format

**Command:**
```
/build-be
```

**With Specific UAC Selection:**
```
/build-be
Focus on authentication endpoints only
```

**With Feature Grouping:**
```
/build-be
Implement user management UACs
```

**Examples:**
```
/build-be
/build-be Focus on payment integration endpoints
/build-be Implement all pending authentication UACs
```

## Output Format

```
✅ Backend implementation completed successfully!

📊 Implementation Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UACs Implemented:  12
Files Created:     47
Tests Generated:   38 (24 unit, 14 integration)
Test Coverage:     87% (exceeds 80% target)

📁 Generated Files:
[Detailed file listing...]

🧪 Test Results:
[Test results and coverage...]

✅ Validation Checks:
[Validation checklist...]

📋 Implemented UACs:
[List of completed UACs...]

📝 Progress Updated:
[Progress tracking updates...]

🎯 Next Steps:
[Actionable next steps...]

✨ Backend build complete! Ready for testing and integration. ✨
```

## Important Notes

- **CRITICAL**: Always re-read docs/325-backend-v1.0.0.md at the start of EVERY /build-be session (evolving document)
- **API Contract is Law**: Backend MUST exactly match docs/350-api-contract-v*.md
- **No Frontend References**: Backend should NOT read or reference frontend documentation
- **Database Schema Compliance**: Generated models MUST match docs/375-database-schema-v*.md exactly
- **Third-Party Integrations**: Use docs/175-c4-diagrams-v*.md to understand external system connections
- **Test-First Guardrails**: Unit and integration tests are MANDATORY to prevent regressions
- **Coverage Requirements**: Minimum 80% test coverage enforced
- **Separation of Concerns**: Backend doesn't need to know about frontend internals, only API contract
- **Security First**: Never hardcode secrets, always use environment variables
- **Error Handling**: Use consistent error patterns from backend architecture doc
- **Logging**: Follow logging standards from backend architecture doc
- **Repository Pattern**: Repositories handle ONLY database operations, no business logic
- **Service Layer**: Services handle business logic, orchestrate repositories, handle transactions
- **Validation**: Validate all inputs using schema validation (Zod, Joi, Pydantic)
- **Authentication**: JWT tokens expire after 15 minutes, refresh tokens after 7 days
- **Soft Deletes**: Use soft deletes (deletedAt column) instead of hard deletes
- **Indexes**: Create database indexes for frequently queried columns
- **Transactions**: Use database transactions for multi-step operations
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **CORS**: Configure CORS based on API contract requirements
- **Documentation**: Generate OpenAPI/Swagger docs from implemented endpoints
- **Environment**: Support multiple environments (development, staging, production)

## Error Handling

**No Pending Backend UACs Found:**
- Display message: "No pending backend UACs found in atomic stories"
- Suggest: "All backend UACs may be complete, or no BE: tagged UACs exist"
- Check progress document to confirm completion status
- Exit gracefully

**API Contract Document Not Found:**
- Display error: "API contract document not found: docs/350-api-contract-v*.md"
- This is CRITICAL - backend cannot be built without API contract
- Suggest: "Run /define @docs/350-api-contract to create API contract first"
- Exit with error

**Database Schema Document Not Found:**
- Display error: "Database schema document not found: docs/375-database-schema-v*.md"
- This is CRITICAL - backend cannot be built without database schema
- Suggest: "Run /define @docs/375-database-schema to create database schema first"
- Exit with error

**Backend Architecture Document Not Found:**
- Display error: "Backend architecture document not found: docs/325-backend-v*.md"
- This is CRITICAL - need conventions and best practices
- Suggest: "Run /define @docs/325-backend to create backend architecture document first"
- Exit with error

**TypeScript Compilation Errors:**
- Display error: "TypeScript compilation failed"
- List all compilation errors with file paths and line numbers
- Common fixes:
  - Missing type imports
  - Type mismatches in function signatures
  - Incorrect Prisma/TypeORM types
- Suggest: "Review and fix type errors, then re-run /build-be"

**Test Failures:**
- Display error: "Tests failed - {X} tests failing"
- List failing test names and error messages
- Do NOT mark UACs as complete if tests fail
- Suggest: "Fix failing tests before marking UACs complete"
- Provide debugging guidance based on failure type

**Coverage Below Threshold:**
- Display warning: "Test coverage is {X}% (below 80% threshold)"
- List uncovered files and functions
- Suggest adding tests for critical uncovered code
- Allow user to decide whether to proceed or add more tests

**API Contract Mismatch:**
- Display warning: "Generated endpoint doesn't match API contract"
- List specific mismatches (path, method, schema, status codes)
- Fix implementation to match contract exactly
- Re-validate after fixes

**Database Schema Mismatch:**
- Display warning: "Generated model doesn't match database schema"
- List specific mismatches (columns, types, relationships)
- Fix models to match schema exactly
- Re-validate after fixes

**Missing Environment Variables:**
- Display warning: "Required environment variable not documented"
- List missing variables
- Add to .env.example
- Verify no secrets are hardcoded

**Third-Party Integration Missing:**
- Display warning: "C4 diagram mentions integration with {service}, but no implementation found"
- Suggest creating adapter/client for the service
- Provide example integration pattern
- Allow user to defer or implement now

**Progress Update Failed:**
- Complete backend build successfully
- Display warning: "Could not update progress document"
- Provide exact UACs to mark as complete manually
- Suggest re-running /update-progress

## Success Criteria

The `/build-be` command is successful when:

1. ✅ Latest atomic stories document identified and read
2. ✅ Backend UACs (BE: tagged) filtered from atomic stories
3. ✅ Already-completed UACs filtered out from progress tracking
4. ✅ API contract document (350-api-contract) read and validated
5. ✅ Database schema document (375-database-schema) read and validated
6. ✅ Backend architecture document (325-backend) re-read for latest conventions
7. ✅ C4 diagrams document (175-c4-diagrams) read for integration points
8. ✅ Tech stacks document (150-tech-stacks) read for technology decisions
9. ✅ UACs mapped to API endpoints, services, and repositories
10. ✅ Type definitions generated and match API contract + database schema
11. ✅ Database models generated (Prisma schema or TypeORM entities)
12. ✅ Repository layer generated with database operations
13. ✅ Service layer generated with business logic
14. ✅ Middleware generated (auth, validation, error handling, logging)
15. ✅ Controllers generated to handle HTTP requests
16. ✅ Routes generated wiring together controllers and middleware
17. ✅ Utility functions generated (JWT, password hashing, etc.)
18. ✅ Configuration files generated (database, environment)
19. ✅ Main application entry point generated or updated
20. ✅ Environment configuration documented in .env.example
21. ✅ Test configuration set up (vitest.config.ts, test setup files)
22. ✅ Unit tests generated for repositories (test database operations)
23. ✅ Unit tests generated for services (test business logic with mocks)
24. ✅ Integration tests generated for API endpoints (test full HTTP cycle)
25. ✅ Integration tests generated for protected endpoints (test auth/authz)
26. ✅ Test utilities and mock data helpers created
27. ✅ TypeScript compilation passes with no errors
28. ✅ ESLint passes (code quality and style validated)
29. ✅ Prettier formatting applied to all files
30. ✅ All unit tests pass
31. ✅ All integration tests pass
32. ✅ Test coverage meets or exceeds 80% threshold
33. ✅ Generated endpoints match API contract exactly
34. ✅ Generated models match database schema exactly
35. ✅ Code follows backend architecture conventions
36. ✅ No hardcoded secrets or sensitive data in code
37. ✅ Progress tracking document updated with completed UACs
38. ✅ Comprehensive summary report generated
39. ✅ Next steps guidance provided to user
40. ✅ Backend code is ready for development server startup and testing
