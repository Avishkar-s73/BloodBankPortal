# 📁 Project Structure

## Overview
This document outlines the optimized folder structure for the BloodBridge platform.

## Root Structure
```
S73-0126-ANA-Team02-Full-Stack-With-NextjsAnd-AWS-Azure-Blood-Donation-Inventory-Management/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Prisma database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migration files
├── public/                   # Static assets (images, SVGs)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── docs/                     # Project documentation
│   ├── API-REFERENCE.md     # Complete API documentation
│   ├── API-ROUTE-STRUCTURE.md
│   ├── API-TESTING-GUIDE.md
│   ├── database-er-diagram.md
│   ├── database-schema-reference.md
│   ├── database-setup.md
│   ├── DATABASE-TESTING.md
│   ├── env-security.md
│   ├── LOCAL-SETUP-GUIDE.md
│   └── QUICK-COMMANDS.md
├── scripts/                  # Utility scripts
│   ├── setup-database.ps1
│   ├── setup-database.sh
│   ├── test-db-connection.ts
│   ├── demo-transaction.ts
│   └── demo-optimized-queries.ts
├── src/                      # Source code
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout with Header/Footer
│   │   ├── page.tsx         # Homepage
│   │   ├── globals.css      # Global styles
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blood-availability/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── env-example/
│   │   │   ├── page.tsx
│   │   │   └── ClientInfo.tsx
│   │   └── api/             # API routes
│   │       ├── blood-requests/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── blood-inventory/
│   │       │   └── route.ts
│   │       ├── donors/
│   │       │   └── route.ts
│   │       └── blood-banks/
│   │           └── route.ts
│   ├── components/          # React components
│   │   ├── features/       # Feature-specific components
│   │   │   ├── BloodAvailabilityList.tsx
│   │   │   ├── BloodBankCard.tsx
│   │   │   └── BloodRequestCard.tsx
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Welcome.tsx
│   │   └── ui/             # Reusable UI components
│   │       └── ApiInfo.tsx
│   ├── lib/                # Utility libraries
│   │   ├── prisma.ts       # Prisma client instance
│   │   └── env.ts          # Environment variable helpers
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── .env.example             # Environment template
├── .env.development         # Development environment
├── .env.production          # Production environment
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.mjs          # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation

```

## Component Organization

### `/src/components/features/`
Feature-specific components that implement business logic:
- `BloodAvailabilityList.tsx` - Display blood inventory
- `BloodBankCard.tsx` - Blood bank information card
- `BloodRequestCard.tsx` - Blood request display card

### `/src/components/layout/`
Layout and structural components:
- `Header.tsx` - Main navigation header
- `Footer.tsx` - Site footer
- `Welcome.tsx` - Welcome section

### `/src/components/ui/`
Reusable UI components:
- `ApiInfo.tsx` - API information display

## API Routes Structure

### `/src/app/api/`
RESTful API endpoints organized by resource:
- `blood-requests/` - Blood request CRUD operations
- `blood-inventory/` - Inventory management
- `donors/` - Donor registration and management
- `blood-banks/` - Blood bank operations

Each resource follows REST conventions:
- `GET /api/resource` - List all
- `POST /api/resource` - Create new
- `GET /api/resource/[id]` - Get single
- `PUT /api/resource/[id]` - Update
- `DELETE /api/resource/[id]` - Delete

## Key Files

### Configuration
- `next.config.mjs` - Next.js settings
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Project dependencies

### Database
- `prisma/schema.prisma` - Database schema definition
- `src/lib/prisma.ts` - Prisma client singleton

### Environment
- `.env.example` - Template for environment variables
- `src/lib/env.ts` - Type-safe environment access

## Recent Optimizations

✅ **Removed Docker files** - Simplified deployment approach
✅ **Consolidated duplicate folders** - Removed `bloodlink/` folder
✅ **Organized components** - Separated by features, layout, and UI
✅ **Enhanced API routes** - Added inventory, donors, and blood banks APIs
✅ **Updated documentation** - Comprehensive API reference and structure docs
✅ **Improved layout** - Added Header and Footer components
✅ **Created feature components** - BloodBankCard, BloodRequestCard

## Development Workflow

1. **Start development server**: `npm run dev`
2. **Access application**: `http://localhost:3000`
3. **View Prisma Studio**: `npm run prisma:studio`
4. **Run database migrations**: `npm run prisma:migrate`
5. **Seed database**: `npm run prisma:seed`

## Best Practices

- **Components**: Place feature-specific logic in `/features`, reusable UI in `/ui`
- **API Routes**: Follow RESTful conventions, use proper HTTP methods
- **Types**: Define interfaces in `/types` for shared data structures
- **Styling**: Use Tailwind CSS classes consistently
- **Environment**: Never commit `.env` files, use `.env.example` as template
