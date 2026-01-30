# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import Optional
import logging
from app.database.database import get_db
from app.models.models import Product as ProductModel
from app.schemas import Product, ProductList

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=ProductList)
async def search_products(
    query: Optional[str] = Query(None, description="Search query for product name or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    limit: int = Query(20, ge=1, le=100, description="Number of products to return"),
    offset: int = Query(0, ge=0, description="Number of products to skip"),
    db: AsyncSession = Depends(get_db)
):
    """Search and filter products"""

    # Build query
    filters = []

    if query:
        filters.append(
            or_(
                ProductModel.name.ilike(f"%{query}%"),
                ProductModel.description.ilike(f"%{query}%")
            )
        )

    if category:
        filters.append(ProductModel.category.ilike(f"%{category}%"))

    if min_price is not None:
        filters.append(ProductModel.price >= min_price)

    if max_price is not None:
        filters.append(ProductModel.price <= max_price)

    # Build select statement
    stmt = select(ProductModel)
    if filters:
        stmt = stmt.filter(and_(*filters))

    # Get total count
    count_stmt = select(func.count()).select_from(ProductModel)
    if filters:
        count_stmt = count_stmt.filter(and_(*filters))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()

    # Apply pagination and get results
    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    products = result.scalars().all()

    return ProductList(
        products=products,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all unique product categories"""
    result = await db.execute(
        select(ProductModel.category).distinct().where(ProductModel.category.isnot(None))
    )
    categories = [cat for cat in result.scalars().all()]
    return {"categories": categories}

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product by ID"""
    result = await db.execute(
        select(ProductModel).filter(ProductModel.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product