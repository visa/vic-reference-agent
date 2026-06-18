# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.database.database import get_db
from app.auth import require_api_key
from app.models.models import (
    Cart as CartModel,
    CartItem as CartItemModel,
    Product as ProductModel,
    Order as OrderModel,
    OrderItem as OrderItemModel)
from app.schemas import (
    Cart, CartItemCreate, CartItemUpdate,
    Message)
from datetime import datetime
import secrets
import uuid
import re
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cart", tags=["cart"], dependencies=[Depends(require_api_key)])

def calculate_cart_totals(cart_items):
    """Calculate subtotal, tax, shipping, and total for the cart"""
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    tax = round(subtotal * 0.08, 2)  # 8% tax
    shipping = 9.99  # Fixed shipping cost
    total = round(subtotal + tax + shipping, 2)
    return subtotal, tax, shipping, total

def generate_order_number():
    """Generate a unique order number with a random suffix so it is not enumerable."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = secrets.token_hex(12).upper()
    return f"ORD-{timestamp}-{random_suffix}"

@router.post("/", response_model=Cart)
async def create_cart(db: AsyncSession = Depends(get_db)):
    """Create a new cart with a unique session ID"""
    session_id = str(uuid.uuid4())
    db_cart = CartModel(session_id=session_id)
    db.add(db_cart)
    await db.commit()
    await db.refresh(db_cart)

    # Reload cart with relationships to avoid lazy loading issues
    result = await db.execute(
        select(CartModel)
        .filter(CartModel.id == db_cart.id)
        .options(selectinload(CartModel.items).selectinload(CartItemModel.product))
    )
    cart = result.scalar_one()
    return cart

@router.get("/{session_id}", response_model=Cart)
async def get_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get cart by session ID"""
    result = await db.execute(
        select(CartModel)
        .filter(CartModel.session_id == session_id)
        .options(selectinload(CartModel.items).selectinload(CartItemModel.product))
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Calculate totals
    subtotal, tax, shipping, total = calculate_cart_totals(cart.items)

    cart.subtotal = subtotal
    cart.tax = tax
    cart.shipping = shipping
    cart.total_amount = total

    return cart

@router.post("/{session_id}/items", response_model=Cart)
async def add_item_to_cart(
    session_id: str,
    item: CartItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Add an item to the cart"""
    # Get or create cart
    result = await db.execute(
        select(CartModel).filter(CartModel.session_id == session_id)
    )
    cart = result.scalar_one_or_none()

    if not cart:
        cart = CartModel(session_id=session_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)

    # Check if product exists
    product_result = await db.execute(
        select(ProductModel).filter(ProductModel.id == item.product_id)
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if item already exists in cart
    existing_item_result = await db.execute(
        select(CartItemModel).filter(
            CartItemModel.cart_id == cart.id,
            CartItemModel.product_id == item.product_id
        )
    )
    existing_item = existing_item_result.scalar_one_or_none()

    if existing_item:
        # Update quantity
        existing_item.quantity += item.quantity
    else:
        # Add new item
        cart_item = CartItemModel(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)

    await db.commit()
    await db.refresh(cart, attribute_names=['items'])

    # Reload cart with relationships
    result = await db.execute(
        select(CartModel)
        .filter(CartModel.id == cart.id)
        .options(selectinload(CartModel.items).selectinload(CartItemModel.product))
    )
    cart = result.scalar_one()

    # Calculate totals
    subtotal, tax, shipping, total = calculate_cart_totals(cart.items)
    cart.subtotal = subtotal
    cart.tax = tax
    cart.shipping = shipping
    cart.total_amount = total

    return cart

@router.put("/{session_id}/items/{product_id}", response_model=Cart)
async def update_cart_item(
    session_id: str,
    product_id: int,
    item_update: CartItemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update the quantity of an item in the cart"""
    result = await db.execute(
        select(CartModel).filter(CartModel.session_id == session_id)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_item_result = await db.execute(
        select(CartItemModel).filter(
            CartItemModel.cart_id == cart.id,
            CartItemModel.product_id == product_id
        )
    )
    cart_item = cart_item_result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    if item_update.quantity <= 0:
        # Remove item if quantity is 0 or negative
        await db.delete(cart_item)
    else:
        cart_item.quantity = item_update.quantity

    await db.commit()
    await db.refresh(cart, attribute_names=['items'])

    # Reload cart with relationships
    result = await db.execute(
        select(CartModel)
        .filter(CartModel.id == cart.id)
        .options(selectinload(CartModel.items).selectinload(CartItemModel.product))
    )
    cart = result.scalar_one()

    # Calculate totals
    subtotal, tax, shipping, total = calculate_cart_totals(cart.items)
    cart.subtotal = subtotal
    cart.tax = tax
    cart.shipping = shipping
    cart.total_amount = total

    return cart

@router.delete("/{session_id}/items/{product_id}", response_model=Message)
async def remove_item_from_cart(
    session_id: str,
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Remove an item from the cart"""
    result = await db.execute(
        select(CartModel).filter(CartModel.session_id == session_id)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_item_result = await db.execute(
        select(CartItemModel).filter(
            CartItemModel.cart_id == cart.id,
            CartItemModel.product_id == product_id
        )
    )
    cart_item = cart_item_result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    await db.delete(cart_item)
    await db.commit()

    return Message(message="Item removed from cart successfully")

@router.delete("/{session_id}", response_model=Message)
async def clear_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    """Clear all items from the cart"""
    result = await db.execute(
        select(CartModel).filter(CartModel.session_id == session_id)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Delete all cart items
    await db.execute(
        delete(CartItemModel).filter(CartItemModel.cart_id == cart.id)
    )
    await db.commit()

    return Message(message="Cart cleared successfully")

@router.post("/{session_id}/checkout")
async def checkout_cart(
    session_id: str,
    checkout_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Checkout cart and create an order with payment processing"""

    def detect_card_brand(card_number):
        """Detect card brand from card number"""
        card_number = re.sub(r'\D', '', card_number)  # Remove non-digits

        if card_number.startswith('4'):
            return 'Visa'
        elif card_number.startswith(('51', '52', '53', '54', '55')) or card_number.startswith('2'):
            return 'Mastercard'
        elif card_number.startswith(('34', '37')):
            return 'American Express'
        elif card_number.startswith('6'):
            return 'Discover'
        else:
            return 'Unknown'

    def validate_card_number(card_number):
        """Basic Luhn algorithm validation"""
        card_number = re.sub(r'\D', '', card_number)
        if len(card_number) < 13 or len(card_number) > 19:
            return False

        # Luhn algorithm
        def luhn_checksum(card_num):
            def digits_of(n):
                return [int(d) for d in str(n)]
            digits = digits_of(card_num)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d*2))
            return checksum % 10

        return luhn_checksum(card_number) == 0

    def validate_expiry(expiry_date):
        """Validate expiry date format MM/YY or MM/YYYY"""
        if not expiry_date:
            return False

        try:
            if '/' in expiry_date:
                month, year = expiry_date.split('/')
                month = int(month)
                year = int(year)

                # Convert 2-digit year to 4-digit
                if year < 100:
                    year += 2000

                # Basic validation
                if month < 1 or month > 12:
                    return False

                # Check if card is not expired
                current_date = datetime.now()
                if year < current_date.year or (year == current_date.year and month < current_date.month):
                    return False

                return True
        except (ValueError, IndexError):
            return False

        return False

    def process_payment(card_data, amount):
        """
        Mock payment processing function
        In production, this would integrate with a real payment processor like Stripe, Square, etc.
        """
        card_number = card_data.get('card_number', '')
        expiry_date = card_data.get('expiry_date', '')
        cvv = card_data.get('cvv', '')

        # Validate card number
        if not validate_card_number(card_number):
            return {"success": False, "error": "Invalid card number"}

        # Validate expiry date
        if not validate_expiry(expiry_date):
            return {"success": False, "error": "Invalid or expired card"}

        # Validate CVV
        if not cvv or len(cvv) < 3 or len(cvv) > 4:
            return {"success": False, "error": "Invalid CVV"}

        # Mock payment processing - always succeeds for demo
        # In production, make API call to payment processor here
        return {
            "success": True,
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "card_brand": detect_card_brand(card_number),
            "last_four": card_number[-4:]
        }

    # Get cart by session_id with eager loading
    result = await db.execute(
        select(CartModel)
        .filter(CartModel.session_id == session_id)
        .options(selectinload(CartModel.items).selectinload(CartItemModel.product))
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate totals using helper function
    subtotal, tax_amount, shipping_cost, total_amount = calculate_cart_totals(cart.items)

    # Extract required fields from checkout_data
    customer_email = checkout_data.get('customer_email')
    customer_name = checkout_data.get('customer_name')

    if not customer_email or not customer_name:
        raise HTTPException(
            status_code=400,
            detail="Customer email and name are required"
        )

    # Extract payment information - handle both frontend and MCP agent formats
    payment_data = {
        'card_number': checkout_data.get('card_number'),
        'expiry_date': checkout_data.get('expiry_date'),
        'cvv': checkout_data.get('cvv'),
        'name_on_card': checkout_data.get('name_on_card') or checkout_data.get('cardholder_name')
    }

    # Payment data must be supplied by the caller; no hardcoded demo-card fallback.

    # Validate payment information is provided
    if not all([payment_data['card_number'], payment_data['expiry_date'], payment_data['cvv']]):
        raise HTTPException(
            status_code=400,
            detail="Complete payment information is required (card number, expiry date, CVV)"
        )

    # Process payment
    payment_result = process_payment(payment_data, total_amount)

    if not payment_result['success']:
        raise HTTPException(
            status_code=400,
            detail=f"Payment failed: {payment_result['error']}"
        )

    # Handle shipping address - handle both string and object formats
    shipping_address = checkout_data.get('shipping_address', {})
    if isinstance(shipping_address, str):
        shipping_address_str = shipping_address
    elif isinstance(shipping_address, dict):
        shipping_address_str = f"{shipping_address.get('street', '')}, {shipping_address.get('city', '')}, {shipping_address.get('state', '')} {shipping_address.get('zip', '')}, {shipping_address.get('country', '')}"
    else:
        shipping_address_str = "No shipping address provided"

    # Create order with all the form data
    order = OrderModel(
        order_number=generate_order_number(),
        customer_email=customer_email,
        customer_name=customer_name,
        total_amount=total_amount,  # Now correctly includes subtotal + tax + shipping
        status="confirmed",
        shipping_address=shipping_address_str,
        phone=checkout_data.get('customer_phone'),
        special_instructions=checkout_data.get('special_instructions'),
        billing_address=checkout_data.get('billing_address', shipping_address_str),
        payment_method=checkout_data.get('payment_method', {}).get('type', 'credit_card') if isinstance(checkout_data.get('payment_method'), dict) else checkout_data.get('payment_method', 'credit_card'),
        billing_different=checkout_data.get('billing_different', False),
        # Store payment information securely
        card_last_four=payment_result['last_four'],
        card_brand=payment_result['card_brand'],
        payment_status="processed"
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Create order items from cart items
    for cart_item in cart.items:
        order_item = OrderItemModel(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        db.add(order_item)

    # Clear cart after successful checkout
    await db.execute(
        delete(CartItemModel).filter(CartItemModel.cart_id == cart.id)
    )

    await db.commit()
    await db.refresh(order)

    # Reload order with all relationships to ensure product data is available
    order_result = await db.execute(
        select(OrderModel)
        .filter(OrderModel.id == order.id)
        .options(selectinload(OrderModel.items).selectinload(OrderItemModel.product))
    )
    order = order_result.scalar_one()

    # Verify products are loaded correctly
    logger.debug(f"Order {order.order_number} has {len(order.items)} items")
    for item in order.items:
        if item.product is None:
            logger.warning(f"Product relationship missing for order item {item.id}, product_id={item.product_id}")

    # Build items with complete product information
    order_items = []
    for item in order.items:
        # If product relationship is None, fetch it explicitly
        if item.product is None:
            product_result = await db.execute(
                select(ProductModel).filter(ProductModel.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
        else:
            product = item.product

        # Build item with complete product data
        order_item = {
            "id": item.id,
            "product_id": item.product_id,
            "product_name": product.name if product else f'Product {item.product_id}',
            "quantity": item.quantity,
            "price": float(item.price),  # Frontend expects 'price', not 'unit_price'
            "unit_price": float(item.price),
            "total_price": float(item.price * item.quantity),
            "product": {
                "id": product.id if product else item.product_id,
                "name": product.name if product else f'Product {item.product_id}',
                "price": float(product.price) if product else float(item.price),
                "image_url": (product.image_url if product and product.image_url else None),
                "description": (product.description if product and product.description else "")
            }
        }
        order_items.append(order_item)

    return {
        "message": "Order created and payment processed successfully",
        "order": {
            "id": order.public_id,
            "order_number": order.order_number,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "total_amount": float(order.total_amount),
            "subtotal": float(subtotal),
            "tax_amount": float(tax_amount),
            "shipping_cost": float(shipping_cost),
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": order_items
        },
        "payment": {
            "method": checkout_data.get('payment_method', {}).get('type', 'credit_card') if isinstance(checkout_data.get('payment_method'), dict) else checkout_data.get('payment_method', 'credit_card'),
            "transaction_id": payment_result.get('transaction_id'),
            "amount_charged": float(order.total_amount),
            "status": "processed",
            "card_brand": order.card_brand,
            "last_four": order.card_last_four
        },
        "fulfillment": {
            "tracking_number": f"TRK{uuid.uuid4().hex[:10].upper()}",
            "shipping_carrier": "Standard Shipping",
            "estimated_delivery": "5-7 business days",
            "status": "processing"
        }
    }