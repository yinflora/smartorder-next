'use client';

import { useState } from 'react';
import { Minus, Plus, ChevronLeft, Receipt } from 'lucide-react';
import { Button } from '@/components/ui';
import type { OrderItem } from '@/types';

interface OrderConfirmationProps {
    shopId: string;
    tableNo: string;
    guestId: string;
    guestName: string;
    cart: Map<string, OrderItem>;
    onUpdateCart: (itemId: string, delta: number) => void;
    onBack: () => void;
    onConfirm: () => Promise<void>;
    isSubmitting: boolean;
}

export function OrderConfirmation({
    cart,
    onUpdateCart,
    onBack,
    onConfirm,
    isSubmitting,
}: OrderConfirmationProps) {
    const [note, setNote] = useState('');

    const items = Array.from(cart.values());
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        <span className="font-medium">繼續點餐</span>
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">確認餐點</h1>
                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-4 space-y-4 pb-32">
                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-slate-900">點餐明細</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <div key={item.menuItemId} className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-medium text-slate-900">{item.name}</h3>
                                    <p className="text-slate-500 mt-1">${item.price}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onUpdateCart(item.menuItemId, -1)}
                                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium tabular-nums text-slate-900">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onUpdateCart(item.menuItemId, 1)}
                                        className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                    <div className="flex justify-between text-slate-600">
                        <span>小計</span>
                        <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>服務費 (10%)</span>
                        <span>${serviceFee}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-900">總計</span>
                        <span className="text-xl font-bold text-blue-600">${total}</span>
                    </div>
                </div>

                {/* Note (Optional) */}
                {/* <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">備註</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="有什麼特殊需求嗎？"
            rows={3}
          />
        </div> */}
            </main>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm text-slate-500">共 {items.reduce((s, i) => s + i.quantity, 0)} 項餐點</span>
                    <span className="text-xl font-bold text-slate-900">${total}</span>
                </div>
                <Button
                    onClick={onConfirm}
                    disabled={isSubmitting || items.length === 0}
                    className="w-full font-bold text-lg shadow-blue-200 shadow-lg"
                    size="lg"
                >
                    {isSubmitting ? '送出中...' : '確認送出'}
                </Button>
            </div>
        </div>
    );
}
