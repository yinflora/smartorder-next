import { notFound } from 'next/navigation';
import { shopService, menuService } from '@/services';
import { MenuEditor } from '@/app/(admin)/shops/[shopId]/menu/_components/MenuEditor';
import { ShopHeader } from '@/app/(admin)/shops/[shopId]/_components/ShopHeader';

export default async function MenuPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = await shopService.getById(shopId);

  if (!shop) {
    notFound();
  }

  const menu = await menuService.getByShopId(shopId);
  const tables = await menuService.getTablesByShopId(shopId);

  return (
    <div className="flex flex-col gap-6">
      <ShopHeader shopName={shop.name} shopId={shopId} />

      <MenuEditor
        shopId={shopId}
        shopName={shop.name}
        initialMenu={menu}
        initialTables={tables.map((t) => t.tableNo)}
      />
    </div>
  );
}
