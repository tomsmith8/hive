# Hive Platform

Hive Platform is an AI-first product management assistant that helps PMs plan backlogs, structure roadmaps, and accelerate delivery through an integrated bounty system.

## 🚀 Features

- **📋 Backlog Management**: Organize and prioritize your product backlog with AI-powered insights
- **🗺️ Roadmap Planning**: Create and visualize product roadmaps with confidence
- **💰 Bounty System**: Accelerate delivery with our integrated bounty and reward system
- **🤖 AI Assistant**: Get intelligent suggestions and automation for your workflows
- **👥 Team Collaboration**: Work together seamlessly with real-time updates
- **📊 Analytics & Insights**: Track progress and get insights to improve delivery

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **TypeScript**: Full type safety
- **Forms**: React Hook Form + Zod validation

### Backend
- **API Routes**: Next.js API routes for serverless functions
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas for type-safe API requests
- **Authentication**: Ready for NextAuth.js integration

### Database Schema
- **Users**: Team members with roles and permissions
- **Projects**: Product initiatives and their metadata
- **Tasks**: Individual work items with status and assignments
- **Bounties**: Reward-based task completion system
- **Roadmap Items**: Strategic planning and timeline management
- **Comments**: Collaboration and communication

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Validation**: Zod
- **Forms**: React Hook Form
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hive_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Using PostgreSQL locally
1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE hive_db;
   ```
3. Update your `.env.local` with the correct connection string

### Using a cloud database
- **Supabase**: Free PostgreSQL hosting with great developer experience
- **Neon**: Serverless PostgreSQL with branching
- **Railway**: Simple PostgreSQL deployment

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── projects/      # Project CRUD operations
│   │   ├── tasks/         # Task management
│   │   └── bounties/      # Bounty system
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions
│   ├── db.ts            # Database client
│   ├── utils.ts         # General utilities
│   └── validations.ts   # Zod schemas
└── generated/            # Generated Prisma client
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database Commands
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

### Adding New Components
```bash
# Add shadcn/ui components
npx shadcn@latest add [component-name]

# Examples:
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
- `DATABASE_URL` - Production PostgreSQL connection string
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Secure random string for session encryption

## 🔮 Roadmap

### Phase 1: Core Features ✅
- [x] Project management
- [x] Task tracking
- [x] Basic bounty system
- [x] Dashboard and analytics

### Phase 2: AI Integration 🚧
- [ ] AI-powered task estimation
- [ ] Smart backlog prioritization
- [ ] Automated reporting
- [ ] Predictive analytics

### Phase 3: Advanced Features 📋
- [ ] Real-time collaboration
- [ ] Advanced bounty marketplace
- [ ] Integration with external tools
- [ ] Mobile app

### Phase 4: Enterprise Features 🏢
- [ ] Advanced permissions and roles
- [ ] SSO integration
- [ ] Advanced analytics
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@hiveplatform.com
- 💬 Discord: [Join our community](https://discord.gg/hiveplatform)
- 📖 Documentation: [docs.hiveplatform.com](https://docs.hiveplatform.com)

---

Built with ❤️ by the Hive Platform team
