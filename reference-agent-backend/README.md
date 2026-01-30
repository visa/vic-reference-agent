<!-- START GENAI -->
# Reference Agent Backend

> FastAPI backend with AI shopping agent powered by Visa Intelligent Commerce

[![Python](https://img.shields.io/badge/Python-3.12.8-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

## Features

- 🤖 **AI Shopping Agent** - Personalized product recommendations using LangGraph
- 💳 **Card Management** - Add and manage payment cards with JWE encryption
- 🔐 **Passkey Authentication** - WebAuthn passkey support for secure checkout
- 🛒 **Agentic Commerce** - AI-driven checkout with intent authorization
- 🎫 **Token Management** - Payment token provisioning via Visa Token Service
- 🔌 **MCP Integration** - Connects to reference-merchant-mcp for shopping tools
- 🗄️ **SQLite Database** - Async SQLAlchemy with aiosqlite

## Prerequisites

### Required Software
- **Docker** (recommended for running the application)
- **Python** 3.12.8+ and **pip** (only required for local development without Docker)

### Required Services
- **Reference Merchant MCP server** running on port 8002. See [reference-merchant-mcp](../reference-merchant-mcp/README.md) for setup instructions.

## Environment Configuration

The API requires a `.env` file. Copy `.env.sample` to `.env` and fill in the values:

### Required Variables

```bash
# LLM Configuration (user-provided)
# Supported LLM Providers: openai, anthropic
LLM_PROVIDER=your-llm-provider   # e.g. openai
LLM_API_KEY=your-llm-api-key
LLM_MODEL=your-llm-model         # e.g. gpt-4.1
LLM_BASE_URL=your-llm-base-url   # e.g. https://api.openai.com/v1

# For all of the below configurations, please reach out to your Visa representative.

# Visa Developer Platform (VDP) Configuration
# If you are connecting to VDP CERT environment for both VTS and VIC, then these variables will be the same for both services.
# i.e. VTS_BASE_URL = VIC_BASE_URL, VTS_API_KEY = VIC_API_KEY, VTS_SHARED_SECRET = VIC_SHARED_SECRET
VTS_BASE_URL=https://cert.api.visa.com
VTS_API_KEY=your-vts-api-key
VTS_SHARED_SECRET=your-vts-shared-secret
VIC_BASE_URL=https://cert.api.visa.com
VIC_API_KEY=your-vic-api-key
VIC_SHARED_SECRET=your-vic-shared-secret

# Token Requestor (TR) Configuration
TR_ID=your-token-requestor-id
TR_CLIENT_ID=your-client-id
TR_APP_ID=your-app-id
TR_ENC_API_KEY=your-encrypted-api-key
TR_ENC_SHARED_SECRET=your-encrypted-shared-secret

# Message Level Encryption (MLE) Configuration
MLE_KEY_ID=your-mle-key-id
MLE_DEC_KEY=your-decryption-key
MLE_ENC_CERT=your-encryption-cert
```

## Quick Start

**Important:** Before running the application, you must set up a `.env` file with required credentials. Contact your Visa representative to obtain the necessary credentials.

### Running with Docker (Recommended)

```bash
# Set up environment configuration
cp .env.sample .env

# Fill in all values in .env

# Build the image
docker build -t reference-agent-backend .

# Run the container
docker run -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  reference-agent-backend
```

### Running Locally

```bash
# Set up environment configuration
cp .env.sample .env

# Fill in all values in .env

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the database and tables
python setup_db.py

# Run the application
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
reference-agent-backend/
├── src/
│   ├── api/routes/         # API endpoints
│   ├── models/             # SQLAlchemy models
│   ├── repositories/       # Database access layer
│   ├── schemas/            # Pydantic request/response models
│   ├── services/           # Business logic
│   └── utils/              # Utilities and constants
├── data/                   # SQLite database storage
├── setup_db.py             # Database initialization script
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
└── README.md               # This file
```

## Development

### Hot Reload

For local development with automatic reloading:

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Database Management

The SQLite database is automatically created when running with Docker. For local development, run `python setup_db.py` before starting the server.

To reset the database:

```bash
rm -rf data/
python setup_db.py
```

## AI Agent

The AI shopping agent uses:
- **LangGraph** for agent orchestration
- **LangChain** for LLM integration
- **MCP (Model Context Protocol)** for tool access

The agent can:
- Get available product categories
- Search for products based on user preferences
- Ask clarifying questions to understand user needs
- Provide personalized recommendations
- Manage shopping carts
- Complete checkout with passkey authentication

See `src/services/agent.py` for the agent implementation and prompt.

## Tech Stack

- **Runtime**: Python 3.12.8
- **Web Framework**: FastAPI
- **Server**: Uvicorn (ASGI)
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: SQLite + aiosqlite
- **AI Orchestration**: LangChain + LangGraph
- **MCP Integration**: langchain-mcp-adapters
- **Encryption**: jwcrypto (JWE)
- **Validation**: Pydantic 2.7

## Troubleshooting

### API not starting
- Ensure Python version is 3.12.8 or higher: `python --version`
- Check if port 8000 is available: `lsof -i :8000`
- Verify `.env` file exists and has all required variables
- Check that dependencies are installed: `pip list`

### Configuration errors
- Ensure `.env` file exists (copy from `.env.sample`)
- Verify all required environment variables are set
- Check for typos in variable names (case-sensitive)

### Database errors
- Delete and recreate database: `rm -rf data/ && python setup_db.py`
- Check file permissions on `data/` directory

### MCP connection errors
- Ensure reference-merchant-mcp is running on port 8002
- Check `MERCHANT_MCP_URL` environment variable
- Test MCP server: `curl http://localhost:8002/health`

### AI agent not working
- Verify `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, and `LLM_BASE_URL` are set in `.env`
- Check that MCP server is accessible
- Review logs for specific error messages
- Ensure LLM API key is valid and has sufficient credits

## Support

For issues and questions, please open an issue in the repository.
<!-- END GENAI -->
