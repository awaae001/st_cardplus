# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development
- `pnpm dev` - Start development server (Vite on port 3066)
- `pnpm build` - Build web version
- `pnpm preview` - Preview built web version

### Electron Development
- `pnpm start` - Start development with Electron (runs Vite + Electron concurrently)
- `pnpm electron:serve` - Build and serve with Electron in development mode
- `pnpm build:electron` - Build complete Electron application for production

### Utilities
- `pnpm electron` - Run Electron directly (requires prior build)

## Project Architecture

This is a Vue 3 + TypeScript + Electron desktop application for creating and managing SillyTavern character cards and worldbooks.

### Core Technology Stack
- **Frontend**: Vue 3 with Composition API, TypeScript
- **UI Framework**: Element Plus components
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Vite (port 3066 in dev)
- **Desktop**: Electron with main process in `electron/main.ts`
- **Package Manager**: pnpm

### Application Structure

The app uses Vue Router with a sidebar navigation layout that supports:
- Character card editing (`/card`)
- World/landmark editing (`/world`) 
- Character card output/generation (`/cardoutput`)
- World book management (`/worldbook`) - beta feature
- Toolbox utilities (`/toolbox`)

### Key Directories
- `src/components/charcard/` - Character card editing components
- `src/components/CharOutput/` - Character card output components  
- `src/components/worldbook/` - World book management components
- `src/components/toolsbox/` - Utility tools (JSON formatter, etc.)
- `src/pages/` - Main page components mapped to routes
- `src/utils/` - Utilities for localStorage and metadata handling
- `electron/` - Electron main process code

### Important Configuration
- Vite config includes Electron plugin and Tailwind CSS
- Uses path alias `@` pointing to `src/` directory
- Build output optimized with manual chunking for Element Plus and vendor libraries
- Electron builder configured for NSIS installer with custom icon

### UI/UX Features
- Responsive sidebar that collapses on desktop, slides out on mobile
- Dark/light mode toggle using VueUse
- Loading animations on route transitions
- Uses Iconify icons throughout the interface

### Data Management
- Character cards saved/loaded as JSON format
- LocalStorage utilities for persistence
- World book entries with structured data types