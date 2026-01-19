import { ShopTabs } from '@/app/(admin)/shops/[shopId]/_components/ShopTabs';

interface ShopHeaderProps {
  shopName: string;
  shopId: string;
}

export function ShopHeader({ shopName, shopId }: ShopHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{shopName}</h1>
        <p className="text-sm text-slate-500">店舖控制台</p>
      </div>

      <ShopTabs shopId={shopId} />
    </div>
  );
}
