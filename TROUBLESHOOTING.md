# Troubleshooting

Common problems and solutions when running the application with Docker Compose.

## Docker Compose Issues

**Services won't start:**
- Ensure all required ports are available (3000, 3001, 8000, 8001, 8002)
- If Compose exits with `MERCHANT_API_KEY must be set` (or `AGENT_API_KEY`/`MCP_API_KEY`), create the project-root `.env` from `.env.sample` and set the three keys
- Check that `.env` files are configured in both backend and frontend
- Verify SSL certificates are generated in reference-agent-frontend

**Database errors:**
- Delete data directories and restart: `docker-compose down -v && docker-compose up --build`

**Connectivity issues or hanging requests:**
- Restart the containers: `docker-compose down && docker-compose up`

## Frontend Issues

**HTTPS certificate warnings:**
- Ensure mkcert is installed and initialized: `mkcert -install`
- Regenerate certificates in reference-agent-frontend directory
- Restart your browser

**Cannot connect to backend:**
- Verify reference-agent-backend container is running and healthy
- Check browser console for CORS errors
- Ensure backend `.env` has all required credentials

## Backend Issues

**AI agent not working:**
- Verify `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, and `LLM_BASE_URL` in `.env`
- Check that reference-merchant-mcp container is running
- Review backend logs: `docker-compose logs reference-agent-backend`
- Ensure LLM API key is valid and has sufficient credits
- TLS errors reaching a self-signed LLM endpoint: set `LLM_TLS_VERIFY=false` in the agent backend `.env` (leave it `true` for OpenAI/Anthropic)

## Authentication Issues

**`401 Invalid or missing API key`:**
- The frontends bake the key in at build time — rebuild after changing it: `docker-compose up --build`
- Ensure the shared keys match across services: `MERCHANT_API_KEY` (merchant backend ↔ MCP ↔ merchant frontend), `AGENT_API_KEY` (agent backend ↔ agent frontend), `MCP_API_KEY` (agent backend ↔ MCP server)

**`500 Server misconfiguration: ... is not set`:**
- The service is running without its API key. Set it in the environment (project-root `.env` for Compose) and restart

**Passkey authentication fails:**
- Ensure VPP credentials are configured in frontend `.env`
- Use OTP `456789` for step-up authentication
- Check browser supports WebAuthn (modern Chrome, Firefox, Safari, Edge)

**VDP API errors:**
- Verify all Visa credentials in backend `.env`
- Check API logs in the frontend for detailed error messages
- Ensure you're using CERT environment credentials

## Docker Build Behind Corporate Proxy / Private Registry

If `pip install` fails during the Docker build due to network or SSL issues, the Dockerfiles support optional build secrets for a custom pip configuration and CA certificate.

1. Create a `pip.conf` in the project root with your proxy or registry settings (set `cert = /tmp/pip.crt` to reference the mounted certificate)
2. Place your corporate CA certificate at `pip.crt` in the project root
3. Create a `docker-compose.override.yml` to pass the secrets to the build:

```yaml
services:
  reference-agent-backend:
    build:
      secrets:
        - pipconf
        - cacert

  reference-merchant-backend:
    build:
      secrets:
        - pipconf
        - cacert

secrets:
  pipconf:
    file: ./pip.conf
  cacert:
    file: ./pip.crt
```

Then rebuild with `docker compose up --build`. These files are git-ignored and do not require any Dockerfile changes.