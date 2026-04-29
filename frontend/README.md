# AutopenAI Frontend - Next.js

AI-powered penetration testing platform frontend built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── login/              # Login page (/login)
│   │   ├── signup/             # Signup page (/signup)
│   │   ├── dashboard/          # Dashboard (/dashboard)
│   │   ├── not-found.tsx       # 404 page
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── common/             # Common components (Header, Footer)
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── ...
│   └── features/               # Feature modules
│       ├── auth/               # Authentication feature
│       │   ├── api/
│       │   ├── components/
│       │   └── types.ts
│       └── scans/              # Scans feature
│           ├── api/
│           └── types.ts
├── public/                     # Static assets
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Material Symbols
- **Fonts**: Space Grotesk

## 📝 Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔄 Migration from Vite

This project was recently migrated from Vite to Next.js. See [MIGRATION.md](MIGRATION.md) for details.

## 🌐 API Integration

The frontend communicates with the backend API running on `http://localhost:8000`. API routes are automatically proxied through Next.js rewrites:
- `/api/*` → `http://localhost:8000/*`

## 📦 Features

- 🔐 User authentication (login/signup)
- 🔍 Vulnerability scanning with real-time progress
- 📊 Interactive results dashboard
- 🎨 Dark mode UI with glassmorphism effects
- 📱 Responsive design
- ⚡ Fast page loads with Next.js optimizations

## 🧑‍💻 Development

### Environment Variables

Create a `.env.local` file in the root directory (if needed):

```env
# Add any environment variables here
```

### Code Style

This project uses:
- **ESLint** - Code linting
- **Prettier** - Code formatting with Tailwind CSS plugin
- **TypeScript** - Type checking

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
