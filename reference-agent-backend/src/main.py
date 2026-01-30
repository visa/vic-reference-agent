# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# START GENAI
from src.config import settings
import logging
from fastapi.responses import JSONResponse
import json
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import cards, chat, commerce, passkey, tokens
from src.services.agent import lifespan

app = FastAPI(lifespan=lifespan)

 # Ensure the config is loaded before any other imports that depend on it
# Get the root logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add exception handler for any unhandled exceptions
@app.middleware("http")
async def add_exception_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logging.error(f"Unhandled exception at {request.url.path}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal Server Error"}
        )

# Add VDP logging middleware
@app.middleware("http")
async def add_vdp_logging_middleware(request: Request, call_next):
    response = await call_next(request)
    chunks = []
    async for chunk in response.body_iterator:
        chunks.append(chunk)
    response_body = b''.join(chunks)
    logs = request.state.logs if hasattr(request.state, 'logs') else []
    if logs and response.headers.get('Content-Type') == 'application/json':
        # START GENAI@GHCOPILOT
        try:
            if response_body:
                data = json.loads(response_body)
                if data is None:
                    data = {}
                data['logs'] = logs
                response_body = json.dumps(data).encode('utf-8')
                response.headers['Content-Length'] = str(len(response_body))
            else:
                # For empty responses (like 204 No Content), create a new JSON response with logs
                data = {'logs': logs}
                response_body = json.dumps(data).encode('utf-8')
                response.headers['Content-Length'] = str(len(response_body))
                response.headers['Content-Type'] = 'application/json'
        except json.JSONDecodeError:
            # If response isn't valid JSON, don't add logs
            pass
        # END GENAI@GHCOPILOT
    return Response(
        content=response_body,
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.media_type
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(cards.router, prefix="/cards", tags=["cards"])
app.include_router(commerce.router, prefix="/intents", tags=["intents"])
app.include_router(passkey.router, prefix="/passkey", tags=["passkey"])
app.include_router(tokens.router, prefix="/tokens", tags=["tokens"])
app.include_router(chat.router, prefix="/chat", tags=["chats"])

# END GENAI