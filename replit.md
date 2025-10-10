# Financial Simulator Application

## Overview

This is a financial simulation web application built for credit analysis and loan calculation. The application allows users to input company financial data and project details to calculate loan terms, interest rates, and payment schedules. It features a multi-step form flow that collects basic company information and project details, then generates financial simulation results based on company size, municipality priority status, and other parameters.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework and Tooling**
- Built with React 18+ using TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router)
- TanStack Query (React Query) for server state management
- React Hook Form with Zod for form validation and schema definition

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system (New York style variant)
- Tailwind CSS for styling with custom CSS variables for theming
- Component path aliases configured (@/components, @/lib, @/hooks)

**Page Structure**
- Multi-step form flow: BasicDataForm → ProjectDetailsForm → ResultsPage
- FormLayout component provides consistent header/footer wrapper
- Results stored in localStorage for persistence across navigation

### Backend Architecture

**Server Framework**
- Express.js REST API server
- Custom Vite middleware integration for development HMR
- Structured route registration pattern in `server/routes.ts`
- Request/response logging middleware with duration tracking

**Business Logic**
- Financial simulation endpoint `/api/simulate` calculates:
  - Company size classification (Pequeno/Médio/Grande Porte) based on annual revenue
  - Interest rate determination based on company size and municipality priority
  - Priority municipality validation (Amaturá, Manaus)
  - Payment calculations with grace period support

**Data Storage Strategy**
- In-memory storage implementation (MemStorage class)
- Storage abstraction layer (IStorage interface) for future database migration
- User schema defined but not actively used in current flow
- Session data persisted client-side via localStorage

### Database and ORM

**Schema Definition**
- Drizzle ORM configured for PostgreSQL (Neon serverless)
- Schema located in `shared/schema.ts` for shared access
- Users table defined with id, username, password fields
- Zod schemas generated from Drizzle schemas for validation
- Migration output directory: `./migrations`

**Database Configuration**
- Environment-based connection via DATABASE_URL
- Drizzle Kit for schema management and migrations
- PostgreSQL dialect with Neon serverless driver (@neondatabase/serverless)

### External Dependencies

**Third-Party UI Libraries**
- Radix UI component primitives (accordion, dialog, dropdown, etc.)
- Embla Carousel for carousel functionality
- Lucide React for icon system
- date-fns for date manipulation
- class-variance-authority (CVA) for component variant management

**Development Tools**
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)
- ESBuild for server-side bundling
- TypeScript with strict mode enabled
- PostCSS with Tailwind and Autoprefixer

**Geographic Data**
- Brazilian states and municipalities data stored in `shared/municipalities.ts`
- Supports all 27 Brazilian states with major municipalities
- Used for location validation and priority municipality checks

**Session Management**
- connect-pg-simple package included for PostgreSQL session storage (not currently active)
- Prepared for future authentication implementation

## Recent Changes

### PDF Generation Feature (October 10, 2025)
- **Added PDF export functionality**: Users can now download a complete simulation report with payment schedule
- **Libraries installed**: jspdf (^3.0.3) and jspdf-autotable (^5.0.2) 
- **PDF features**:
  - Professional header with platform branding (green #10b981)
  - Client information section (name, company, CNPJ, contact details)
  - Financing information (company size, activity sector, interest rates)
  - Financial summary (project value, financed amount, total paid, total interest)
  - Complete payment schedule table with amortization details (Price system)
  - Automatic pagination and page numbering
  - Platform color scheme applied throughout
- **Data flow updated**: ProjectDetailsForm now saves complete simulation data to localStorage
- **Payment calculation**: Implemented Price system (fixed installments) with grace period support
- **Implementation location**: `client/src/lib/pdfGenerator.ts` with integration in ResultsPage

### Technical Infrastructure Updates
- **Workflow configuration**: Created `start-server.sh` script to properly configure Node.js PATH for tsx execution
- Fixed compatibility issues between Bun and Vite 7 by ensuring proper Node.js environment
- Express 4.21.2 confirmed working correctly
- Server running on port 5000 with Vite HMR connected