# Smart Tourist Safety System

## Overview

This is a comprehensive Smart Tourist Safety Monitoring & Incident Response System designed for India's Northeast region. The system leverages modern web technologies to provide real-time safety monitoring, emergency response capabilities, and administrative oversight for tourists, police, tourism departments, and system administrators.

The application serves as a digital safety ecosystem with blockchain-based digital ID generation, AI-powered anomaly detection, geo-fencing alerts, and multilingual support across 10+ Indian languages. It features role-based dashboards for different user types and provides critical safety features like panic buttons, real-time location tracking, and automated incident reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing with role-based navigation
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Internationalization**: Custom language provider supporting 11 languages (English + 10 Indian languages)
- **Theme System**: Custom theme provider with dark/light/system modes using CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Development**: TypeScript with ESBuild for production bundling
- **API Design**: RESTful endpoints with role-based access control
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Authentication**: Replit OAuth integration with Passport.js strategies
- **Real-time Features**: WebSocket support for live location tracking and emergency alerts

### Database & ORM
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Normalized schema with tables for users, tourist profiles, locations, safety zones, incidents, alerts, and itineraries
- **Data Validation**: Zod schemas for runtime type validation and Drizzle-zod integration

### Build & Development Tools
- **Build Tool**: Vite for fast development and optimized production builds
- **Package Management**: npm with TypeScript support
- **Development Server**: Hot module replacement with Vite dev server
- **Code Quality**: TypeScript strict mode with path mapping for clean imports

### Security & Privacy
- **Authentication**: OAuth 2.0 with Replit identity provider
- **Session Security**: Secure HTTP-only cookies with configurable TTL
- **Data Protection**: End-to-end encryption patterns and GDPR compliance considerations
- **Role-based Access**: Multi-tier permission system (tourist/police/tourism/admin)

## External Dependencies

### Core Infrastructure
- **Database Hosting**: Neon PostgreSQL serverless database
- **Authentication Provider**: Replit OAuth 2.0 service
- **Development Platform**: Replit integrated development environment

### UI & Component Libraries
- **shadcn/ui**: Accessible React component library built on Radix UI primitives
- **Radix UI**: Low-level UI primitives for accessibility and keyboard navigation
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Data & State Management
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form state management with validation
- **date-fns**: Date manipulation and formatting utilities

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type-safe JavaScript development
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for production

### Real-time & Communication
- **WebSocket (ws)**: Real-time bidirectional communication
- **Express Session**: Server-side session management
- **Passport.js**: Authentication middleware and strategies

### Geolocation & Mapping
- **Browser Geolocation API**: Native location tracking capabilities
- **Planned Integration**: Google Maps or OpenStreetMap for mapping features

### Monitoring & Analytics
- **Planned Integration**: Error tracking and performance monitoring services
- **Built-in Logging**: Custom logging system for API requests and system events