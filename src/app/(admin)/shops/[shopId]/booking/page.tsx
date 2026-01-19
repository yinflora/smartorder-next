import { notFound } from 'next/navigation';
import { shopService, reservationService, menuService } from '@/services';
import { ReservationList } from '@/app/(admin)/shops/[shopId]/booking/_components/ReservationList';
import { ShopHeader } from '@/app/(admin)/shops/[shopId]/_components/ShopHeader';

export default async function BookingPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = await shopService.getById(shopId);

  if (!shop) {
    notFound();
  }

  const reservations = await reservationService.getByShopId(shopId);
  const tables = await menuService.getTablesByShopId(shopId);

  return (
    <div className="flex flex-col gap-6">
      <ShopHeader shopName={shop.name} shopId={shopId} />

      <ReservationList
        shopId={shopId}
        initialReservations={reservations}
        tables={tables.map((t) => t.tableNo)}
      />
    </div>
  );
}
