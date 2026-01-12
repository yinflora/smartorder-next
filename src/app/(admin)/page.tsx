import Link from 'next/link';
import { Plus, Store, Zap, BarChart3, Clock, ChevronRight } from 'lucide-react';
import { shopService } from '@/services';

export default async function HomePage() {
  const shops = await shopService.getAll();

  return (
    <div className="max-w-5xl mx-auto py-12 relative">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          歡迎使用 <span className="text-blue-600">SmartOrder</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          整合訂位、桌況與點餐的極簡系統，專為追求數據化經營的店主打造。
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Zap size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">快速建單</h3>
          <p className="text-sm text-slate-500">
            拍照上傳，AI 自動解析菜單，幾分鐘內即可開始營業。
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">桌況管理</h3>
          <p className="text-sm text-slate-500">
            區分預訂與現場客，入座時間自動記錄，告別忙亂。
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">數據分析</h3>
          <p className="text-sm text-slate-500">
            掌握客群比例與熱門菜色，用數據優化店舖經營。
          </p>
        </div>
      </div>

      {/* Shop Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">
          {shops.length === 0 ? '開始你的第一間店舖' : '我的店舖'}
        </h2>

        {shops.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            點擊左側「新開店舖」按鈕建立你的第一間店舖
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="flex items-center justify-between p-6 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:shadow-md transition-all">
                    <Store size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{shop.name}</h4>
                    <p className="text-xs text-slate-400">
                      建立於 {new Date(shop.createdAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-slate-300 group-hover:text-blue-500 transition-colors"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
