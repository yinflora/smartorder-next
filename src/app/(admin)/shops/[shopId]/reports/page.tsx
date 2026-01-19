import { notFound } from 'next/navigation';
import { PieChart } from 'lucide-react';
import { shopService } from '@/services';
import { ShopHeader } from '@/app/(admin)/shops/[shopId]/_components/ShopHeader';

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = await shopService.getById(shopId);

  if (!shop) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <ShopHeader shopName={shop.name} shopId={shopId} />

      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <PieChart size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">數據報表開發中</h3>
        <p className="text-slate-500">即將推出：熱門品項分析與營收概覽。</p>
      </div>
    </div>
  );
}
