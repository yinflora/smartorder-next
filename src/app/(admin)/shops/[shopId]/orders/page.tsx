import { notFound } from 'next/navigation';
import { shopService, orderService } from '@/services';
import { OrderList } from '@/app/(admin)/shops/[shopId]/orders/_components/OrderList';
import { ShopHeader } from '@/app/(admin)/shops/[shopId]/_components/ShopHeader';

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = await shopService.getById(shopId);

  if (!shop) {
    notFound();
  }

  const orders = await orderService.getByShopId(shopId);

  return (
    <div className="flex flex-col gap-6">
      <ShopHeader shopName={shop.name} shopId={shopId} />

      <OrderList shopId={shopId} initialOrders={orders} />
    </div>
  );
}
