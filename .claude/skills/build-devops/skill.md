# Build DevOps Command

Build and scaffold DevOps infrastructure, CI/CD pipelines, and deployment automation with comprehensive testing based on specifications.

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
   - Examples: `main`, `develop`, `staging`, `feature/ci-cd-pipeline`

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

       git checkout -b feature/build-devops-{description}

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

       Proceeding with DevOps build...
       ```

### Phase 2: Parse Input and Identify Pending DevOps UACs

1. **Detect Draft Documents**
   - Use Glob to find all draft documents: `docs/**/*-draft.md`
   - If draft documents exist:
     - Display warning:
       ```
       ⚠️  DRAFT DOCUMENTS DETECTED ⚠️

       The following draft documents will be EXCLUDED from build:
       - docs/002-prd-v1.3.0-draft.md
       - docs/425-devops-v1.1.0-draft.md

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

3. **Filter DevOps-Tagged UACs**
   - If `--story-file` was provided:
     - Read body of story file at `storyFilePath`
     - Extract all `- [ ] DevOps:` checkbox lines from `## User Acceptance Criteria` section
     - Pending UACs = unchecked lines only; skip `- [x] DevOps:` (already done)
     - Display: "Reading UACs from story file: {storyFilePath}"
   - Otherwise: Search for all UACs tagged with `DevOps:` prefix in atomic stories
     - Extract UAC text, associated user story, and acceptance criteria details
     - Create a structured list of pending DevOps UACs

4. **Identify Already Implemented UACs**
   - If `--story-file` was provided: completed UACs = checked `- [x] DevOps:` lines in story body
   - Otherwise: Read `docs/progress/000-progress-v*.md` (use latest production version, **exclude** `-draft` files)
   - Find UACs marked as ✅ Complete or 🚧 In Progress
   - Filter out completed UACs from the pending list
   - Focus only on ❌ Not Started UACs for this build session

5. **Group UACs by DevOps Domain**
   - Organize pending DevOps UACs by logical grouping:
     - **Containerization** (Dockerfile, docker-compose, image optimization)
     - **CI/CD Pipelines** (GitHub Actions, GitLab CI, build/test/deploy stages)
     - **Infrastructure as Code** (Terraform, CloudFormation, networking, compute, database)
     - **Environment Management** (development, staging, production configs)
     - **Deployment Automation** (blue/green, rolling, canary deployments)
     - **Monitoring & Alerting** (metrics, logs, health checks, alerts)
     - **Security & Secrets** (secrets management, vulnerability scanning, HTTPS/TLS)
   - This grouping helps determine which infrastructure components to build

6. **Display Filtered UACs to User**
   - Show formatted list:
     ```
     📋 Pending DevOps UACs:
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     Containerization:
     - DevOps: Docker multi-stage build creates optimized production image
     - DevOps: docker-compose.yml enables local development environment

     CI/CD Pipelines:
     - DevOps: GitHub Actions workflow runs linting and tests on PR
     - DevOps: Pipeline deploys to staging on main branch push

     Infrastructure as Code:
     - DevOps: Terraform provisions VPC, subnets, and security groups
     - DevOps: Terraform creates RDS database with automatic backups

     [Additional groups...]
     ```
   - If no pending DevOps UACs found, inform user and exit gracefully

### Phase 3: Gather Context from Documentation

1. **Check for Relevant DevOps Learnings** (Optional but Recommended)
   - Check if `docs/learnings/000-README.md` exists
   - If exists, scan for DevOps-related learnings:
     - Search "DevOps" domain section
     - Search for keywords from current UACs (Docker, CI/CD, Terraform, deployment)
     - Look for learnings about infrastructure, monitoring, performance
   - Display relevant learnings:
     ```
     💡 DevOps Learnings:
     - LEARN-025: Docker networking bridge mode configuration
     - LEARN-012: GitHub Actions caching optimization
     - LEARN-040: Terraform state management best practices

     Reference these learnings to avoid known issues.
     ```
   - If no learnings or README missing, skip silently
   - Continue with build regardless

2. **Read DevOps Strategy Document**
   - **CRITICAL**: Read `docs/425-devops-v1.0.0.md` (use latest version)
   - **This is an evolving document** - must be re-read at the start of EVERY /build-devops session
   - Extract:
     - Infrastructure as Code strategy (Terraform, Pulumi, CloudFormation)
     - CI/CD pipeline architecture and stages
     - Docker build and packaging strategy (multi-stage builds, optimization)
     - Deployment methods (blue/green, rolling, canary)
     - Environment configurations (dev, staging, production)
     - Monitoring and alerting strategy
     - Secrets management approach (AWS Secrets Manager, HashiCorp Vault)
     - Database migration strategy
     - Rollback procedures
     - Release versioning and cadence
   - Example:
     ```
     IaC: Terraform
     CI/CD: GitHub Actions
     Container: Docker multi-stage builds
     Deployment: Blue/Green for production
     Monitoring: Prometheus + Grafana
     Secrets: AWS Secrets Manager
     ```

2. **Read Technology Stack Document**
   - Read `docs/150-tech-stacks-v1.0.0.md` (use latest version)
   - Extract:
     - Cloud provider (AWS, GCP, Azure, DigitalOcean)
     - Container orchestration (Kubernetes, ECS, Docker Swarm, none)
     - Database technology (PostgreSQL, MySQL, MongoDB)
     - Caching layer (Redis, Memcached)
     - Message queue (RabbitMQ, SQS, Redis)
     - Load balancer (ALB, Nginx, Traefik)
     - CDN (CloudFront, Cloudflare)
     - CI/CD platform (GitHub Actions, GitLab CI, CircleCI, Jenkins)
   - Ensure all generated infrastructure matches these choices
   - Example:
     ```
     Cloud: AWS
     Orchestration: ECS Fargate
     Database: PostgreSQL 15 (RDS)
     Cache: Redis (ElastiCache)
     CI/CD: GitHub Actions
     ```

