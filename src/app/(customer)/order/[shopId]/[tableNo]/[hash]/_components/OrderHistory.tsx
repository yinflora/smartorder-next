'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Clock, Receipt, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { Order } from '@/types';

interface OrderHistoryProps {
    shopId: string;
    guestId: string;
}

export function OrderHistory({ shopId, guestId }: OrderHistoryProps) {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // Fetch orders linked to this guest
    const { data: orders, isLoading } = useSWR<Order[]>(
        guestId ? `/api/orders?shopId=${shopId}&guestId=${guestId}` : null,
        { refreshInterval: 5000 } // Auto-refresh every 5s to check status
    );

    const activeOrders = orders?.filter(o => o.status !== 'paid') || [];
    const historyOrders = orders?.filter(o => o.status === 'paid') || [];

    const displayOrders = activeTab === 'active' ? activeOrders : historyOrders;

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'numeric',
            day: 'numeric',
        });
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return { label: '準備中', color: 'text-blue-600 bg-blue-50' };
            case 'served': return { label: '已出餐', color: 'text-green-600 bg-green-50' };
            case 'paid': return { label: '已結帳', color: 'text-slate-600 bg-slate-100' };
            default: return { label: status, color: 'text-slate-600 bg-slate-50' };
        }
    };

    if (!guestId) return null;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        未結帳 ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        歷史訂單 ({historyOrders.length})
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>尚無訂單資料</p>
                    </div>
                ) : (
                    displayOrders.map((order) => {
                        const status = getStatusLabel(order.status);
                        return (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="p-4 space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <span className="text-slate-900">{item.name}</span>
                                                {item.skuId && <span className="text-slate-500 text-xs ml-2">規格詳情</span>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-500">x{item.quantity}</span>
                                                <span className="text-slate-900 font-medium w-12 text-right">${item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm text-slate-500">總計</span>
                                    <span className="text-lg font-bold text-slate-900">${order.totalPrice}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
