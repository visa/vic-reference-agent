# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database.database import get_db
from app.auth import require_api_key
from app.models.models import (
    Order as OrderModel,
    OrderItem as OrderItemModel
)
from app.schemas import Order, OrderList, Message
import uuid
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["orders"], dependencies=[Depends(require_api_key)])

@router.get("/", response_model=OrderList)
async def get_orders(
    customer_email: str = None,
    status: str = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get orders for a specific customer (filtered by email)."""
    # Require an explicit customer scope so this endpoint cannot be used to
    # enumerate every customer's orders (PII) by omitting the filter.
    if not customer_email:
        raise HTTPException(
            status_code=400,
            detail="customer_email is required."
        )

    stmt = select(OrderModel).options(
        selectinload(OrderModel.items).selectinload(OrderItemModel.product)
    )

    if customer_email:
        stmt = stmt.filter(OrderModel.customer_email == customer_email)

    if status:
        stmt = stmt.filter(OrderModel.status == status)

    # Get total count
    count_stmt = select(func.count()).select_from(OrderModel)
    if customer_email:
        count_stmt = count_stmt.filter(OrderModel.customer_email == customer_email)
    if status:
        count_stmt = count_stmt.filter(OrderModel.status == status)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar()

    # Get orders with pagination
    stmt = stmt.order_by(OrderModel.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    orders = result.scalars().all()

    return OrderList(orders=orders, total=total)

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific order by ID"""
    result = await db.execute(
        select(OrderModel)
        .filter(OrderModel.id == order_id)
        .options(selectinload(OrderModel.items).selectinload(OrderItemModel.product))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/number/{order_number}", response_model=Order)
async def get_order_by_number(order_number: str, db: AsyncSession = Depends(get_db)):
    """Get a specific order by order number"""
    result = await db.execute(
        select(OrderModel)
        .filter(OrderModel.order_number == order_number)
        .options(selectinload(OrderModel.items).selectinload(OrderItemModel.product))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: int,
    status: str,
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    result = await db.execute(
        select(OrderModel).filter(OrderModel.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    order.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(order, attribute_names=['items'])

    # Reload with relationships
    result = await db.execute(
        select(OrderModel)
        .filter(OrderModel.id == order.id)
        .options(selectinload(OrderModel.items).selectinload(OrderItemModel.product))
    )
    order = result.scalar_one()

    return order

@router.delete("/{order_id}", response_model=Message)
async def cancel_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Cancel an order (only if status is pending or confirmed)"""
    result = await db.execute(
        select(OrderModel).filter(OrderModel.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=400,
            detail="Order cannot be cancelled. Only pending or confirmed orders can be cancelled."
        )

    order.status = "cancelled"
    order.updated_at = datetime.utcnow()

    await db.commit()

    return Message(message=f"Order {order.order_number} has been cancelled successfully")