3. **Read C4 Architecture Diagrams**
   - Read `docs/175-c4-diagrams-v1.0.0.md` (use latest version)
   - Extract:
     - System Context: External systems and dependencies
     - Container Diagram: Services, databases, caches, queues
     - Component relationships and data flow
     - Integration points with third-party services
     - Network architecture and communication patterns
   - Identify infrastructure components needed:
     - Which services need to be containerized
     - Which databases need to be provisioned
     - Which external services need network access
     - Load balancer and routing requirements
   - Example:
     ```
     Services:
     - Frontend (Next.js) - ECS service
     - Backend API (Express) - ECS service
     - Background workers (optional) - ECS service

     Data stores:
     - PostgreSQL RDS
     - Redis ElastiCache
     - S3 for static assets
     ```

4. **Read Frontend Architecture Document**
   - Read `docs/300-frontend-v1.0.0.md` (use latest version)
   - Extract:
     - Build process (npm run build, asset compilation)
     - Static asset handling (images, fonts, CSS)
     - Environment variables needed
     - CDN requirements
     - Server-side rendering considerations (if Next.js)
   - Determine containerization strategy for frontend
   - Example:
     ```
     Build: npm run build (creates ./out or ./build directory)
     Assets: Static files in /public
     Env vars: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_ANALYTICS_ID
     Deploy: Static hosting (S3 + CloudFront) or container (ECS)
     ```

5. **Read Backend Architecture Document**
   - Read `docs/325-backend-v1.0.0.md` (use latest version)
   - Extract:
     - Build process (npm run build, TypeScript compilation)
     - Database migration requirements (Prisma, TypeORM, Alembic)
     - Environment variables needed
     - Port and health check endpoints
     - Dependencies (Redis, database, external APIs)
   - Determine containerization strategy for backend
   - Example:
     ```
     Build: npm run build (creates ./dist directory)
     Migrations: Prisma migrate deploy
     Port: 3000
     Health check: GET /health
     Env vars: DATABASE_URL, JWT_SECRET, REDIS_URL
     ```

6. **Read API Contract Document**
   - Read `docs/350-api-contract-v1.0.0.md` (use latest version)
   - Extract:
     - API endpoints and routes
     - CORS configuration requirements
     - Rate limiting specifications
     - Authentication flow (JWT, OAuth)
   - Determine load balancer routing and API gateway needs
   - Example:
     ```
     API Base: /api/v1
     CORS: Allow frontend domain
     Rate limit: 100 req/min per IP
     Auth: JWT bearer token
     ```

7. **Consolidate Context**
   - Create a mental map of:
     - Which containers need to be built (frontend, backend, workers)
     - Which infrastructure components to provision (VPC, RDS, ElastiCache, ECS, ALB)
     - Which CI/CD stages are needed (lint, test, build, security scan, deploy)
     - Which environments to configure (dev, staging, production)
     - Which secrets need to be managed
   - Identify any gaps or inconsistencies between documents
   - If critical information is missing, note it for user clarification

### Phase 4: Analyze DevOps Requirements

1. **Map UACs to Infrastructure Components**
   - For each pending DevOps UAC, determine:
     - Which infrastructure resource it relates to (compute, database, networking, storage)
     - Which IaC module needs to be created
     - Which CI/CD stage it affects
     - Which environment configuration it requires
   - Example mapping:
     ```
     UAC: "DevOps: Terraform provisions RDS PostgreSQL with automatic backups"
     →
     Module: terraform/modules/database/main.tf
     Resource: aws_db_instance
     Backup: automated_backup_retention_period = 7
     ```

2. **Determine Containerization Strategy**
   - Based on frontend and backend architectures:
     - **Frontend Container:**
       - Multi-stage build (build stage + production stage)
       - Nginx or static file server
       - Environment variable injection
       - CDN integration (optional)
     - **Backend Container:**
       - Multi-stage build (dependencies + build + production)
       - Node.js or Python runtime
       - Database migration step
       - Health check endpoint
     - **Worker Container (if applicable):**
       - Background job processing
       - Queue connection
       - Retry logic
   - Determine image optimization strategies:
     - Use Alpine Linux base images
     - Multi-stage builds to minimize image size
     - Layer caching for faster builds
     - Security scanning with Trivy or Snyk

3. **Design CI/CD Pipeline Architecture**
   - Based on DevOps strategy document:
     - **Pipeline Stages:**
       1. **Code Quality:** Linting, formatting, type checking
       2. **Testing:** Unit tests, integration tests (with coverage)
       3. **Build:** Compile code, bundle assets
       4. **Security:** Dependency scan, SAST, container scan
       5. **Containerize:** Build Docker images, tag with version
       6. **Push:** Push images to registry (ECR, GCR, Docker Hub)
       7. **Deploy:** Deploy to target environment
       8. **Post-Deploy:** Smoke tests, health checks, rollback on failure
     - **Triggers:**
       - Pull Request: Stages 1-4 (quality gates, no deployment)
       - Main Branch Push: Stages 1-7, deploy to staging
       - Release Tag: Stages 1-8, deploy to production
   - Determine parallelization opportunities (frontend and backend builds)
   - Example:
     ```yaml
     # .github/workflows/ci-cd.yml
     on:
       pull_request:
         # Run tests only
       push:
         branches: [main]
         # Deploy to staging
       release:
         types: [published]
         # Deploy to production
     ```

4. **Plan Infrastructure as Code Structure**
   - Based on Terraform or chosen IaC tool:
     - **Module Structure:**
       ```
       terraform/
       ├── modules/
       │   ├── networking/    # VPC, subnets, security groups, NAT
       │   ├── compute/       # ECS clusters, services, tasks
       │   ├── database/      # RDS instances, parameter groups
       │   ├── cache/         # ElastiCache Redis
       │   ├── storage/       # S3 buckets, EFS
       │   ├── load-balancer/ # ALB, target groups, listeners
       │   └── monitoring/    # CloudWatch, alarms, dashboards
       ├── environments/
       │   ├── dev/
       │   ├── staging/
       │   └── production/
       ├── main.tf
       ├── variables.tf
       ├── outputs.tf
       └── backend.tf
       ```
   - Determine which modules are needed based on C4 diagrams
   - Plan environment-specific configurations
   - Example:
     ```hcl
     # Production requires high availability
     module "database" {
       source = "../../modules/database"
       multi_az = true
       instance_class = "db.t3.medium"
     }

     # Dev uses minimal resources
     module "database" {
       source = "../../modules/database"
       multi_az = false
       instance_class = "db.t3.micro"
     }
     ```

