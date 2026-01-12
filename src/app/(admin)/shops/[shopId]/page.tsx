import { notFound, redirect } from 'next/navigation';
import { shopService } from '@/services';

export default async function ShopOverviewPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = await shopService.getById(shopId);

  if (!shop) {
    notFound();
  }

  // Redirect to menu page as default (matching original behavior)
  redirect(`/shops/${shopId}/menu`);
}
