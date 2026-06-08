# Visa Intelligent Commerce Reference Agent

> Reference implementation for Visa Intelligent Commerce with AI-powered shopping agent

[![Python](https://img.shields.io/badge/Python-3.12.8-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Node](https://img.shields.io/badge/Node-22-339933.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat&logo=react&logoColor=white)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0.7-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

## Overview

This repository contains a full-fledged reference application demonstrating end-to-end Visa Intelligent Commerce (VIC) capabilities with an AI-powered shopping agent. The application showcases complete integrations with:

- 🛒 **Visa Intelligent Commerce (VIC)** - End-to-end agentic commerce flow with AI-driven product discovery and checkout
- 🎫 **Visa Token Service (VTS)** - Payment token provisioning and management for secure transactions
- 🔐 **Visa Payment Passkey (VPP)** - WebAuthn passkey authentication for frictionless, secure checkout
- 🤖 **AI Shopping Agent** - Conversational product search and personalized recommendations using LangGraph
- 🔌 **Model Context Protocol (MCP)** - Tool-based AI interactions for seamless shopping experiences

### Network Support

**Note:** VIC (Visa Intelligent Commerce) is Visa card network centric. This reference implementation is designed specifically for the Visa card network and does not support other payment card networks.

## Architecture

The application consists of 5 microservices:

```
┌────────────────────────────────┐
│  Reference Agent Frontend      │
│  (React - HTTPS Port 3000)     │
│  - Shopping Agent UI           │
│  - Card Management UI          │
│  - VPP Integration via VTS     │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│  Reference Agent Backend       │
│  (FastAPI - Port 8000)         │
│  - Shopping Agent              │
│  - Card/Token Management       │
│  - VTS/VIC Integration         │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐ ┌──────────────────────────────┐
│  Reference Merchant MCP        │ │  Reference Merchant Frontend │
│  (Express - Port 8002)         │ │  (React - Port 3001)         │
│  - MCP Tool Server             │ │  - Product Browsing          │
│  - AI Shopping Tools           │ │  - Cart Management           │
│  - Form Elicitation            │ │  - Checkout Flow             │
└────────────────┬───────────────┘ └──────────────┬───────────────┘
                 │                                │
                 ▼                                ▼
                 ┌────────────────────────────────┐
                 │  Reference Merchant Backend    │
                 │  (FastAPI - Port 8001)         │
                 │  - Product API                 │
                 │  - Cart API                    │
                 │  - Order API                   │
                 └────────────────────────────────┘
```

## Prerequisites

Before you begin, ensure you have:

### Required Software
- **Docker** and **Docker Compose** (recommended for running the application)
- **mkcert** (for generating HTTPS certificates)
- **Node.js** 22+ (only required for local development without Docker)
- **Python** 3.12.8+ (only required for local development without Docker)

### Required Credentials

Contact your Visa representative to obtain:
- Visa Token Service (VTS) credentials
- Visa Intelligent Commerce (VIC) credentials
- Token Requestor (TR) credentials
- Message Level Encryption (MLE) keys
- Visa Payment Passkey (VPP) credentials

You will also need:
- LLM API credentials (OpenAI or Anthropic) for the AI agent

**Important:** Developers must obtain their own LLM provider credentials separately. The LLM API credentials (OpenAI or Anthropic) are not Visa API credentials and must be acquired directly from the respective LLM providers.

## Quick Start

The easiest way to run the entire application is with Docker Compose.

### 1. Generate SSL Certificate

In order for the passkey integration to work properly, the frontend must use HTTPS, which means that a trusted SSL certificate is needed for localhost.

**Install mkcert:**
- **macOS**: `brew install mkcert`
- **Windows**: `choco install mkcert`
- See [mkcert repository](https://github.com/FiloSottile/mkcert) for other installation methods

**Add the root CA (one-time operation):**
```bash
mkcert -install
```

**Generate certificates:**
```bash
cd reference-agent-frontend
mkcert localhost 127.0.0.1 ::1
cd ..
```

### 2. Configure Environment Variables

Set up the shared API keys used by Docker Compose (project root):

```bash
cp .env.sample .env
# Edit .env and set MERCHANT_API_KEY, AGENT_API_KEY, and MCP_API_KEY
# Generate strong values, e.g.: openssl rand -hex 32
```

Set up the reference-agent-backend environment:

```bash
cd reference-agent-backend
cp .env.sample .env
# Edit .env and fill in all credentials
cd ..
```

Set up the reference-agent-frontend environment:

```bash
cd reference-agent-frontend
cp .env.sample .env
# Edit .env and fill in all credentials
cd ..
```

### 3. Start All Services

From the project root:

```bash
docker-compose up --build
```

This will start all 5 services:
- **reference-agent-frontend**: https://localhost:3000
- **reference-agent-backend**: http://localhost:8000
- **reference-merchant-frontend**: http://localhost:3001
- **reference-merchant-backend**: http://localhost:8001
- **reference-merchant-mcp**: http://localhost:8002

### 4. Use the Application

See [USER_GUIDE.md](USER_GUIDE.md) for a step-by-step walkthrough of adding cards, setting up passkeys, and shopping with the AI agent.

### 5. Stop All Services

```bash
docker-compose down
```

## Project Structure

```
vic-reference-agent/
├── reference-agent-backend/      # FastAPI backend with AI agent
├── reference-agent-frontend/     # React frontend for AI shopping
├── reference-merchant-backend/   # FastAPI backend for merchant
├── reference-merchant-frontend/  # React frontend for merchant
├── reference-merchant-mcp/       # MCP server for shopping tools
├── docker-compose.yml            # Docker Compose configuration
└── README.md                     # This file
```

Each subdirectory has its own README with detailed setup instructions for local development.

## Running Without Docker Compose

If you prefer not to use Docker Compose, you can run each service individually. Each subdirectory contains its own README with setup and run instructions:

- [reference-agent-backend/README.md](reference-agent-backend/README.md)
- [reference-agent-frontend/README.md](reference-agent-frontend/README.md)
- [reference-merchant-backend/README.md](reference-merchant-backend/README.md)
- [reference-merchant-frontend/README.md](reference-merchant-frontend/README.md)
- [reference-merchant-mcp/README.md](reference-merchant-mcp/README.md)

### Service Dependencies

When running services individually, start them in this order:

1. **reference-merchant-backend** (port 8001)
2. **reference-merchant-mcp** (port 8002) - depends on merchant backend
3. **reference-agent-backend** (port 8000) - depends on merchant MCP
4. **reference-merchant-frontend** (port 3001) - depends on merchant backend
5. **reference-agent-frontend** (port 3000) - depends on agent backend

## Troubleshooting

Having issues? See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions.

## Support

For issues and questions, please open an issue in the repository.

For Visa API credentials and support, contact your Visa representative.
