'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, UtensilsCrossed, PieChart } from 'lucide-react';

interface ShopTabsProps {
  shopId: string;
}

export function ShopTabs({ shopId }: ShopTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { id: 'menu', href: `/shops/${shopId}/menu`, label: '菜單管理', icon: BookOpen },
    { id: 'booking', href: `/shops/${shopId}/booking`, label: '訂位管理', icon: LayoutDashboard },
    { id: 'orders', href: `/shops/${shopId}/orders`, label: '訂單管理', icon: UtensilsCrossed },
    { id: 'reports', href: `/shops/${shopId}/reports`, label: '報表', icon: PieChart },
  ];

  const getActiveTab = () => {
    if (pathname.includes('/menu')) return 'menu';
    if (pathname.includes('/booking')) return 'booking';
    if (pathname.includes('/orders')) return 'orders';
    if (pathname.includes('/reports')) return 'reports';
    return 'menu';
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex bg-slate-200/50 p-1 rounded-xl glass border border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-blue-600 shadow-sm shadow-blue-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={18} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
