# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic import AliasChoices
from typing import List, Optional
from datetime import datetime

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0

class Product(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItem(CartItemBase):
    id: int
    product: Product
    
    class Config:
        from_attributes = True

class CartBase(BaseModel):
    session_id: str

class Cart(CartBase):
    id: int
    items: List[CartItem] = []
    subtotal: float = 0.0
    tax: float = 0.0
    shipping: float = 0.0
    total_amount: float = 0.0

    class Config:
        from_attributes = True

# Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItem(OrderItemBase):
    id: int
    product: Product
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_email: str
    customer_name: str

class Order(OrderBase):
    # `id` is sourced from the ORM `public_id` (UUID) so the API never exposes
    # the sequential integer primary key. Clients use this opaque value as the
    # order handle in all by-id routes.
    id: str = Field(validation_alias=AliasChoices("public_id", "id"))
    order_number: str
    total_amount: float
    status: str
    items: List[OrderItem] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Response schemas
class ProductList(BaseModel):
    products: List[Product]
    total: int
    limit: int
    offset: int

class OrderList(BaseModel):
    orders: List[Order]
    total: int

# Message schemas
class Message(BaseModel):
    message: str
