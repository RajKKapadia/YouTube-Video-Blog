# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application with React 19, built as a YouTube video blog platform. The project uses the App Router architecture and is configured with TypeScript, Tailwind CSS, and shadcn/ui components.

## Environment Setup

Before running the application, set up your `.env` file:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/youtube_blog

# Redis (for job queue - leave password empty if no auth)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# YouTube API (Get from https://console.cloud.google.com/apis/credentials)
YOUTUBE_API_KEY=your_youtube_api_key

# Google Gemini API (Get from https://aistudio.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

**Prerequisites:**
1. PostgreSQL must be running
2. Redis must be running (start with `redis-server`)
3. Create database: `createdb youtube_blog`

Then initialize the database:
```bash
pnpm db:push
```

## Development Commands

**Development server:**
```bash
pnpm dev        # Start Next.js server only
pnpm worker     # Start worker process only
pnpm dev:all    # Start both Next.js and worker (recommended)
```
Opens at http://localhost:3000 with hot reload enabled.
Worker processes background jobs from Redis queue.

**Build:**
```bash
pnpm build
```

**Production server:**
```bash
pnpm start
```

**Linting:**
```bash
pnpm lint
```
Uses Biome for linting and checking code quality.

**Formatting:**
```bash
pnpm format
```
Uses Biome to format code with 2-space indentation.

**Database Commands:**
```bash
pnpm db:generate    # Generate migrations from schema changes
pnpm db:push        # Push schema changes directly to database
pnpm db:studio      # Open Drizzle Studio (database GUI)
```

**Testing:**
```bash
pnpm test:apis      # Test all API connections (YouTube, Gemini, Database)
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **React:** Version 19.2.0
- **TypeScript:** Version 5
- **Database:** PostgreSQL with Drizzle ORM
- **Queue:** BullMQ with Redis for background job processing
- **AI:** Google Gemini (via Vercel AI SDK) - Model: gemini-2.5-flash
- **YouTube:** YouTube Data API v3 + youtube-transcript
- **Styling:** Tailwind CSS v4 with Tailwind Typography for blog content
- **Markdown:** react-markdown with remark-gfm for rendering blog posts
- **UI Components:** shadcn/ui (New York style) with Radix UI primitives
- **Icons:** Lucide React
- **Forms:** React Hook Form with Zod validation
- **Notifications:** Sonner (toast notifications)
- **Date Formatting:** date-fns
- **Linting/Formatting:** Biome (not ESLint/Prettier)
- **Package Manager:** pnpm with workspace configuration

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── page.tsx          # Home page with YouTube URL input
│   ├── dashboard/        # Dashboard for viewing generated blogs
│   ├── blog/[id]/        # Individual blog view page
│   │   ├── page.tsx      # Blog content display with markdown
│   │   └── not-found.tsx # 404 page for missing blogs
│   └── api/blogs/        # API route for blog conversion
├── components/
│   ├── ui/               # shadcn/ui components (40+ pre-configured)
│   └── convert-form.tsx  # YouTube URL form with validation
├── db/              # Database layer
│   ├── schema.ts         # Drizzle schema definitions
│   ├── index.ts          # Database connection
│   └── migrations/       # Generated SQL migrations
├── lib/             # Core infrastructure
│   ├── redis.ts          # Redis connection configuration
│   ├── queue.ts          # BullMQ queue setup
│   └── utils.ts          # Utility functions
├── services/        # Business logic and external API integrations
│   ├── youtube.ts        # YouTube API integration
│   └── ai.ts             # Gemini AI content generation
├── workers/         # Background job processors
│   ├── blog-processor.ts # Main blog processing worker
│   └── start.ts          # Worker startup script
└── hooks/           # Custom React hooks (e.g., use-mobile)
```

## Architecture Notes

**Import Aliases:**
The project uses path aliases configured in `tsconfig.json` and `components.json`:
- `@/*` → `./src/*`
- `@/components` → `./src/components`
- `@/lib/utils` → `./src/lib/utils`
- `@/ui` → `./src/components/ui`
- `@/hooks` → `./src/hooks`

**UI Components:**
All UI components are from shadcn/ui with the "New York" style variant. They are located in `src/components/ui/` and built on Radix UI primitives. The component registry is configured in `components.json`. When adding new shadcn components, they should follow the existing configuration (RSC-enabled, TypeScript, CSS variables for theming).

