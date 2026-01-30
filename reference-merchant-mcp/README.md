<!-- START GENAI -->
# Reference Merchant MCP Server

> MCP (Model Context Protocol) server bridging the Reference Merchant Backend API

[![Node](https://img.shields.io/badge/Node-22.13.0-339933.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## Features

- 🔍 **search_catalog** - Search and filter products in the merchant catalog
- 🛒 **create_cart** - Create a new shopping cart session
- ➕ **add_item_to_cart** - Add products to a shopping cart
- 💳 **checkout_cart** - Complete checkout with form elicitation for payment data
- 🌐 **StreamableHTTP Transport** - HTTP + SSE for multi-client support
- 📝 **Form Elicitation** - Secure payment information collection

## Prerequisites

### Required Software
- **Docker** (recommended for running the application)
- **Node.js** 22+ and **npm** (only required for local development without Docker)

### Required Services
- **Reference Merchant Backend** running on port 8001. See [reference-merchant-backend](../reference-merchant-backend/README.md) for setup instructions.

## Quick Start

### Running with Docker (Recommended)

```bash
# Build the image
docker build -t reference-merchant-mcp .

# Run the container
docker run -p 8002:8002 reference-merchant-mcp
```

### Running Locally

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

The MCP server will be available at `http://localhost:8002/mcp`.

## Project Structure

```
reference-merchant-mcp/
├── src/
│   └── index.ts        # MCP server implementation
├── dist/               # Compiled JavaScript (after build)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## Available Scripts

### `npm run dev`
Runs the server in development mode with tsx (no build needed).

### `npm run build`
Compiles TypeScript to JavaScript in the `dist/` folder.

### `npm start`
Runs the compiled server from `dist/index.js`.

## MCP Tools

### search_catalog

Search the product catalog with optional filters.

**Parameters:**
- `query` (string, optional): Search query for product name or description
- `category` (string, optional): Filter by product category
- `min_price` (number, optional): Minimum price filter
- `max_price` (number, optional): Maximum price filter
- `limit` (number, optional): Number of products to return (default: 20)
- `offset` (number, optional): Number of products to skip (default: 0)

### create_cart

Create a new shopping cart and return the session ID.

**Returns:** Cart session ID

### add_item_to_cart

Add a product to the shopping cart.

**Parameters:**
- `session_id` (string, required): Cart session ID
- `product_id` (number, required): Product ID to add
- `quantity` (number, optional): Quantity of the product (default: 1)

### checkout_cart

Complete checkout with automatic payment information elicitation.

**Parameters:**
- `session_id` (string, required): Cart session ID
- `customer_name` (string, required): Customer's full name
- `customer_email` (string, required): Customer's email address
- `customer_phone` (string, optional): Customer's phone number
- `shipping_address` (string, optional): Shipping address

**Payment Elicitation:**
The tool uses **form elicitation** to collect sensitive payment information (card_number, expiry_date, cvv) via the SSE stream. This keeps sensitive data out of tool parameters and provides schema validation.

## Tech Stack

- **Runtime**: Node.js 22
- **Language**: TypeScript 5.9.3
- **MCP Framework**: @modelcontextprotocol/sdk 1.25.2
- **HTTP Server**: Express 5.2.1
- **HTTP Client**: Axios 1.13.2
- **Validation**: Zod 4.2.1

## Troubleshooting

### MCP server not starting
- Ensure Node.js version is 22 or higher: `node --version`
- Check if port 8002 is available: `lsof -i :8002`
- Verify dependencies are installed: `npm install`

### Backend API connection errors
- Ensure the backend is running on port 8001
- Check `API_BASE_URL` environment variable
- Test backend directly: `curl http://localhost:8001/api/products/`

### Form elicitation not working
- Ensure your MCP client supports form elicitation (SSE required)
- Check that the SSE stream is properly established (GET /mcp)
- Verify session ID is being sent in headers

## Support

For issues and questions, please open an issue in the repository.
<!-- END GENAI -->