5. **Determine Environment Configuration Strategy**
   - Environment variables per environment:
     - **Development:** Localhost URLs, debug logging, minimal resources
     - **Staging:** Production-like, staging domain, info logging
     - **Production:** Production domain, warn/error logging, high availability
   - Secrets management:
     - Database passwords → AWS Secrets Manager or Vault
     - API keys → Secrets Manager
     - JWT secrets → Secrets Manager
     - Third-party service credentials → Secrets Manager
   - Example:
     ```bash
     # Development
     NODE_ENV=development
     DATABASE_URL=postgresql://localhost:5432/dev_db
     LOG_LEVEL=debug

     # Production (stored in Secrets Manager)
     NODE_ENV=production
     DATABASE_URL={{ secrets.database_url }}
     JWT_SECRET={{ secrets.jwt_secret }}
     LOG_LEVEL=warn
     ```

6. **Plan Deployment Strategy**
   - Based on deployment method from DevOps document:
     - **Blue/Green Deployment:**
       - Maintain two identical environments
       - Deploy to inactive environment
       - Run smoke tests
       - Switch traffic
       - Keep previous environment for instant rollback
     - **Rolling Deployment:**
       - Update instances incrementally
       - Monitor health checks
       - Stop if errors detected
     - **Canary Deployment:**
       - Deploy to 10% of instances
       - Monitor metrics for 30 minutes
       - Gradually increase to 100%
   - Database migration strategy:
     - Run migrations BEFORE application deployment
     - Backward-compatible migrations only
     - Rollback scripts for every migration
     - Test migrations on staging first

7. **Identify Monitoring and Alerting Requirements**
   - Based on SLA requirements from tech stacks document:
     - **Metrics to track:**
       - Request rate, error rate, latency (p50, p95, p99)
       - CPU, memory, disk utilization
       - Database connection pool stats
       - Container restart count
     - **Alerts to configure:**
       - Critical: Error rate > 5%, API p95 > 2s, database connection failures
       - Warning: CPU > 80%, memory > 85%, unusual traffic patterns
       - Info: Deployments completed, scaling events
   - Determine monitoring stack:
     - Application: Datadog, New Relic, or Sentry
     - Infrastructure: CloudWatch, Prometheus + Grafana
     - Logs: ELK Stack, CloudWatch Logs
   - Example alert:
     ```yaml
     - alert: HighErrorRate
       expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
       for: 5m
       severity: critical
       annotations:
         summary: "Error rate above 5% for 5 minutes"
     ```

### Phase 5: Generate DevOps Implementation

1. **Generate Dockerfiles**
   - Create optimized multi-stage Dockerfiles for each service
   - **Frontend Dockerfile** (`frontend/Dockerfile`):
     ```dockerfile
     # Build stage
     FROM node:18-alpine AS builder
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci
     COPY . .
     RUN npm run build

     # Production stage
     FROM nginx:alpine
     COPY --from=builder /app/out /usr/share/nginx/html
     COPY nginx.conf /etc/nginx/nginx.conf
     EXPOSE 80
     CMD ["nginx", "-g", "daemon off;"]
     ```
   - **Backend Dockerfile** (`backend/Dockerfile`):
     ```dockerfile
     # Dependencies stage
     FROM node:18-alpine AS deps
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci --only=production

     # Build stage
     FROM node:18-alpine AS builder
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci
     COPY . .
     RUN npm run build

     # Production stage
     FROM node:18-alpine
     WORKDIR /app
     ENV NODE_ENV=production
     COPY --from=deps /app/node_modules ./node_modules
     COPY --from=builder /app/dist ./dist
     COPY package*.json ./
     EXPOSE 3000
     HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
       CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
     CMD ["node", "dist/server.js"]
     ```
   - Add `.dockerignore` file:
     ```
     node_modules
     npm-debug.log
     .env
     .env.*
     .git
     .gitignore
     README.md
     .next
     .cache
     dist
     coverage
     ```

2. **Generate docker-compose.yml for Local Development**
   - Create comprehensive docker-compose setup for local environment
   - Include all services: frontend, backend, database, cache
   - Example (`docker-compose.yml`):
     ```yaml
     version: '3.8'

     services:
       frontend:
         build:
           context: ./frontend
           dockerfile: Dockerfile.dev
         ports:
           - "3001:3000"
         volumes:
           - ./frontend:/app
           - /app/node_modules
         environment:
           - NEXT_PUBLIC_API_URL=http://localhost:3000/api
         depends_on:
           - backend

       backend:
         build:
           context: ./backend
           dockerfile: Dockerfile.dev
         ports:
           - "3000:3000"
         volumes:
           - ./backend:/app
           - /app/node_modules
         environment:
           - NODE_ENV=development
           - DATABASE_URL=postgresql://postgres:password@db:5432/app_dev
           - REDIS_URL=redis://redis:6379
           - JWT_SECRET=dev-secret-key
         depends_on:
           - db
           - redis

       db:
         image: postgres:15-alpine
         ports:
           - "5432:5432"
         environment:
           - POSTGRES_USER=postgres
           - POSTGRES_PASSWORD=password
           - POSTGRES_DB=app_dev
         volumes:
           - postgres-data:/var/lib/postgresql/data

       redis:
         image: redis:7-alpine
         ports:
           - "6379:6379"

     volumes:
       postgres-data:
     ```

