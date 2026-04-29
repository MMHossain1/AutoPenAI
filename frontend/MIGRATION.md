# Next.js Migration

This frontend has been migrated from Vite + React to Next.js.

## Key Changes

### Routing
- **Old**: React Router DOM with `<BrowserRouter>`, `<Routes>`, and `<Route>`
- **New**: Next.js App Router with file-based routing in `src/app/`

### Navigation
- **Old**: `import { Link, useNavigate } from 'react-router-dom'`
- **New**: `import Link from 'next/link'` and `import { useRouter } from 'next/navigation'`
- Links use `href` instead of `to` prop
- Router uses `router.push()` instead of `navigate()`

### Page Structure
- `/` → `src/app/page.tsx` (Landing page)
- `/login` → `src/app/login/page.tsx`
- `/signup` → `src/app/signup/page.tsx`  
- `/dashboard` → `src/app/dashboard/page.tsx`
- 404 → `src/app/not-found.tsx`

### API Routes
- API calls to `/api/*` are automatically proxied to `http://localhost:8000/*` via Next.js rewrites
- No changes needed in existing API client code

### Styling
- Tailwind CSS properly configured with `tailwind.config.js` and `postcss.config.js`
- Global styles in `src/app/globals.css`

### Client Components
Components that use hooks like `useState`, `useEffect`, `useRouter` need `"use client"` directive at the top

## Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will run on http://localhost:3000

## Old Files to Remove

The following old Vite-specific files are no longer needed:
- `index.html`
- `vite.config.ts`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js` (replaced with `.eslintrc.json`)
- `src/main.tsx`
- `src/App.tsx`
- `src/App.css`
- `src/index.css`
- `src/app/routes/` directory
- `src/pages/` directory (old pages migrated to `src/app/`)
- `src/features/auth/pages/` (migrated to `src/app/login` and `src/app/signup`)
