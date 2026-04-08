# Reference Agent Frontend

> React frontend for the AI shopping agent powered by Visa Intelligent Commerce

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat&logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0.7-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)

## Features

- 🤖 **AI Shopping Chat** - Conversational interface for product search and recommendations
- 💳 **Card Management** - Add and manage payment cards
- 🔐 **Passkey Authentication** - Secure WebAuthn passkey setup and authentication
- 🛒 **Agentic Checkout** - AI-driven checkout with intent authorization
- 🎨 **Visa Nova Design System** - Built with Visa's official design components
- 🔒 **HTTPS Support** - Secure local development with SSL certificates

## Prerequisites

### Required Software
- **Docker** (recommended for running the application)
- **mkcert** (for generating HTTPS certificates)
- **Node.js** 22+ and **npm** (only required for local development without Docker)

### Required Services
- **Reference Agent Backend** running on port 8000. See [reference-agent-backend](../reference-agent-backend/README.md) for setup instructions.

## SSL Certificate Setup

The frontend requires HTTPS for passkey authentication. You need to generate SSL certificates using `mkcert` before running the application (both with Docker and locally).

### Install mkcert

- **macOS**: `brew install mkcert`
- **Windows**: `choco install mkcert`
- See [mkcert repository](https://github.com/FiloSottile/mkcert) for other installation methods

**Add the root CA (one-time operation):**
```bash
mkcert -install
```

### Generate Certificates

From the `reference-agent-frontend` directory:

```bash
mkcert localhost 127.0.0.1 ::1
```

This creates:
- `localhost+2.pem` (certificate)
- `localhost+2-key.pem` (private key)

## Environment Configuration

The application requires a `.env` file. Copy `.env.sample` to `.env` and fill in the values:

### Required Variables

```bash
# Visa Payment Passkey (VPP) Configuration
VITE_VPP_API_KEY=your-vpp-api-key
VITE_VPP_CLIENT_APP_ID=your-vpp-client-app-id
```

## Quick Start

**Important:** Before running the application, you must complete the [SSL Certificate Setup](#ssl-certificate-setup) and configure your `.env` file with the required credentials.

### Running with Docker (Recommended)

```bash
# Set up environment configuration
cp .env.sample .env

# Fill in all values in .env

# Build the image
docker build -t reference-agent-frontend .

# Run the container
docker run -p 3000:3000 reference-agent-frontend
```

### Running Locally

```bash
# Set up environment configuration
cp .env.sample .env

# Fill in all values in .env

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at `https://localhost:3000`.

## Project Structure

```
reference-agent-frontend/
├── public/              # Static assets
├── src/
│   ├── app/            # Main application components
│   ├── assets/         # Images and static resources
│   ├── config/         # Configuration files
│   ├── constants/      # Application constants
│   ├── features/       # Feature-based modules
│   ├── lib/            # Third-party library integrations
│   ├── middleware/     # Redux middleware
│   ├── store/          # Redux store configuration
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## Available Scripts

### `npm start`
Runs the app in development mode with HTTPS enabled.\
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.

### `npm run build`
Builds the app for production to the `dist/` folder.

## Tech Stack

- **UI Framework**: React 19.0.0
- **Language**: TypeScript 4.9.5
- **Build Tool**: Vite 6.0.7
- **State Management**: Redux Toolkit 2.8.2
- **Routing**: React Router 6.28.0
- **Design System**: @visa/nova-react 2.5.4
- **Encryption**: jose 6.0.12 (JWT/JWE)

## Troubleshooting

### Browser shows security warning

**Solution:**
1. Ensure mkcert CA is installed: `mkcert -install`
2. Restart your browser completely
3. Clear browser SSL cache
4. Regenerate certificates: `mkcert localhost 127.0.0.1 ::1`

### Cannot connect to backend

**Solution:**
- Ensure reference-agent-backend is running at `http://localhost:8000`
- Check backend CORS settings allow `https://localhost:3000`
- Verify backend `.env` has all required credentials

### npm install fails

**Solution:**
- Ensure Node.js version is 22 or higher: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules/` and `package-lock.json`, then run `npm install` again

### Port 3000 already in use

**Solution:**
- Stop other applications using port 3000
- Or change the port in `package.json` scripts (also update backend CORS)

## Support

For issues and questions, please open an issue in the repository.
