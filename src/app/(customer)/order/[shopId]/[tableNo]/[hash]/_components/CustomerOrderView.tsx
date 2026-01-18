'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check, UtensilsCrossed, History, ListOrdered, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ShopMenu, MenuItem, OrderItem } from '@/types';
import { useCustomerSession } from '@/hooks/useCustomerSession';
import { NicknameModal } from './NicknameModal';
import { OrderConfirmation } from './OrderConfirmation';
import { OrderHistory } from './OrderHistory';

interface CustomerOrderViewProps {
  menu: ShopMenu;
  shopId: string;
  tableNo: string;
}

type ViewMode = 'MENU' | 'CONFIRMATION' | 'HISTORY';

export function CustomerOrderView({ menu, shopId, tableNo }: CustomerOrderViewProps) {
  const { nickname, guestId, isInitialized, setNickname } = useCustomerSession(tableNo, shopId);

  const [cart, setCart] = useState<Map<string, OrderItem>>(new Map());
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [viewMode, setViewMode] = useState<ViewMode>('MENU');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // New Orders Indicator Logic (Simplified: just show dot if we have history)
  // In a real app, we'd track "last viewed time" vs "latest order time"
  const hasHistory = !!guestId;

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

  const updateCartItem = (itemId: string, delta: number) => {
    if (delta > 0) {
      // Find item in menu to add (this works because itemId is menuItemId currently)
      const item = menu.items.find(i => i.id === itemId);
      if (item) addToCart(item);
    } else {
      removeFromCart(itemId);
    }
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

  const handleConfirmOrder = async () => {
    if (cart.size === 0) return;

    setIsSubmitting(true);

    try {
      // Calculate totals for payload
      const subtotal = Array.from(cart.values()).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const serviceFeeAmount = Math.round(subtotal * 0.1);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          tableNo,
          guestId,
          guestName: nickname,
          items: Array.from(cart.values()),
          adjustments: [
            {
              id: crypto.randomUUID(),
              name: '服務費 (10%)',
              type: 'surcharge',
              valueType: 'percentage',
              value: 10,
              amount: serviceFeeAmount,
            },
          ],
        }),
      });

      if (response.ok) {
        setCart(new Map());
        setViewMode('MENU');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('送出訂單失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menu.items.filter(
    (item) => activeCategory === '全部' || item.category === activeCategory
  );

  if (!isInitialized) return null; // Prevent hydration mismatch?

  // 1. Session Check
  if (!nickname) {
    return <NicknameModal isOpen={true} onSave={setNickname} />;
  }

  // 2. View Mode: Confirmation
  if (viewMode === 'CONFIRMATION') {
    return (
      <OrderConfirmation
        shopId={shopId}
        tableNo={tableNo}
        guestId={guestId}
        guestName={nickname}
        cart={cart}
        onUpdateCart={updateCartItem}
        onBack={() => setViewMode('MENU')}
        onConfirm={handleConfirmOrder}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 3. View Mode: History
  if (viewMode === 'HISTORY') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setViewMode('MENU')}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">返回菜單</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900">歷史訂單</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </header>
        <OrderHistory shopId={shopId} guestId={guestId} />
      </div>
    );
  }

  // 4. View Mode: Menu (Default)
  return (
    <div className="min-h-screen pb-24 relative">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-full flex items-center shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-5 h-5 mr-2 text-green-400" />
          <span className="font-medium">訂單已送出！</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{menu.brandName}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>桌號 {tableNo}</span>
                <span>•</span>
                <span>Hi, {nickname}</span>
              </div>
            </div>

            <button
              onClick={() => setViewMode('HISTORY')}
              className="relative w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <History className="w-5 h-5 text-slate-600" />
              {hasHistory && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory('全部')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === '全部'
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg pb-8 safe-area-bottom">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-slate-600" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-900">${getTotalPrice()}</span>
            </div>
            <Button onClick={() => setViewMode('CONFIRMATION')} size="lg">
              去買單
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
