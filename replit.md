# Overview

This is a full-stack web application built with React, Express.js, and PostgreSQL. The project contains both a ball bouncing game implementation (HTML5 Canvas-based) and a 3D gaming framework using React Three Fiber. The application follows a monorepo structure with shared TypeScript schemas and utilities between client and server components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server with hot module replacement
- **TailwindCSS** for styling with Radix UI components for consistent design system
- **React Three Fiber** for 3D graphics and game development
- **Zustand** for state management with subscription-based stores
- **TanStack Query** for server state management and API caching
- **HTML5 Canvas** for 2D game implementation (ball bouncing game)

## Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** structure with `/api` prefix for all endpoints
- **Middleware-based architecture** with request logging and error handling
- **Development/Production** environment handling with conditional Vite integration

## Data Storage
- **PostgreSQL** database with connection via environment variable
- **Drizzle ORM** for database schema management and migrations
- **Neon Database** serverless PostgreSQL integration
- **In-memory storage fallback** for development with `MemStorage` implementation
- Database schema includes user management with username/password authentication

## State Management
- **Game State**: Zustand store managing game phases (ready, playing, ended)
- **Audio State**: Centralized audio management with mute/unmute functionality
- **Client-side caching**: TanStack Query for API response caching
- **Local Storage**: Custom utilities for persistent client-side data

## Authentication & Session Management
- Basic user schema with username/password fields
- Session handling prepared with `connect-pg-simple` for PostgreSQL session store
- Credential-based authentication flow ready for implementation

## Development Architecture
- **Monorepo structure** with shared TypeScript definitions
- **Hot reload** in development with Vite middleware integration
- **Path aliases** for clean imports (`@/` for client, `@shared/` for shared code)
- **TypeScript strict mode** with comprehensive type checking
- **ESM modules** throughout the application

# External Dependencies

## Database & Storage
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **Drizzle Kit**: Database schema management and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

## UI & Styling
- **@radix-ui/***: Comprehensive component library for accessibility
- **TailwindCSS**: Utility-first CSS framework
- **@fontsource/inter**: Inter font family integration
- **Lucide React**: Icon library for consistent iconography

## 3D Graphics & Gaming
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions for R3F
- **@react-three/postprocessing**: Post-processing effects for 3D scenes
- **vite-plugin-glsl**: GLSL shader support in Vite

## State Management & Data Fetching
- **Zustand**: Lightweight state management
- **@tanstack/react-query**: Server state management and caching
- **React Hook Form**: Form state management (prepared)

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

## Audio & Media
- HTML5 Audio API integration for game sounds and background music
- Support for multiple audio formats (mp3, ogg, wav)
- 3D model support (gltf, glb formats)