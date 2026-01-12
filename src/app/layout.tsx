import type { Metadata } from 'next';
import { SWRProvider } from '@/providers/SWRProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartOrder - AI 智慧點餐系統',
  description: 'AI 賦能的智慧點餐管理系統，支援菜單解析、訂單管理、訂位管理',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-slate-50 antialiased">
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