3. **Generate CI/CD Pipeline Configuration**
   - Create GitHub Actions workflows (or other CI/CD platform)
   - **Pull Request Workflow** (`.github/workflows/pr.yml`):
     ```yaml
     name: Pull Request CI

     on:
       pull_request:
         branches: [main, develop]

     jobs:
       lint-and-test:
         runs-on: ubuntu-latest
         strategy:
           matrix:
             service: [frontend, backend]
         steps:
           - uses: actions/checkout@v3

           - uses: actions/setup-node@v3
             with:
               node-version: '18'
               cache: 'npm'
               cache-dependency-path: ${{ matrix.service }}/package-lock.json

           - name: Install dependencies
             working-directory: ./${{ matrix.service }}
             run: npm ci

           - name: Lint
             working-directory: ./${{ matrix.service }}
             run: npm run lint

           - name: Type check
             working-directory: ./${{ matrix.service }}
             run: npm run type-check

           - name: Unit tests
             working-directory: ./${{ matrix.service }}
             run: npm run test:unit -- --coverage

           - name: Upload coverage
             uses: codecov/codecov-action@v3
             with:
               directory: ./${{ matrix.service }}/coverage

       security-scan:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3

           - name: Run Snyk security scan
             uses: snyk/actions/node@master
             env:
               SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
     ```
   - **Main Branch Deployment Workflow** (`.github/workflows/deploy-staging.yml`):
     ```yaml
     name: Deploy to Staging

     on:
       push:
         branches: [main]

     jobs:
       build-and-deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3

           - name: Configure AWS credentials
             uses: aws-actions/configure-aws-credentials@v2
             with:
               role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
               aws-region: us-east-1

           - name: Login to Amazon ECR
             id: login-ecr
             uses: aws-actions/amazon-ecr-login@v1

           - name: Build and push frontend image
             env:
               ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
               ECR_REPOSITORY: frontend
               IMAGE_TAG: ${{ github.sha }}
             run: |
               docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./frontend
               docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

           - name: Build and push backend image
             env:
               ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
               ECR_REPOSITORY: backend
               IMAGE_TAG: ${{ github.sha }}
             run: |
               docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
               docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

           - name: Deploy to ECS
             run: |
               aws ecs update-service --cluster staging --service frontend --force-new-deployment
               aws ecs update-service --cluster staging --service backend --force-new-deployment

           - name: Run smoke tests
             run: |
               ./scripts/smoke-tests.sh https://staging.example.com
     ```

4. **Generate Infrastructure as Code (Terraform)**
   - Create Terraform modules for all infrastructure components
   - **Networking Module** (`terraform/modules/networking/main.tf`):
     ```hcl
     resource "aws_vpc" "main" {
       cidr_block           = var.vpc_cidr
       enable_dns_hostnames = true
       enable_dns_support   = true

       tags = {
         Name        = "${var.environment}-vpc"
         Environment = var.environment
       }
     }

     resource "aws_subnet" "public" {
       count                   = length(var.availability_zones)
       vpc_id                  = aws_vpc.main.id
       cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
       availability_zone       = var.availability_zones[count.index]
       map_public_ip_on_launch = true

       tags = {
         Name = "${var.environment}-public-subnet-${count.index + 1}"
       }
     }

     resource "aws_subnet" "private" {
       count             = length(var.availability_zones)
       vpc_id            = aws_vpc.main.id
       cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
       availability_zone = var.availability_zones[count.index]

       tags = {
         Name = "${var.environment}-private-subnet-${count.index + 1}"
       }
     }

     resource "aws_internet_gateway" "main" {
       vpc_id = aws_vpc.main.id

       tags = {
         Name = "${var.environment}-igw"
       }
     }
     ```
   - **Database Module** (`terraform/modules/database/main.tf`):
     ```hcl
     resource "aws_db_instance" "main" {
       identifier             = "${var.environment}-postgres"
       engine                 = "postgres"
       engine_version         = "15.3"
       instance_class         = var.instance_class
       allocated_storage      = var.allocated_storage
       storage_encrypted      = true

       db_name  = var.database_name
       username = var.master_username
       password = var.master_password

       vpc_security_group_ids = [aws_security_group.database.id]
       db_subnet_group_name   = aws_db_subnet_group.main.name

       multi_az                      = var.multi_az
       backup_retention_period       = var.backup_retention_period
       backup_window                 = "03:00-04:00"
       maintenance_window            = "mon:04:00-mon:05:00"

       enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

       skip_final_snapshot       = var.environment == "dev"
       final_snapshot_identifier = "${var.environment}-postgres-final-snapshot"

       tags = {
         Name        = "${var.environment}-postgres"
         Environment = var.environment
       }
     }
     ```
   - **ECS Module** (`terraform/modules/compute/main.tf`):
     ```hcl
     resource "aws_ecs_cluster" "main" {
       name = "${var.environment}-cluster"

       setting {
         name  = "containerInsights"
         value = "enabled"
       }
     }

     resource "aws_ecs_task_definition" "backend" {
       family                   = "${var.environment}-backend"
       network_mode             = "awsvpc"
       requires_compatibilities = ["FARGATE"]
       cpu                      = var.backend_cpu
       memory                   = var.backend_memory
       execution_role_arn       = aws_iam_role.ecs_execution.arn
       task_role_arn            = aws_iam_role.ecs_task.arn

       container_definitions = jsonencode([
         {
           name      = "backend"
           image     = "${var.ecr_repository_url}:${var.image_tag}"
           essential = true

           portMappings = [
             {
               containerPort = 3000
               protocol      = "tcp"
             }
           ]

           environment = [
             { name = "NODE_ENV", value = var.environment }
           ]

           secrets = [
             {
               name      = "DATABASE_URL"
               valueFrom = "${var.secrets_manager_arn}:database_url::"
             },
             {
               name      = "JWT_SECRET"
               valueFrom = "${var.secrets_manager_arn}:jwt_secret::"
             }
           ]

           logConfiguration = {
             logDriver = "awslogs"
             options = {
               "awslogs-group"         = "/ecs/${var.environment}-backend"
               "awslogs-region"        = var.aws_region
               "awslogs-stream-prefix" = "backend"
             }
           }

           healthCheck = {
             command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
             interval    = 30
             timeout     = 5
             retries     = 3
             startPeriod = 60
           }
         }
       ])
     }
     ```

