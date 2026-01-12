'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ShopMenu, MenuItem, OrderItem } from '@/types';

interface CustomerOrderViewProps {
  menu: ShopMenu;
  shopId: string;
  tableNo: string;
}

export function CustomerOrderView({ menu, shopId, tableNo }: CustomerOrderViewProps) {
  const [cart, setCart] = useState<Map<string, OrderItem>>(new Map());
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addToCart = (item: MenuItem) => {
    const newCart = new Map(cart);
    const existing = newCart.get(item.id);

    if (existing) {
      newCart.set(item.id, { ...existing, quantity: existing.quantity + 1 });
    } else {
      newCart.set(item.id, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      });
    }

    setCart(newCart);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = new Map(cart);
    const existing = newCart.get(itemId);

    if (existing && existing.quantity > 1) {
      newCart.set(itemId, { ...existing, quantity: existing.quantity - 1 });
    } else {
      newCart.delete(itemId);
    }

    setCart(newCart);
  };

  const getTotalPrice = () => {
    return Array.from(cart.values()).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async () => {
    if (cart.size === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          tableNo,
          items: Array.from(cart.values()),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setCart(new Map());
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menu.items.filter(
    (item) => activeCategory === '全部' || item.category === activeCategory
  );

  // Order submitted view
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">訂單已送出！</h1>
        <p className="text-slate-600 mb-6">
          桌號 {tableNo} 的餐點正在準備中
        </p>
        <Button onClick={() => setIsSubmitted(false)}>繼續點餐</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{menu.brandName}</h1>
              <p className="text-sm text-slate-500">桌號 {tableNo}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory('全部')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === '全部'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              全部
            </button>
            {menu.categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <main className="p-4 space-y-3">
        {filteredItems.map((item) => {
          const cartItem = cart.get(item.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.category}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">${item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                {quantity > 0 ? (
                  <>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Cart Summary */}
      {cart.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-slate-600" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-900">${getTotalPrice()}</span>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
              {isSubmitting ? '送出中...' : '送出訂單'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
