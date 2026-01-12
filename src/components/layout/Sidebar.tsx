'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, Store, UserCircle, ChevronRight, X } from 'lucide-react';
import type { Shop } from '@/types';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Extract current shopId from URL
  const shopIdMatch = pathname.match(/\/shops\/([^\/]+)/);
  const currentShopId = shopIdMatch ? shopIdMatch[1] : null;

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shops');
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    }
  };

  const handleConfirmCreate = async () => {
    if (!newShopName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShopName.trim() }),
      });

      if (response.ok) {
        const newShop = await response.json();
        setIsModalOpen(false);
        setNewShopName('');
        fetchShops();
        router.push(`/shops/${newShop.id}`);
      }
    } catch (error) {
      console.error('Failed to create shop:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="w-64 h-full glass border-r border-slate-200 flex flex-col z-20">
        {/* Header */}
        <Link
          href="/"
          className="p-6 border-b border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Store size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            SmartOrder
          </span>
        </Link>

        {/* Shop List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            店舖列表
          </div>

          {shops.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              尚未建立店舖
            </div>
          ) : (
            shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  currentShopId === shop.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Store size={18} />
                <span className="truncate font-medium flex-1 text-sm">
                  {shop.name}
                </span>
                {currentShopId === shop.id && <ChevronRight size={14} />}
              </Link>
            ))
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg mb-4"
          >
            <Plus size={18} />
            <span>新開店舖</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <UserCircle size={20} className="text-slate-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-700">
                匿名用戶
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                ID: LOCAL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Shop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">建立新店舖</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  店舖名稱
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmCreate()}
                  placeholder="例如：美味早午餐"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <button
                onClick={handleConfirmCreate}
                disabled={!newShopName.trim() || isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all mt-4"
              >
                {isCreating ? '建立中...' : '開始建立'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
