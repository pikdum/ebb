# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ebb is an Electron-based desktop application for browsing booru image boards (Danbooru, Gelbooru, Rule34, e621). The app provides a tabbed interface for searching and viewing posts from multiple booru sites with CORS bypassing and referer header management.

## Architecture

### Main Process (`main/main.ts`)
- Electron main process that creates browser windows
- Handles CORS bypassing and referer header manipulation for booru sites
- Includes auto-updater functionality
- Sets up context menu with save image/video options

### Renderer Process (`renderer/`)
- React-based frontend with TypeScript
- Tabbed interface managed by `App.tsx` with keyboard shortcuts (Ctrl+T, Ctrl+W, Ctrl+H/L)
- Main content handled by `MainApp.tsx` with search and post display
- Components for different post types (images, videos, SWF files)

### Booru Integration (`renderer/lib/booru/`)
- Abstracted booru API layer supporting multiple sites
- Site-specific implementations for each booru service
- Unified interface for posts and tags across different APIs
- Each booru provider handles API differences and data transformation

## Development Commands

- `npm start` - Start development server with hot reload
- `npm run build` - Build both renderer and main processes
- `npm run check` - Run Biome formatter/linter checks
- `npm run check-types` - TypeScript type checking
- `npm run lint` - Biome linting
- `npm test` - Run test suite with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run check-all` - Run all checks (format, types, lint, tests)

## Build & Package Commands

- `npm run package` - Package for Windows and Linux
- `npm run package:linux` - Package for Linux only (AppImage)
- `npm run package:windows` - Package for Windows only

## Testing

- Uses Vitest for testing with React Testing Library
- Test files use `.test.ts` or `.test.tsx` extension
- Global test setup in `vitest.setup.ts`
- React Compiler plugin enabled for optimizations

## Code Standards

- Biome for formatting and linting (configured in `biome.json`)
- TypeScript strict mode enabled
- Lefthook pre-commit hooks automatically format staged files
- React components use functional components with hooks
- Uses Tailwind CSS for styling

## Key Dependencies

- Electron for desktop app framework
- React 19 with React Compiler optimizations
- Vite for bundling (separate configs for main and renderer)
- Biome for code formatting/linting instead of ESLint/Prettier
- electron-updater for automatic updates
- Various booru sites have specific API requirements handled by individual provider classes