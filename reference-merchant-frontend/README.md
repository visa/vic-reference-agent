# Reference Merchant Frontend

> React-based e-commerce frontend for the Reference Merchant demo application

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat&logo=react&logoColor=white)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0.7-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node-22.13.0-339933.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)

## Features

- 🛍️ **Product Catalog** - Browse and search products with filters
- 🛒 **Shopping Cart** - Add, update, and remove items
- 💳 **Checkout Flow** - Complete purchase with card validation
- 📦 **Order Confirmation** - View order details after checkout
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔍 **Real-time Updates** - Cart updates instantly

## Prerequisites

### Required Software
- **Docker** (recommended for running the application)
- **Node.js** 22+ and **npm** (only required for local development without Docker)

### Required Services
- **Reference Merchant Backend** running on port 8001. See [reference-merchant-backend](../reference-merchant-backend/README.md) for setup instructions.

## Environment Configuration

The merchant backend requires an API key (`X-Api-Key`). The key is **never baked into the browser bundle**. Instead the storefront calls a same-origin `/api` path, and a server-side reverse proxy injects the key:

- **Production (Docker):** the nginx reverse proxy in the container adds `X-Api-Key`, read at runtime from the `MERCHANT_API_KEY` environment variable.
- **Local development:** the Vite dev server proxies `/api` and injects the key from the `MERCHANT_API_KEY` shell environment variable.

The value must match `MERCHANT_API_KEY` on the backend. Under Docker Compose it is supplied from the project-root `.env`.

## Quick Start

### Running with Docker (Recommended)

```bash
# Build the image (no secret is baked in at build time)
docker build -t reference-merchant-frontend .

# Run the container; the key is injected by nginx at runtime
docker run -p 3001:3001 -e MERCHANT_API_KEY=your-merchant-api-key reference-merchant-frontend
```

### Running Locally

```bash
# Set up environment configuration
cp .env.sample .env
# Edit .env and set MERCHANT_API_KEY

# Install dependencies
npm install

# Start the development server (reads MERCHANT_API_KEY for the dev proxy)
MERCHANT_API_KEY=your-merchant-api-key npm start
```

The application will be available at `http://localhost:3001`.

## Project Structure

```
reference-merchant-frontend/
├── public/              # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── context/        # React Context for state management
│   └── services/       # API client
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## Available Scripts

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.

### `npm run build`
Builds the app for production to the `dist/` folder.

## Tech Stack

- **UI Framework**: React 19.0.0
- **Routing**: React Router 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Build Tool**: Vite 6.0.7
- **Production Server**: nginx (Docker)

## Support

For issues and questions, please open an issue in the repository.
