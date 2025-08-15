# LMS Platform - Sprint 2

A Learning Management System built with Next.js following MVC architecture, featuring AI-powered tutors, personalized learning experiences, and subscription-based monetization.

## Sprint 1 Features ✅

### User Management
- **Authentication**: Secure user authentication with Clerk
- **User Profiles**: Personalized user accounts and preferences  
- **Session History**: Track completed learning sessions
- **Personal Companions**: Create and manage your own AI tutors

### AI-Powered Learning
- **Vapi Integration**: Voice-powered AI conversations
- **Custom AI Tutors**: Create personalized AI companions with specific teaching styles
- **Interactive Learning Sessions**: Real-time voice conversations with AI tutors
- **Session Management**: Start, manage, and complete learning sessions
- **Progress Tracking**: Monitor learning progress with detailed analytics

## Sprint 2 Features ✅ (NEW)

### Subscription & Monetization
- **Tiered Plans**: Multiple subscription levels (Free, Basic, Pro, Enterprise)
- **Usage Limits**: Free tier with 3 companions & 10 sessions/month, paid tiers with higher limits
- **Upgrade Prompts**: Seamless upgrade flow when limits are reached
- **Usage Analytics**: Real-time tracking of companion and session usage
- **Subscription Management**: View current plan, usage stats, and upgrade options

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase
- **UI Components**: Radix UI, Custom components
- **Architecture**: MVC Pattern

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── controllers/            # Business logic controllers (MVC)
├── models/                 # Data models and database operations (MVC)
├── views/                  # View components and forms (MVC)
├── lib/                    # Utilities and configurations
└── middleware.ts           # Authentication middleware
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure Clerk**:
   - Create a Clerk account at [clerk.com](https://clerk.com)
   - Add your Clerk keys to `.env.local`

4. **Configure Supabase**:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Add your Supabase URL and anon key to `.env.local`
   - Run the database migrations (see Database Setup below)

5. **Configure Vapi**:
   - Create a Vapi account at [vapi.ai](https://vapi.ai)
   - Add your Vapi API key and public key to `.env.local`

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Database Setup

Create the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "clerkId" TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  bio TEXT,
  "learningGoals" TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Companions Table
```sql
CREATE TABLE companions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  voice TEXT NOT NULL,
  style TEXT NOT NULL,
  duration INTEGER NOT NULL,
  "authorId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "isPublic" BOOLEAN DEFAULT false,
  "vapiAssistantId" TEXT,
  instructions TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Learning Sessions Table
```sql
CREATE TABLE learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "companionId" UUID REFERENCES companions(id) ON DELETE CASCADE,
  "vapiCallId" TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "endedAt" TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  transcript TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Session History Table (Legacy)
```sql
CREATE TABLE session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "companionId" UUID REFERENCES companions(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);
```

### User Subscriptions Table
```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "planId" TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  "currentPeriodStart" TIMESTAMP WITH TIME ZONE NOT NULL,
  "currentPeriodEnd" TIMESTAMP WITH TIME ZONE NOT NULL,
  "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features

### 🔐 Authentication
- Secure sign-up/sign-in with Clerk
- Protected routes with middleware
- User session management

### 👤 User Profiles
- Personal profile management
- Learning preferences
- Account statistics

### 🤖 AI Companions
- Create custom AI tutors
- Subject-specific companions
- Personalized teaching styles
- Voice and style preferences

### 📊 Session Tracking
- Learning session history
- Progress analytics
- Session feedback and ratings

## MVC Architecture

### Models (`/models`)
- **User.ts**: User data operations
- **Companion.ts**: AI companion management
- **SessionHistory.ts**: Learning session tracking
- **types.ts**: TypeScript type definitions

### Views (`/views`)
- **components/**: Reusable UI components
- **forms/**: Form components for data input

### Controllers (`/controllers`)
- **UserController.ts**: User management logic
- **CompanionController.ts**: Companion operations
- **SessionController.ts**: Session management

## Next Steps (Future Sprints)

- **Sprint 2**: AI Integration & Voice Features
- **Sprint 3**: Advanced Learning Analytics
- **Sprint 4**: Community Features & Deployment

## Contributing

1. Follow the MVC architecture pattern
2. Use TypeScript for type safety
3. Follow the existing code style
4. Test your changes thoroughly

## License

This project is licensed under the MIT License.