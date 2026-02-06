# LuminaScale - AI Image Enhancer

## Overview

LuminaScale is a web application that allows users to upload low-quality images and receive AI-enhanced, high-resolution versions. The core feature uses GFPGAN + Real-ESRGAN via a custom API to upscale images up to 4x with a before-and-after comparison slider and download capability.

The application includes multiple pages: home (landing), image enhancement tool, contact form, privacy policy, and terms of service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS loaded via CDN with custom configuration
- **Bundler**: Vite with React plugin
- **Routing**: Client-side state-based routing using React useState (no external router library)
- **Font**: Space Grotesk from Google Fonts

**Component Structure**:
- `App.tsx` - Main app with page state management
- `components/` - Reusable UI components (Header, Footer, ImageSlider, ImageEditor, ImageEnhancer)
- `views/` - Page-level components (HomePage, EnhancePage, ContactPage, etc.)
- `services/` - API service layers (geminiService for image enhancement)
- `utils/` - Helper functions (fileUtils for image processing and validation)

**Key Frontend Features**:
- Image upload with drag-and-drop support
- Before/after comparison slider with blur effect on "before" image
- Built-in image editor with transform and adjustment tools
- Multiple enhancement styles (balanced, maximum)
- Progress bar with stage tracking during enhancement
- Mobile-optimized image compression
- Retry logic with exponential backoff
- AbortController for timeout handling (120s)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Server Entry**: `server/main.ts` (development), `server/production.ts` (production)
- **API Prefix**: `/api/` routes proxied from Vite dev server (port 5000) to backend (port 3001)

**API Endpoints**:
- `POST /api/enhance` - Receives image data and enhancement style, returns AI-enhanced image
- `GET /api/health` - Health check endpoint

**Backend Features**:
- 120-second timeout for API calls
- Comprehensive logging with request IDs
- Image preprocessing with Sharp (resize, compress)
- Memory-safe pixel limits (1MP max input)

### AI Integration
- **Provider**: Custom GFPGAN + Real-ESRGAN API
- **API URL**: https://free-version-of-api-key.replit.app
- **Features**: 
  - Face restoration with GFPGAN
  - 2x and 4x upscaling with Real-ESRGAN
  - 10,000 requests/day quota
- **Authentication**: X-API-Key header
- **Required Secret**: `FREE_API_LUMINASCALE`

### Image Processing
- **Input limits**: 
  - Mobile: 1.44MP max, 70% JPEG quality
  - Desktop: 4MP max, 85% JPEG quality
- **Client-side upscale limits**:
  - Mobile: 2048px long edge, 4MP max
  - Desktop: 4096px long edge, 25MP max
- **Server preprocessing**: 1MP max input, PNG format for API

## External Dependencies

### AI Services
- **GFPGAN + Real-ESRGAN API** - Face restoration and image upscaling
  - API URL: https://free-version-of-api-key.replit.app
  - Required Secret: `FREE_API_LUMINASCALE`
  - Daily limit: 10,000 requests

### NPM Packages
- `express` - HTTP server framework
- `sharp` - Image processing
- `compression` - Response compression

### CDN Resources
- Tailwind CSS with forms and container-queries plugins
- Google Fonts (Space Grotesk)
- Material Symbols (icons)

### Development
- Vite dev server runs on port 5000
- Backend API server runs on port 3001
- Proxy configuration in `vite.config.ts` forwards `/api` requests to backend

### Production / Deployment
- **Build Command**: `npm run build` (builds Vite frontend to `dist/`)
- **Start Command**: `npm start` (runs `server/production.ts`)
- **Production Server**: `server/production.ts` - serves both API and static files on single port 5000
- **Deployment Target**: Autoscale (stateless, starts on demand)
- **Required Secrets**: `FREE_API_LUMINASCALE` for image enhancement API

## Recent Changes

### 2026-02-05: Switched to Custom GFPGAN API
- Removed Cloudinary integration
- Integrated custom GFPGAN + Real-ESRGAN API
- API URL: https://free-version-of-api-key.replit.app
- Uses FREE_API_LUMINASCALE secret for authentication
- 2x default upscale, 4x for "maximum" style
- 10,000 requests/day quota
- Added blur effect to "before" image in comparison slider