5. **Generate Environment-Specific Terraform Configurations**
   - **Production Environment** (`terraform/environments/production/main.tf`):
     ```hcl
     terraform {
       required_version = ">= 1.5"

       backend "s3" {
         bucket         = "myapp-terraform-state"
         key            = "production/terraform.tfstate"
         region         = "us-east-1"
         encrypt        = true
         dynamodb_table = "terraform-lock"
       }
     }

     provider "aws" {
       region = "us-east-1"
     }

     module "networking" {
       source = "../../modules/networking"

       environment        = "production"
       vpc_cidr          = "10.0.0.0/16"
       availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
     }

     module "database" {
       source = "../../modules/database"

       environment             = "production"
       instance_class          = "db.t3.medium"
       allocated_storage       = 100
       multi_az                = true
       backup_retention_period = 7

       vpc_id     = module.networking.vpc_id
       subnet_ids = module.networking.private_subnet_ids
     }

     module "compute" {
       source = "../../modules/compute"

       environment    = "production"
       backend_cpu    = "1024"
       backend_memory = "2048"
       desired_count  = 3

       vpc_id             = module.networking.vpc_id
       private_subnet_ids = module.networking.private_subnet_ids
       alb_target_group_arn = module.load_balancer.backend_target_group_arn
     }
     ```

6. **Generate Secrets Management Configuration**
   - Create AWS Secrets Manager secrets
   - Example Terraform (`terraform/modules/secrets/main.tf`):
     ```hcl
     resource "aws_secretsmanager_secret" "app_secrets" {
       name = "${var.environment}-app-secrets"

       tags = {
         Environment = var.environment
       }
     }

     resource "aws_secretsmanager_secret_version" "app_secrets" {
       secret_id = aws_secretsmanager_secret.app_secrets.id

       secret_string = jsonencode({
         database_url = var.database_url
         jwt_secret   = var.jwt_secret
         redis_url    = var.redis_url
       })
     }
     ```

7. **Generate Deployment Scripts**
   - Create helper scripts for common operations
   - **Database Migration Script** (`scripts/migrate.sh`):
     ```bash
     #!/bin/bash
     set -e

     ENVIRONMENT=$1

     if [ -z "$ENVIRONMENT" ]; then
       echo "Usage: ./migrate.sh <environment>"
       exit 1
     fi

     echo "Running database migrations for $ENVIRONMENT..."

     # Get database URL from Secrets Manager
     DATABASE_URL=$(aws secretsmanager get-secret-value \
       --secret-id "$ENVIRONMENT-app-secrets" \
       --query SecretString \
       --output text | jq -r .database_url)

     # Run migrations
     cd backend
     DATABASE_URL="$DATABASE_URL" npm run migrate:deploy

     echo "Migrations completed successfully"
     ```
   - **Smoke Test Script** (`scripts/smoke-tests.sh`):
     ```bash
     #!/bin/bash
     set -e

     BASE_URL=$1

     if [ -z "$BASE_URL" ]; then
       echo "Usage: ./smoke-tests.sh <base-url>"
       exit 1
     fi

     echo "Running smoke tests against $BASE_URL..."

     # Test health endpoint
     echo "Testing health endpoint..."
     response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
     if [ "$response" != "200" ]; then
       echo "Health check failed: $response"
       exit 1
     fi

     # Test API endpoint
     echo "Testing API endpoint..."
     response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/status")
     if [ "$response" != "200" ]; then
       echo "API check failed: $response"
       exit 1
     fi

     echo "All smoke tests passed!"
     ```

8. **Generate Monitoring and Alerting Configuration**
   - Create CloudWatch alarms
   - Example (`terraform/modules/monitoring/main.tf`):
     ```hcl
     resource "aws_cloudwatch_metric_alarm" "backend_high_cpu" {
       alarm_name          = "${var.environment}-backend-high-cpu"
       comparison_operator = "GreaterThanThreshold"
       evaluation_periods  = "2"
       metric_name         = "CPUUtilization"
       namespace           = "AWS/ECS"
       period              = "300"
       statistic           = "Average"
       threshold           = "80"

       dimensions = {
         ClusterName = var.cluster_name
         ServiceName = var.backend_service_name
       }

       alarm_actions = [var.sns_topic_arn]
     }

     resource "aws_cloudwatch_log_group" "backend" {
       name              = "/ecs/${var.environment}-backend"
       retention_in_days = 30
     }
     ```

9. **Generate README Documentation**
   - Create comprehensive DevOps README
   - Example (`devops/README.md`):
     ```markdown
     # DevOps Documentation

     ## Quick Start

     ### Local Development
     ```bash
     # Start all services
     docker-compose up

     # Access services
     Frontend: http://localhost:3001
     Backend: http://localhost:3000
     Database: localhost:5432
     ```

     ### Deployment

     #### Staging
     ```bash
     # Push to main branch triggers automatic deployment
     git push origin main
     ```

     #### Production
     ```bash
     # Create and push a release tag
     git tag -a v1.0.0 -m "Release v1.0.0"
     git push origin v1.0.0
     ```

     ## Infrastructure Management

     ### Provision Infrastructure
     ```bash
     cd terraform/environments/production
     terraform init
     terraform plan
     terraform apply
     ```

     ### Update Infrastructure
     ```bash
     terraform plan
     terraform apply
     ```

     ### Destroy Infrastructure (DANGER)
     ```bash
     terraform destroy
     ```
     ```

### Phase 6: Generate Tests

1. **Generate Infrastructure Tests**
   - Create Terratest or similar infrastructure tests
   - Example (`terraform/test/networking_test.go`):
     ```go
     package test

     import (
       "testing"
       "github.com/gruntwork-io/terratest/modules/terraform"
       "github.com/stretchr/testify/assert"
     )

     func TestNetworkingModule(t *testing.T) {
       terraformOptions := &terraform.Options{
         TerraformDir: "../modules/networking",
         Vars: map[string]interface{}{
           "environment": "test",
           "vpc_cidr": "10.100.0.0/16",
           "availability_zones": []string{"us-east-1a", "us-east-1b"},
         },
       }

       defer terraform.Destroy(t, terraformOptions)
       terraform.InitAndApply(t, terraformOptions)

       vpcId := terraform.Output(t, terraformOptions, "vpc_id")
       assert.NotEmpty(t, vpcId)
     }
     ```

