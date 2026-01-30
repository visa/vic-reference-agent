# Troubleshooting

Common problems and solutions when running the application with Docker Compose.

## Docker Compose Issues

**Services won't start:**
- Ensure all required ports are available (3000, 3001, 8000, 8001, 8002)
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

**Passkey authentication fails:**
- Ensure VPP credentials are configured in frontend `.env`
- Use OTP `456789` for step-up authentication
- Check browser supports WebAuthn (modern Chrome, Firefox, Safari, Edge)

**VDP API errors:**
- Verify all Visa credentials in backend `.env`
- Check API logs in the frontend for detailed error messages
- Ensure you're using CERT environment credentials