# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import create_tables, init_db, check_db_connection
from app.routes import products, cart, orders

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Silence verbose third-party loggers
logging.getLogger('aiosqlite').setLevel(logging.WARNING)

# Create FastAPI app
app = FastAPI(
    title="Reference Merchant API",
    description="Reference Merchant e-commerce backend API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("="*60)
    logger.info("Starting Reference Merchant API v1.0.0")
    logger.info("="*60)

    # Initialize database
    try:
        logger.info("Initializing database engine...")
        init_db()
        logger.info("✓ Database engine initialized successfully")
    except Exception:
        logger.error("✗ Database initialization failed", exc_info=True)
        raise

    # Check database connection
    try:
        logger.info("Checking database connection...")
        db_healthy = await check_db_connection()
        if db_healthy:
            logger.info("✓ Database connection successful")
        else:
            logger.warning("✗ Database connection check failed")
    except Exception:
        logger.error("✗ Database connection check error", exc_info=True)

    # Create tables if they don't exist
    try:
        logger.info("Creating/verifying database tables...")
        await create_tables()
        logger.info("✓ Database tables created/verified successfully")
    except Exception:
        logger.error("✗ Failed to create tables", exc_info=True)
        raise

    logger.info("="*60)
    logger.info("Application startup complete - listening on port 8001")
    logger.info("="*60)

if __name__ == "__main__":
    import uvicorn
    # Run with debug logging
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        log_level="debug",
        access_log=True
    )
