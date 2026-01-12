import { notFound } from 'next/navigation';
import { menuService } from '@/services';
import { validateServerTableHash } from '@/lib/utils/crypto';
import { CustomerOrderView } from './_components/CustomerOrderView';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ shopId: string; tableNo: string; hash: string }>;
}) {
  const { shopId, tableNo, hash } = await params;

  // Validate hash
  if (!validateServerTableHash(tableNo, shopId, hash)) {
    notFound();
  }

  // Get menu
  const menu = await menuService.getByShopId(shopId);

  if (!menu || !menu.isPublished) {
    notFound();
  }

  return <CustomerOrderView menu={menu} shopId={shopId} tableNo={tableNo} />;
}
