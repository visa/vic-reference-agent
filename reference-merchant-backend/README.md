# Reference Merchant Backend

> FastAPI-based e-commerce backend for demonstration purposes

[![FastAPI](https://img.shields.io/badge/FastAPI-0.123.8-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org)

## Features

- 🛍️ **Product Catalog** - Search, filter, and browse products
- 🛒 **Shopping Cart** - Session-based cart management
- 💳 **Checkout Flow** - Traditional checkout with card validation
- 📦 **Order Management** - Track and manage orders
- 🔐 **Mock Payment Processing** - Payment validation with Luhn algorithm
- 📊 **API Documentation** - Interactive Swagger UI and ReDoc

## Prerequisites

### Required Software
- **Docker** (recommended for running the application)
- **Python** 3.12+ and **pip** (only required for local development without Docker)

## Environment Configuration

The backend requires an API key on every request (`X-Api-Key`). Set `MERCHANT_API_KEY` in the environment before running; the merchant MCP server and merchant frontend must use the same value. Under Docker Compose it is supplied from the project-root `.env`.

## Quick Start

### Running with Docker (Recommended)

```bash
# Build the image
docker build -t reference-merchant-backend .

# Run the container
docker run -p 8001:8001 \
  -e MERCHANT_API_KEY=your-merchant-api-key \
  -v $(pwd)/data:/app/data \
  reference-merchant-backend
```

### Running Locally

```bash
# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database with sample data
python create_sample_data.py

# Set the API key, then run the server
export MERCHANT_API_KEY=your-merchant-api-key
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

The API will be available at `http://localhost:8001`.

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## Project Structure

```
reference-merchant-backend/
├── app/
│   ├── database/           # Database configuration
│   ├── models/             # SQLAlchemy models
│   └── routes/             # API endpoints
├── data/                   # SQLite database storage
├── create_sample_data.py   # Database initialization script
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
└── README.md               # This file
```

## Development

### Hot Reload

For local development with automatic reloading:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Database Management

The SQLite database is automatically created when running with Docker. For local development, run `python create_sample_data.py` before starting the server.

To reset the database:

```bash
rm -rf data/
python create_sample_data.py
```

## Tech Stack

- **Runtime**: Python 3.12
- **Web Framework**: FastAPI 0.123.8
- **Server**: Uvicorn (async)
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: SQLite + aiosqlite
- **Validation**: Pydantic 2.5

## Support

For issues and questions, please open an issue in the repository.
