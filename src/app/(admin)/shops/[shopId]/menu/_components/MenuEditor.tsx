'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Upload, Edit2, CheckCircle, Trash2, Plus, QrCode } from 'lucide-react';
import type { ShopMenu, MenuItem } from '@/types';

// Dynamic import QRCodeCard to avoid SSR hydration issues
const QRCodeCard = dynamic(() => import('./QRCodeCard').then(mod => mod.QRCodeCard), {
  ssr: false,
  loading: () => (
    <div className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col items-center gap-3 shadow-sm h-[220px] animate-pulse">
      <div className="h-5 w-16 bg-slate-200 rounded" />
      <div className="w-[110px] h-[110px] bg-slate-100 rounded-xl" />
      <div className="w-full space-y-2 mt-2">
        <div className="h-8 bg-slate-200 rounded-lg" />
        <div className="h-8 bg-slate-100 rounded-lg" />
      </div>
    </div>
  ),
});

interface MenuEditorProps {
  shopId: string;
  shopName: string;
  initialMenu: ShopMenu | null;
  initialTables: string[];
}

export function MenuEditor({ shopId, shopName, initialMenu, initialTables }: MenuEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState<ShopMenu | null>(initialMenu);
  const [tables, setTables] = useState<string[]>(initialTables);
  const [isParsing, setIsParsing] = useState(false);
  const [tableInput, setTableInput] = useState(initialTables.length > 0 ? initialTables.join(', ') : 'A1, A2, A3, B1, B2');

  // Determine current step based on menu state
  const getStep = () => {
    if (!menu) return 1;
    if (!menu.isPublished) return 2;
    return 3;
  };
  const step = getStep();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];

        const response = await fetch('/api/ai/parse-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: base64,
            mimeType: file.type,
            shopName,
          }),
        });

        if (response.ok) {
          const parsed = await response.json();

          const items: MenuItem[] = (parsed.items || []).map((item: { name: string; price: number; category: string }) => ({
            id: crypto.randomUUID(),
            name: item.name,
            price: Number(item.price) || 0,
            category: item.category,
          }));

          const newMenu: ShopMenu = {
            id: menu?.id || crypto.randomUUID(),
            shopId,
            brandName: parsed.brandName || shopName,
            categories: parsed.categories || [],
            items,
            isPublished: false,
          };

          await fetch(`/api/shops/${shopId}/menu`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMenu),
          });

          setMenu(newMenu);
          router.refresh();
        }

        setIsParsing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error parsing menu:', error);
      setIsParsing(false);
    }
  };

  const handlePublish = async () => {
    if (!menu) return;

    const publishedMenu = { ...menu, isPublished: true };

    // Save menu
    await fetch(`/api/shops/${shopId}/menu`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publishedMenu),
    });

    // Save tables
    const tableList = tableInput.split(',').map(s => s.trim()).filter(Boolean);
    await fetch(`/api/tables/${shopId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tables: tableList }),
    });

    setMenu(publishedMenu);
    setTables(tableList);
    router.refresh();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!menu) return;

    const updated = { ...menu, items: menu.items.filter(it => it.id !== itemId) };

    await fetch(`/api/shops/${shopId}/menu`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    setMenu(updated);
    router.refresh();
  };

  const handleClearMenu = async () => {
    if (!menu) return;
    if (!window.confirm('確定要清空所有菜單項目嗎？此操作無法復原。')) return;

    const updated = { ...menu, items: [] };

    await fetch(`/api/shops/${shopId}/menu`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    setMenu(updated);
    router.refresh();
  };

  // Step 3: Published view with QR codes
  if (step === 3 && menu) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: QR Code Management */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">桌號與 QR Code 管理</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables.map(tableNo => (
                <QRCodeCard key={tableNo} shopId={shopId} tableNo={tableNo} />
              ))}
            </div>
          </div>

          {/* Right: Menu Editor */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">菜單持續編輯</h3>
              <button
                onClick={handleClearMenu}
                className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                title="清空所有菜單"
              >
                <Trash2 size={16} /> 清空菜單
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                <h4 className="font-bold text-lg">{menu.brandName}</h4>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">已發布</span>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
                {menu.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">${item.price}</p>
                    </div>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-500 transition-all">
                  <Plus size={16} /> 新增菜品項目
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-2: Import and Edit flow
  return (
    <div className="flex flex-col gap-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-4 py-6 bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        {[
          { s: 1, l: '1. 匯入菜單', active: step >= 1 },
          { s: 2, l: '2. 編輯內容', active: step >= 2 },
          { s: 3, l: '3. 發布管理', active: step >= 3 },
        ].map((item) => (
          <div key={item.s} className="flex items-center gap-3 flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                item.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {item.s}
            </div>
            <span
              className={`text-sm font-semibold whitespace-nowrap ${
                item.active ? 'text-slate-800' : 'text-slate-300'
              }`}
            >
              {item.l}
            </span>
            {item.s < 3 && <div className="w-12 h-[2px] bg-slate-100 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: AI Assistant Card */}
        <div className="bg-white rounded-3xl border border-slate-200 flex flex-col h-[600px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Edit2 size={18} className="text-blue-600" /> AI 菜單編輯助手
            </h3>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-100 max-w-[85%]">
                  <p className="text-sm text-blue-800 font-medium">
                    你好！我是你的 AI 助理。請上傳紙本菜單照片，我將自動建立點餐系統。
                  </p>
                </div>
                <div
                  className="flex flex-col items-center gap-4 py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  onClick={() => !isParsing && fileInputRef.current?.click()}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isParsing
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-300 shadow-sm group-hover:text-blue-500 group-hover:scale-110'
                    } transition-all`}
                  >
                    <Upload size={32} className={isParsing ? 'animate-bounce' : ''} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-800 font-bold text-lg">
                      {isParsing ? 'AI 正在解析中...' : '拖放或點擊上傳'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">支援 JPEG, PNG (建議影像清晰)</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
            )}
            {step === 2 && menu && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-emerald-50 p-4 rounded-2xl rounded-tl-none border border-emerald-100 max-w-[85%]">
                  <p className="text-sm text-emerald-800 font-medium">
                    解析完成！請確認右側預覽內容。如果桌號有誤，請在此修改：
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    桌號清單（以逗號分隔）
                  </label>
                  <input
                    type="text"
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono"
                    placeholder="A1, A2, B1..."
                  />
                </div>
                <button
                  onClick={handlePublish}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 transition-all transform hover:-translate-y-1"
                >
                  <CheckCircle size={20} /> 完成並發布菜單
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Phone Preview */}
        <div className="bg-slate-900 rounded-[48px] p-6 border-[12px] border-slate-800 shadow-2xl h-[600px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-800 rounded-b-3xl z-10 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
          </div>
          <div className="flex-1 bg-white rounded-[32px] overflow-hidden mt-6 flex flex-col shadow-inner">
            <div className="bg-blue-600 p-6 text-white text-center">
              <h4 className="font-black text-lg tracking-tight">{menu?.brandName || shopName}</h4>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-widest">前台點餐預覽</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {!menu ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-200 gap-4">
                  <QrCode size={64} strokeWidth={1} />
                  <p className="text-sm font-medium">等待菜單解析...</p>
                </div>
              ) : (
                menu.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-50">
                      <img
                        src={`https://picsum.photos/seed/${item.id}/200`}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{item.category}</p>
                      <p className="text-blue-600 font-black mt-2 text-sm">${item.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {menu && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <div className="bg-blue-600 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100">
                  查看購物車
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