**Styling:**
Uses Tailwind CSS v4 with neutral as the base color. CSS variables are enabled for theming. Global styles are in `src/app/globals.css`.

**Fonts:**
The app uses Geist Sans and Geist Mono fonts loaded via `next/font/google`.

**Code Quality:**
Biome is configured with:
- Recommended rules for linting
- Next.js and React domain-specific rules
- Automatic import organization on save
- Git integration via VCS settings

**Workspace:**
This is a pnpm workspace with `sharp` as a built-only dependency (for Next.js image optimization).

**Database:**
The application uses PostgreSQL with Drizzle ORM. Database configuration:
- Connection string is stored in `.env.local` as `DATABASE_URL`
- Schema is defined in `src/db/schema.ts` with a `blogs` table
- Blog statuses: `pending`, `processing`, `completed`, `failed`
- The `blogs` table tracks: YouTube URL, video ID, title, status, content, thumbnail, duration, timestamps, and error messages
- Use `pnpm db:generate` to create migrations after schema changes
- Use `pnpm db:push` to apply schema changes directly to the database (development)
- Database queries should be performed in Server Components or API Routes using `db` from `@/db`

**AI Integration:**
The application uses Google Gemini via Vercel AI SDK for content generation:
- API key is stored in `.env.local` as `GOOGLE_GENERATIVE_AI_API_KEY`
- Model: `gemini-1.5-flash` for fast, efficient generation
- AI service is in `src/services/ai.ts` and provides:
  - `generateBlogContent()` - Generates enhanced title, formatted blog content (markdown), and thumbnail prompt
  - `generateThumbnailUrl()` - Creates thumbnail URL (currently uses placeholder service)
  - `generateSummary()` - Creates content summaries
- Content generation happens asynchronously during blog processing

**YouTube Integration:**
- YouTube Data API v3 for fetching video metadata (title, thumbnail, duration, channel)
- `youtube-transcript` package for fetching video subtitles/captions
- API key stored in `.env.local` as `YOUTUBE_API_KEY`
- Service in `src/services/youtube.ts` handles video data extraction

**Background Job Queue (BullMQ + Redis):**
The application uses a job queue system for processing blog conversions:
- Redis stores job queue data
- BullMQ manages job lifecycle and retries
- Worker process runs separately from Next.js server
- Jobs are processed with concurrency of 5
- Progress tracking (10% → 20% → 40% → 60% → 80% → 90% → 100%)
- Automatic retry on failure (3 attempts with exponential backoff)
- Job history kept: 24 hours for completed, 7 days for failed

**Blog Conversion Flow:**
1. User submits YouTube URL via form on home page
2. API creates blog entry with "pending" status in database
3. API adds job to Redis queue via BullMQ
4. Worker picks up job from queue
5. Worker processes job:
   - Status → "processing"
   - Fetch video metadata (YouTube API) - 40% progress
   - Fetch video transcript/captions
   - Generate blog content with AI (Gemini) - 60% progress
   - Generate thumbnail URL - 80% progress
   - Save all data to database
   - Status → "completed" (or "failed" on error) - 100% progress
6. User views results on dashboard
7. User clicks "View" to see the blog post at `/blog/[id]`
8. Blog page renders markdown content with proper styling
9. Job status can be checked via `/api/blogs/[id]/status` endpoint
10. Comprehensive logging at each step with `[API]`, `[Worker ID]`, `[YouTube Service]`, and `[AI Service]` prefixes

**Blog View Page:**
- Dynamic route at `/blog/[id]` displays individual blog posts
- Shows loading state for "pending" or "processing" blogs
- Shows error state for "failed" blogs with error message
- Renders completed blogs with:
  - Thumbnail image
  - Metadata (created date, duration, link to original video)
  - AI-generated title
  - Markdown-formatted content with Tailwind Typography styling
  - Links back to dashboard and to convert more videos
- 404 page for non-existent blogs

## Development Workflow

When adding new features:
1. Use the existing UI components from `src/components/ui/` before creating custom ones
2. Follow the established import alias patterns
3. Run `pnpm lint` to check for issues (Biome will auto-organize imports)
4. Run `pnpm format` to format code before committing
5. Use React Hook Form with Zod for form validation
6. Leverage the included utility libraries (clsx, tailwind-merge via cn helper)
