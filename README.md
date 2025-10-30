# YouTube to Blog Converter

A modern web application that converts YouTube videos into well-formatted blog posts using AI. Built with Next.js 16, React 19, and Google Gemini AI.

## Features

- 🎥 **YouTube Video Processing** - Extract video metadata and transcripts
- 🤖 **AI-Powered Content Generation** - Convert transcripts to engaging blog posts using Google Gemini
- 🖼️ **AI-Generated Thumbnails** - Create unique blog thumbnails using OpenAI DALL-E 3
- 📝 **Markdown Formatting** - Beautiful blog posts with proper structure and formatting
- 🔄 **Background Job Processing** - Queue-based system using BullMQ and Redis
- 📊 **Dashboard** - Track all your generated blogs with status indicators
- 💾 **PostgreSQL Database** - Store blog content and processing status
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Drizzle ORM
- **Queue**: BullMQ + Redis
- **AI**: Google Gemini (via Vercel AI SDK)
- **YouTube**: YouTube Data API v3 + youtube-transcript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Form**: React Hook Form + Zod
- **Markdown**: react-markdown + remark-gfm

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **pnpm** (recommended) or npm
3. **PostgreSQL** (running locally or remote)
4. **Redis** (running locally or remote)
5. **YouTube Data API Key** - [Get one here](https://console.cloud.google.com/apis/credentials)
6. **Google Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd youtube-video-blog
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/youtube_blog

# Redis (leave password empty if no authentication)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# YouTube API (Get from https://console.cloud.google.com/apis/credentials)
# Make sure to enable YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Google Gemini API (Get from https://aistudio.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### 4. Create the database

```bash
# Using PostgreSQL CLI
createdb youtube_blog

# Or using psql
psql -U postgres -c "CREATE DATABASE youtube_blog;"
```

### 5. Push database schema

```bash
pnpm db:push
```

### 6. Start Redis

```bash
# If Redis is not running, start it
redis-server

# Verify it's running
redis-cli ping
# Should return: PONG
```

## Development

### Start the application

**Option 1: Start everything together (recommended)**
```bash
pnpm dev:all
```
This starts both the Next.js server and the worker process.

**Option 2: Start separately**
```bash
# Terminal 1: Next.js server
pnpm dev

# Terminal 2: Worker process
pnpm worker
```

The application will be available at **http://localhost:3000**

### Available Scripts

```bash
pnpm dev          # Start Next.js development server
pnpm worker       # Start background worker process
pnpm dev:all      # Start both Next.js and worker (recommended)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
pnpm db:generate  # Generate database migrations
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio (database GUI)
pnpm test:apis    # Test all API connections
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with URL input
│   ├── dashboard/         # Dashboard for viewing blogs
│   ├── blog/[id]/         # Individual blog view
│   └── api/blogs/         # API routes for blog operations
├── components/
│   ├── ui/                # shadcn/ui components
│   └── convert-form.tsx   # YouTube URL form
├── config/
│   └── prompts.ts         # AI prompts configuration
├── db/
│   ├── schema.ts          # Database schema
│   ├── index.ts           # Database connection
│   └── migrations/        # SQL migrations
├── lib/
│   ├── redis.ts           # Redis connection
│   ├── queue.ts           # BullMQ queue setup
│   └── utils.ts           # Utilities
├── services/
│   ├── youtube.ts         # YouTube API integration
│   └── ai.ts              # Gemini AI service
└── workers/
    ├── blog-processor.ts  # Background job processor
    └── start.ts           # Worker startup script
```

## How It Works

1. **User submits a YouTube URL** via the form on the home page
2. **API validates the URL** and creates a blog entry with "pending" status
3. **Job is added to Redis queue** via BullMQ
4. **Worker picks up the job** and processes it:
   - Fetches video metadata (title, thumbnail, duration)
   - Downloads video transcript/captions
   - Generates blog content using Google Gemini AI
   - Saves everything to the database
5. **User views the blog** on the dashboard or directly at `/blog/[id]`

## Customizing AI Prompts

All AI prompts are centralized in `src/config/prompts.ts`. Edit this file to customize:

- Blog content generation style
- Title format
- Content structure
- Tone and voice

Example:

```typescript
// src/config/prompts.ts
export const prompts = {
  blogGeneration: {
    system: "You are a professional content writer...",
    getUserPrompt: (transcript, videoTitle, channelName) => `
      // Customize your prompt here
    `,
  },
};
```

## API Endpoints

### Create Blog
```http
POST /api/blogs
Content-Type: application/json

{
  "youtubeUrl": "https://youtube.com/watch?v=..."
}

Response:
{
  "id": "blog-uuid",
  "jobId": "job-uuid",
  "message": "Blog conversion queued",
  "status": "pending"
}
```

### Check Job Status
```http
GET /api/blogs/[id]/status

Response:
{
  "id": "job-uuid",
  "state": "active",
  "progress": 60,
  "data": {...}
}
```

## Database Schema

```typescript
blogs {
  id: uuid (primary key)
  youtubeUrl: string
  youtubeVideoId: string
  title: string (nullable)
  status: enum (pending, processing, completed, failed)
  content: text (nullable)
  thumbnailUrl: string (nullable)
  duration: string (nullable)
  errorMessage: text (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
redis-server

# Check Redis configuration in .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password
```

### YouTube API Errors
1. Verify API key is correct in `.env`
2. Check if YouTube Data API v3 is enabled in Google Cloud Console
3. Run the API test: `pnpm test:apis`

### Worker Not Processing Jobs
1. Make sure worker is running: `pnpm worker`
2. Check worker logs for errors
3. Verify Redis connection
4. Check job status: `GET /api/blogs/[id]/status`

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database exists: `psql -l | grep youtube_blog`
3. Verify connection string in `.env`
4. Run: `pnpm db:push` to create tables

## Production Deployment

For production deployment:

1. Use managed services for PostgreSQL and Redis
2. Set up proper environment variables
3. Run database migrations: `pnpm db:generate && pnpm db:migrate`
4. Build the application: `pnpm build`
5. Start the Next.js server: `pnpm start`
6. Run workers as separate processes (consider using PM2 or Docker)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