2. **Generate Pipeline Tests**
   - Test CI/CD pipeline locally
   - Example (`scripts/test-pipeline.sh`):
     ```bash
     #!/bin/bash
     set -e

     echo "Testing CI/CD pipeline locally..."

     # Test linting
     echo "Running linting..."
     cd frontend && npm run lint && cd ..
     cd backend && npm run lint && cd ..

     # Test unit tests
     echo "Running unit tests..."
     cd frontend && npm run test:unit && cd ..
     cd backend && npm run test:unit && cd ..

     # Test Docker builds
     echo "Testing Docker builds..."
     docker build -t frontend-test ./frontend
     docker build -t backend-test ./backend

     echo "Pipeline tests passed!"
     ```

3. **Generate Smoke Test Suite**
   - Create comprehensive smoke tests
   - Example (`tests/smoke/health-check.test.ts`):
     ```typescript
     import axios from 'axios'

     const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

     describe('Smoke Tests', () => {
       it('should return 200 for health endpoint', async () => {
         const response = await axios.get(`${BASE_URL}/health`)
         expect(response.status).toBe(200)
         expect(response.data).toHaveProperty('status', 'ok')
       })

       it('should return 200 for API status endpoint', async () => {
         const response = await axios.get(`${BASE_URL}/api/v1/status`)
         expect(response.status).toBe(200)
       })

       it('should handle CORS correctly', async () => {
         const response = await axios.options(`${BASE_URL}/api/v1/users`)
         expect(response.headers['access-control-allow-origin']).toBeDefined()
       })
     })
     ```

### Phase 7: Validate Generated Infrastructure

1. **Validate Terraform Configuration**
   - Run terraform validate on all modules:
     ```bash
     cd terraform/environments/production
     terraform init
     terraform validate
     ```
   - If validation errors:
     - List all errors with module paths
     - Fix syntax errors, missing variables, type mismatches
     - Re-run until no errors

2. **Validate Docker Builds**
   - Test build all Dockerfiles:
     ```bash
     docker build -t frontend-test ./frontend
     docker build -t backend-test ./backend
     ```
   - If build failures:
     - Check Dockerfile syntax
     - Verify COPY paths are correct
     - Ensure base images are accessible
     - Re-run until successful

3. **Validate CI/CD Pipeline Syntax**
   - Check GitHub Actions workflow syntax:
     ```bash
     # Use act to test locally
     act pull_request
     ```
   - If syntax errors:
     - Fix YAML indentation
     - Correct action versions
     - Verify secret names
     - Re-run validation

4. **Run Terraform Plan (Dry Run)**
   - Execute terraform plan to preview changes:
     ```bash
     terraform plan -out=plan.tfplan
     ```
   - Review plan output:
     - Verify resources to be created
     - Check for unintended deletions
     - Confirm configurations match requirements
   - Save plan for review

5. **Validate Secret References**
   - Check all secret references are correct:
     - Secrets Manager ARNs
     - Environment variable names
     - IAM role permissions
   - Ensure no secrets are hardcoded in files

6. **Generate Validation Report**
   - List all validation checks performed
   - Note any warnings or issues
   - Confirm infrastructure is ready for deployment or list required fixes

### Phase 8: Update Progress Tracking

1. **Read Current Progress Document**
   - Use Glob to find latest progress document: `docs/progress/000-progress-v*.md`
   - Read the document to get current state

2. **Mark DevOps UACs as Complete**
   - For each UAC that was implemented in this build session:
     - Change status from `❌ Not Started` to `✅ Complete`
     - Add completion timestamp if format supports it
   - Example:
     ```markdown
     Before:
     - ❌ DevOps: Docker multi-stage build creates optimized production image

     After:
     - ✅ DevOps: Docker multi-stage build creates optimized production image
     ```

3. **Update Progress Summary**
   - Update completion percentages or counts
   - Example:
     ```markdown
     Infrastructure & Deployment: 12/15 UACs complete (80%)
     ```

4. **Save Updated Progress Document**
   - Use Edit tool to update the progress document
   - Preserve all existing content, only modify status of implemented UACs

5. **Update Epic Story File** (only if `--story-file` was provided in Phase 0)
   - Update story file YAML frontmatter at current path (now in `in-progress/`):
     - Set `test_unit_status: "pending"` (DevOps infrastructure tests tracked separately)
     - Set `test_integration_status: "passing"` (or `"failing"` if IaC validation failed)
     - Set `test_e2e_status: "pending"`
     - Update `uac_completed` count — count checked `- [x] DevOps:` boxes in body
     - Recalculate `uac_pending` and `uac_completion_pct`
     - Set `updated_at: {ISO now}`
   - Also update body: mark implemented UACs as checked (`- [ ] DevOps:` → `- [x] DevOps:`)
   - Move story file from `in-progress/` → `qa/`:
     ```bash
     mv {epicDir}/in-progress/{filename} {epicDir}/qa/{filename}
     ```
   - Update frontmatter `story_status: qa`
   - Run: `node .ai-dev/ai-dev-scripts/aggregate-epics.js --update --docs-path=./docs --epic={epicId}`
   - Display:
     ```
     ✅ Story {storyId} transitioned: in-progress → qa
     UACs: {completed}/{total} DevOps: UACs checked
     Epic stats refreshed for {epicId}
     ```


### Phase 9: Generate Summary Report

1. **Collect Implementation Details**
   - Count files created:
     - Dockerfiles
     - docker-compose.yml
     - CI/CD workflow files
     - Terraform modules
     - Environment configurations
     - Scripts
     - Monitoring configurations
   - Note which UACs were implemented
   - Record validation results

