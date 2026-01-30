# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy import text

# Global variables for engine and session factory
engine: Optional[AsyncEngine] = None
AsyncSessionLocal: Optional[async_sessionmaker] = None

DATABASE_URL = "sqlite+aiosqlite:///./data/merchant.db"

def init_db():
    """Initialize database engine and session factory."""
    global engine, AsyncSessionLocal

    # Assume sqlite
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL debugging
        connect_args={"check_same_thread": False}
    )

    # Create async session factory
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI routes to get database session."""
    if AsyncSessionLocal is None:
        init_db()

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def check_db_connection() -> bool:
    """Check if database connection is healthy."""
    try:
        if AsyncSessionLocal is None:
            init_db()

        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection check failed: {e}")
        return False

async def create_tables():
    """Create all database tables from SQLAlchemy models."""
    from app.models.models import Base

    if engine is None:
        init_db()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
