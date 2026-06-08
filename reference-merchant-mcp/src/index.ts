#!/usr/bin/env node
/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import { randomUUID } from 'node:crypto';
import { type Request, type Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import axios, { AxiosInstance } from 'axios';
import * as z from 'zod/v4';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001';
const PORT = 8002;

// Utility function for timestamps
const timestamp = () => new Date().toISOString();

/**
 * Sanitize untrusted free-text fields that originate from the merchant catalog
 * (product name/description) before they are returned as MCP tool output and
 * injected into the LLM context.
 *
 * Catalog text is treated as untrusted data, never instructions. We:
 *  1. coerce to string and cap length to bound the injection surface,
 *  2. neutralize common prompt-injection / role-spoofing markers and any
 *     delimiter sequences (including our own boundary tokens), and
 *  3. wrap the value in clearly-labelled boundaries carrying a per-response
 *     random nonce so the model can distinguish data from instructions and an
 *     attacker cannot forge a closing boundary.
 *
 * Per genai-dsr 6.6 and mcp-dsr 3.1: all agent inputs, including externally
 * fetched data, must be validated/sanitized before use.
 */
const MAX_UNTRUSTED_LEN = 2000;
function sanitizeUntrustedText(value: unknown, nonce: string): string {
  let text = typeof value === 'string' ? value : String(value ?? '');

  // Bound the injection surface.
  if (text.length > MAX_UNTRUSTED_LEN) {
    text = text.slice(0, MAX_UNTRUSTED_LEN) + '…[truncated]';
  }

  text = text
    // Strip our own boundary markers so they cannot be forged in the data.
    .replace(/«\/?untrusted[^»]*»/gi, '')
    // Neutralize angle-bracket / backtick delimiters used to fake structure.
    .replace(/[<>`]/g, ' ')
    // Defang chat role / system markers (e.g. "system:", "assistant:", "<|im_start|>").
    .replace(/\|?\b(system|assistant|user|developer|tool)\b\s*:/gi, '$1​:')
    .replace(/<\|[^|]*\|>/g, ' ')
    // Defang the most common injection imperative without dropping legitimate
    // product copy: insert a zero-width break so it is no longer a directive.
    .replace(
      /\b(ignore|disregard|override|forget)\b(\s+(all|any|the|your|previous|prior|above)\b)/gi,
      '$1​$2'
    );

  return `«untrusted:${nonce}»${text}«/untrusted:${nonce}»`;
}

// Create axios client for backend API.
// The merchant backend requires an API key (X-Api-Key); supply it from the
// environment so this trusted server-to-server caller can authenticate.
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.MERCHANT_API_KEY
      ? { 'X-Api-Key': process.env.MERCHANT_API_KEY }
      : {}),
  },
});

// Create MCP server
const mcpServer = new McpServer(
  {
    name: 'reference-merchant-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {},
  }
);

/**
 * Tool: get_categories
 * Get all available product categories
 */
mcpServer.registerTool(
  'get_categories',
  {
    description: 'Get a list of all available product categories in the catalog',
    inputSchema: {},
  },
  async (args, extra) => {
    try {
      const response = await apiClient.get('/products/categories');

      const result = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                categories: response.data.categories,
              },
              null,
              2
            ),
          },
        ],
      };

      return result;
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error getting categories: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool: search_catalog
 * Search the product catalog with optional filters
 */
mcpServer.registerTool(
  'search_catalog',
  {
    description: 'Search the product catalog with optional filters for category, price range, and search query',
    inputSchema: {
      query: z.string().optional().describe('Search query for product name or description'),
      category: z.string().optional().describe('Filter by product category'),
      min_price: z.number().optional().describe('Minimum price filter'),
      max_price: z.number().optional().describe('Maximum price filter'),
      limit: z.number().optional().default(20).describe('Number of products to return (default: 20)'),
      offset: z.number().optional().default(0).describe('Number of products to skip (default: 0)'),
    },
  },
  async (args, extra) => {
    try {
      const params: any = {};
      if (args.query) params.query = args.query;
      if (args.category) params.category = args.category;
      if (args.min_price !== undefined) params.min_price = args.min_price;
      if (args.max_price !== undefined) params.max_price = args.max_price;
      if (args.limit !== undefined) params.limit = args.limit;
      if (args.offset !== undefined) params.offset = args.offset;

      const response = await apiClient.get('/products/', { params });

      // Untrusted free-text catalog fields are sanitized + delimited before
      // entering the LLM context (see sanitizeUntrustedText).
      const nonce = randomUUID();
      const products = response.data.products.map((p: any) => ({
        id: p.id,
        name: sanitizeUntrustedText(p.name, nonce),
        description: sanitizeUntrustedText(p.description, nonce),
        price: p.price,
        category: sanitizeUntrustedText(p.category, nonce),
        stock_quantity: p.stock_quantity,
        image_url: p.image_url,
      }));

      const result = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                products,
                total: response.data.total,
                limit: response.data.limit,
                offset: response.data.offset,
              },
              null,
              2
            ),
          },
        ],
      };

      return result;
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error searching catalog: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool: create_cart
 * Create a new shopping cart and return the session ID
 */
mcpServer.registerTool(
  'create_cart',
  {
    description: 'Create a new shopping cart and return the session ID',
    inputSchema: {},
  },
  async (args, extra) => {
    try {
      const response = await apiClient.post('/cart/');

      const result = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                session_id: response.data.session_id,
                cart_id: response.data.id,
                message: 'Cart created successfully',
              },
              null,
              2
            ),
          },
        ],
      };

      return result;
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error creating cart: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool: get_cart
 * Get cart contents by session ID
 */
mcpServer.registerTool(
  'get_cart',
  {
    description: 'Get the contents of a shopping cart by session ID',
    inputSchema: {
      session_id: z.string().describe('Cart session ID'),
    },
  },
  async (args, extra) => {
    try {
      const { session_id } = args;

      const response = await apiClient.get(`/cart/${session_id}`);

      const cart = response.data;
      // Untrusted product name is sanitized + delimited before reaching the LLM.
      const nonce = randomUUID();
      const items = cart.items.map((item: any) => ({
        product_id: item.product.id,
        product_name: sanitizeUntrustedText(item.product.name, nonce),
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      const result = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                cart: {
                  session_id: cart.session_id,
                  items,
                  subtotal: cart.subtotal,
                  tax: cart.tax,
                  shipping: cart.shipping,
                  total_amount: cart.total_amount,
                },
              },
              null,
              2
            ),
          },
        ],
      };

      return result;
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error getting cart: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool: add_item_to_cart
 * Add a product to the shopping cart
 */
mcpServer.registerTool(
  'add_item_to_cart',
  {
    description: 'Add a product to the shopping cart',
    inputSchema: {
      session_id: z.string().describe('Cart session ID'),
      product_id: z.number().describe('Product ID to add to cart'),
      quantity: z.number().optional().default(1).describe('Quantity of the product'),
    },
  },
  async (args, extra) => {
    try {
      const { session_id, product_id, quantity = 1 } = args;

      const response = await apiClient.post(`/cart/${session_id}/items`, {
        product_id,
        quantity,
      });

      const cart = response.data;
      // Untrusted product name is sanitized + delimited before reaching the LLM.
      const nonce = randomUUID();
      const items = cart.items.map((item: any) => ({
        product_id: item.product.id,
        product_name: sanitizeUntrustedText(item.product.name, nonce),
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      const result = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                message: 'Item added to cart successfully',
                cart: {
                  session_id: cart.session_id,
                  items,
                  subtotal: cart.subtotal,
                  tax: cart.tax,
                  shipping: cart.shipping,
                  total_amount: cart.total_amount,
                },
              },
              null,
              2
            ),
          },
        ],
      };

      return result;
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error adding item to cart: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Tool: checkout_cart
 * Complete checkout with form elicitation for payment information
 */
mcpServer.registerTool(
  'checkout_cart',
  {
    description:
      'Checkout the cart and create an order. This tool will elicit payment information (card_number, expiry_date, cvv) from the user using a form.',
    inputSchema: {
      session_id: z.string().describe('Cart session ID'),
      customer_name: z.string().describe("Customer's full name"),
      customer_email: z.string().describe("Customer's email address"),
      customer_phone: z.string().optional().describe("Customer's phone number (optional)"),
      shipping_address: z.string().optional().describe('Shipping address'),
    },
  },
  async (args, extra) => {
    try {
      const { session_id, customer_name, customer_email, customer_phone, shipping_address } = args;

      // Use form elicitation to collect payment information
      const paymentResult = await mcpServer.server.elicitInput({
        mode: 'form',
        message: 'Please provide your payment information to complete the checkout:',
        requestedSchema: {
          type: 'object',
          properties: {
            card_number: {
              type: 'string',
              title: 'Card Number',
              description: 'Credit card number (16 digits)',
              minLength: 13,
              maxLength: 19,
            },
            expiry_date: {
              type: 'string',
              title: 'Expiry Date',
              description: 'Card expiry date (MM/YY format)',
            },
            cvv: {
              type: 'string',
              title: 'CVV',
              description: 'Card security code (3-4 digits)',
              minLength: 3,
              maxLength: 4,
            },
          },
          required: ['card_number', 'expiry_date', 'cvv'],
        },
      });

      // Handle user declining or cancelling the payment form
      if (paymentResult.action === 'decline') {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Checkout cancelled by user.',
            },
          ],
        };
      }

      if (paymentResult.action !== 'accept' || !paymentResult.content) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Checkout was cancelled.',
            },
          ],
        };
      }

      // Extract payment information from the form
      const { card_number, expiry_date, cvv } = paymentResult.content as {
        card_number: string;
        expiry_date: string;
        cvv: string;
      };

      // Prepare checkout data
      const checkoutData: any = {
        customer_name,
        customer_email,
        card_number,
        expiry_date,
        cvv,
      };

      if (customer_phone) checkoutData.customer_phone = customer_phone;
      if (shipping_address) checkoutData.shipping_address = shipping_address;

      // Call backend checkout API
      const response = await apiClient.post(`/cart/${session_id}/checkout`, checkoutData);

      const result = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                message: response.data.message,
                order: {
                  order_number: response.data.order.order_number,
                  customer_name: response.data.order.customer_name,
                  customer_email: response.data.order.customer_email,
                  total_amount: response.data.order.total_amount,
                  subtotal: response.data.order.subtotal,
                  tax_amount: response.data.order.tax_amount,
                  shipping_cost: response.data.order.shipping_cost,
                  status: response.data.order.status,
                  items: response.data.order.items,
                },
                payment: response.data.payment,
                fulfillment: response.data.fulfillment,
              },
              null,
              2
            ),
          },
        ],
      };

      return result;
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error during checkout: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const app = createMcpExpressApp({ host: '0.0.0.0' });

  // Add security headers middleware
  app.use((req: Request, res: Response, next: Function) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // Map to store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // MCP POST endpoint
  const mcpPostHandler = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      let transport: StreamableHTTPServerTransport;
      if (sessionId && transports[sessionId]) {
        // Reuse existing transport for this session
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request - create new transport
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            transports[sessionId] = transport;
            console.log(`[${timestamp()}] Session initialized: ${sessionId}`);
          },
        });

        // Set up onclose handler to clean up transport when closed
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        // Connect the transport to the MCP server BEFORE handling the request
        await mcpServer.connect(transport);

        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        // Invalid request - no session ID or not initialization request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: req.body?.id,
        });
        return;
      }

      // Handle the request with existing transport
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error(`[${timestamp()}] Error:`, error instanceof Error ? error.message : String(error));
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: req.body?.id,
        });
      }
    }
  };

  app.post('/mcp', mcpPostHandler);

  // Handle GET requests for SSE streams
  const mcpGetHandler = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };

  app.get('/mcp', mcpGetHandler);

  // Handle DELETE requests for session termination
  const mcpDeleteHandler = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    try {
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).send('Error processing session termination');
      }
    }
  };

  app.delete('/mcp', mcpDeleteHandler);

  // Start listening
  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Reference Merchant MCP Server`);
    console.log(`Running on: http://localhost:${PORT}/mcp`);
    console.log(`Backend API: ${API_BASE_URL}`);
    console.log(`Started at: ${timestamp()}`);
    console.log(`${'='.repeat(80)}`);
    console.log('\nAvailable tools:');
    console.log('  - get_categories: Get all available product categories');
    console.log('  - search_catalog: Search products with filters');
    console.log('  - create_cart: Create a new shopping cart');
    console.log('  - get_cart: Get cart contents by session ID');
    console.log('  - add_item_to_cart: Add products to cart');
    console.log('  - checkout_cart: Complete checkout with payment elicitation');
    console.log('\nConnect your MCP client to this server using the HTTP transport.');
    console.log(`${'='.repeat(80)}\n`);
  });

  // Handle server shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down server...');

    // Close all active transports to properly clean up resources
    for (const sessionId in transports) {
      try {
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch (error) {
        // Ignore errors during shutdown
      }
    }
    console.log('Server shutdown complete');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