2. **Display Comprehensive Summary**
   ```
   ✅ DevOps infrastructure and deployment automation completed successfully!

   📝 Git Information:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Working Branch:  feature/build-devops-infrastructure
   Protected:       No
   Status:          Ready for commit

   Next: Review changes and commit with descriptive message

   📊 Implementation Summary:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UACs Implemented:  15
   Files Created:     38
   Infrastructure Tests: 8
   Terraform Modules: 7
   CI/CD Workflows:   3

   📁 Generated Files:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Containerization:
   - frontend/Dockerfile (multi-stage, 25 lines)
   - backend/Dockerfile (multi-stage, 35 lines)
   - docker-compose.yml (full local env, 60 lines)
   - .dockerignore

   CI/CD Pipelines:
   - .github/workflows/pr.yml (PR quality gates)
   - .github/workflows/deploy-staging.yml (auto-deploy to staging)
   - .github/workflows/deploy-production.yml (release deployment)

   Infrastructure as Code:
   - terraform/modules/networking/ (VPC, subnets, NAT)
   - terraform/modules/database/ (RDS PostgreSQL)
   - terraform/modules/compute/ (ECS Fargate)
   - terraform/modules/load-balancer/ (ALB)
   - terraform/modules/cache/ (ElastiCache Redis)
   - terraform/modules/monitoring/ (CloudWatch)
   - terraform/modules/secrets/ (Secrets Manager)

   Environment Configs:
   - terraform/environments/dev/
   - terraform/environments/staging/
   - terraform/environments/production/

   Scripts:
   - scripts/migrate.sh (database migrations)
   - scripts/smoke-tests.sh (post-deployment tests)
   - scripts/test-pipeline.sh (local CI/CD testing)

   Documentation:
   - devops/README.md (comprehensive guide)

   ✅ Validation Checks:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - ✅ Terraform configuration validated
   - ✅ Docker builds successful
   - ✅ CI/CD pipeline syntax valid
   - ✅ No secrets hardcoded
   - ✅ DevOps strategy compliance verified
   - ✅ Multi-environment support configured
   - ✅ Monitoring and alerting configured

   📋 Implemented UACs:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Containerization:
   - ✅ DevOps: Docker multi-stage build creates optimized production image
   - ✅ DevOps: docker-compose.yml enables local development environment
   - ✅ DevOps: .dockerignore excludes unnecessary files

   CI/CD Pipelines:
   - ✅ DevOps: GitHub Actions workflow runs linting and tests on PR
   - ✅ DevOps: Pipeline deploys to staging on main branch push
   - ✅ DevOps: Production deployment triggered by release tag
   - ✅ DevOps: Pipeline includes security scanning stage

   Infrastructure as Code:
   - ✅ DevOps: Terraform provisions VPC with public and private subnets
   - ✅ DevOps: Terraform creates RDS database with automatic backups
   - ✅ DevOps: Terraform configures ECS Fargate for container orchestration
   - ✅ DevOps: Terraform sets up Application Load Balancer
   - ✅ DevOps: Multi-environment support (dev, staging, production)

   Monitoring & Security:
   - ✅ DevOps: CloudWatch alarms configured for critical metrics
   - ✅ DevOps: Secrets Manager stores sensitive credentials
   - ✅ DevOps: Health checks configured for all services

   📝 Progress Updated:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Updated docs/progress/000-progress-v1.1.0.md
   - 15 UACs marked as complete
   - Infrastructure & Deployment: 100% complete

   🎯 Next Steps:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. Test local environment: docker-compose up
   2. Configure AWS credentials for Terraform
   3. Initialize Terraform backend: terraform init
   4. Plan infrastructure: terraform plan
   5. Apply infrastructure: terraform apply (review carefully!)
   6. Configure GitHub Actions secrets:
      - AWS_ROLE_ARN
      - SNYK_TOKEN (if using Snyk)
   7. Test CI/CD pipeline by creating a PR
   8. Deploy to staging by merging to main
   9. Create a release tag to deploy to production
   10. Monitor CloudWatch metrics and logs

   ⚠️ Important Reminders:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Review Terraform plan BEFORE applying
   - Never commit secrets to Git
   - Test migrations on staging before production
   - Keep Terraform state backed up
   - Monitor costs (especially RDS and ECS)
   - Set up billing alerts in AWS

   ✨ DevOps infrastructure is ready for deployment! ✨
   ```

3. **Provide Next Steps Guidance**
   - Suggest immediate actions (test locally, configure AWS)
   - Suggest deployment workflow
   - Provide monitoring recommendations

## Input Format

**Command:**
```
/build-devops
```

**With Specific Focus:**
```
/build-devops
Focus on containerization only
```

**With Environment Target:**
```
/build-devops
Set up staging environment infrastructure
```

**Examples:**
```
/build-devops
/build-devops Focus on CI/CD pipelines
/build-devops Implement all pending DevOps UACs
```

## Output Format

```
✅ DevOps infrastructure and deployment automation completed successfully!

📊 Implementation Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UACs Implemented:  15
Files Created:     38
Terraform Modules: 7
CI/CD Workflows:   3

📁 Generated Files:
[Detailed file listing...]

✅ Validation Checks:
[Validation results...]

📋 Implemented UACs:
[List of completed UACs...]

📝 Progress Updated:
[Progress tracking updates...]

🎯 Next Steps:
[Actionable deployment steps...]

✨ DevOps infrastructure is ready for deployment! ✨
```

## Important Notes

- **CRITICAL**: Always re-read docs/425-devops-v1.0.0.md at the start of EVERY /build-devops session (evolving document)
- **Infrastructure as Code**: All infrastructure MUST be defined in code (Terraform, Pulumi, etc.)
- **Multi-Environment**: Support dev, staging, and production environments
- **Security First**: Never hardcode secrets, always use secrets management
- **Idempotent Operations**: Infrastructure operations must be idempotent
- **State Management**: Terraform state MUST be stored remotely (S3 + DynamoDB)
- **Monitoring is Mandatory**: Every service needs health checks, metrics, and alerts
- **Documentation First**: All infrastructure decisions documented in DevOps strategy doc
- **Cost Awareness**: Use appropriate instance sizes for each environment (dev = small, prod = larger)
- **Backup Strategy**: Automated backups for databases, retention policies
- **Rollback Capability**: Every deployment must have rollback mechanism
- **Blue/Green for Production**: Use blue/green deployment for zero-downtime production deploys
- **Database Migrations**: ALWAYS run migrations before application deployment
- **Smoke Tests**: Run smoke tests after every deployment
- **Terraform Validation**: Always run terraform validate and plan before apply
- **Docker Optimization**: Use multi-stage builds, Alpine base images, layer caching
- **CI/CD Quality Gates**: PR pipelines must pass before merge
- **Secret Rotation**: Plan for regular secret rotation (databases, API keys, JWT)
- **Logging Centralization**: All logs go to centralized system (CloudWatch, ELK)
- **Network Security**: Use private subnets for databases and internal services
- **IAM Least Privilege**: Grant minimum required permissions to services
- **Compliance**: Follow security best practices (encryption at rest and in transit)

## Error Handling

**No Pending DevOps UACs Found:**
- Display message: "No pending DevOps UACs found in atomic stories"
- Suggest: "All DevOps UACs may be complete, or no DevOps: tagged UACs exist"
- Check progress document to confirm completion status
- Exit gracefully

**DevOps Strategy Document Not Found:**
- Display error: "DevOps strategy document not found: docs/425-devops-v1.0.0.md"
- This is CRITICAL - DevOps cannot be built without strategy
- Suggest: "Run /define @docs/425-devops to create DevOps strategy first"
- Exit with error

**Technology Stack Document Not Found:**
- Display error: "Technology stack document not found: docs/150-tech-stacks-v1.0.0.md"
- This is CRITICAL - need to know cloud provider, database, etc.
- Suggest: "Run /define @docs/150-tech-stacks to create tech stack document first"
- Exit with error

**C4 Diagrams Document Not Found:**
- Display warning: "C4 diagrams document not found: docs/175-c4-diagrams-v1.0.0.md"
- Proceed with caution
- Use frontend and backend architecture as fallback
- Suggest creating C4 diagrams for better infrastructure planning

**Terraform Validation Errors:**
- Display error: "Terraform validation failed"
- List all validation errors with file paths and line numbers
- Common fixes:
  - Missing required variables
  - Invalid resource configurations
  - Type mismatches
- Suggest: "Fix validation errors, then re-run /build-devops"

**Docker Build Failures:**
- Display error: "Docker build failed for {service}"
- Show build error output
- Common issues:
  - Invalid Dockerfile syntax
  - Missing dependencies
  - Network issues during build
- Suggest fixes and re-run

**CI/CD Pipeline Syntax Errors:**
- Display error: "CI/CD pipeline configuration invalid"
- List syntax errors (YAML indentation, unknown actions, etc.)
- Provide corrected syntax examples
- Suggest using pipeline validation tools

**Missing AWS Credentials:**
- Display warning: "AWS credentials not configured"
- Terraform commands will fail without credentials
- Suggest: "Configure AWS credentials using aws configure or environment variables"
- Provide documentation link

**Secret References Missing:**
- Display error: "Secret {secret-name} referenced but not defined"
- List all missing secrets
- Suggest creating secrets in AWS Secrets Manager
- Provide example commands

**Progress Update Failed:**
- Complete DevOps build successfully
- Display warning: "Could not update progress document"
- Provide exact UACs to mark as complete manually
- Suggest re-running /update-progress

**Terraform State Lock:**
- Display error: "Terraform state is locked by another operation"
- Explain someone else may be running terraform
- Suggest waiting or force-unlocking (with caution)
- Provide unlock command

**Infrastructure Provisioning Failed:**
- Display error: "terraform apply failed"
- Show error output from Terraform
- Suggest reviewing error and fixing
- Emphasize NOT to force through errors
- Provide rollback guidance if partial apply occurred

## Success Criteria

The `/build-devops` command is successful when:

1. ✅ Latest atomic stories document identified and read
2. ✅ DevOps UACs (DevOps: tagged) filtered from atomic stories
3. ✅ Already-completed UACs filtered out from progress tracking
4. ✅ DevOps strategy document (425-devops) read and validated
5. ✅ Technology stack document (150-tech-stacks) read for infrastructure choices
6. ✅ C4 diagrams document (175-c4-diagrams) read for architecture understanding
7. ✅ Frontend architecture document (300-frontend) read for containerization needs
8. ✅ Backend architecture document (325-backend) read for containerization needs
9. ✅ API contract document (350-api-contract) read for networking requirements
10. ✅ UACs mapped to infrastructure components and domains
11. ✅ Dockerfiles generated with multi-stage builds
12. ✅ docker-compose.yml generated for local development
13. ✅ .dockerignore created to optimize builds
14. ✅ CI/CD pipeline workflows generated (PR, staging, production)
15. ✅ Terraform modules generated (networking, database, compute, monitoring, etc.)
16. ✅ Environment-specific Terraform configurations created (dev, staging, prod)
17. ✅ Secrets management configuration generated (AWS Secrets Manager)
18. ✅ Deployment scripts created (migration, smoke tests, rollback)
19. ✅ Monitoring and alerting configuration generated (CloudWatch alarms)
20. ✅ DevOps README documentation created
21. ✅ Infrastructure tests generated (Terratest or equivalent)
22. ✅ Smoke test suite created
23. ✅ Terraform configuration validated (terraform validate passes)
24. ✅ Docker builds successful for all services
25. ✅ CI/CD pipeline syntax validated
26. ✅ Terraform plan executed successfully (dry run)
27. ✅ No secrets hardcoded in any files
28. ✅ All secret references point to Secrets Manager
29. ✅ Multi-environment support verified (dev, staging, production configs present)
30. ✅ Progress tracking document updated with completed UACs
31. ✅ Comprehensive summary report generated
32. ✅ Next steps guidance provided to user
33. ✅ DevOps infrastructure is ready for terraform apply
34. ✅ All generated files follow best practices from DevOps strategy doc
35. ✅ Security best practices implemented (no plaintext secrets, encryption enabled, IAM least privilege)
