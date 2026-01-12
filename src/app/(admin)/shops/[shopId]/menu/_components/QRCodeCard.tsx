'use client';

import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Download } from 'lucide-react';

interface QRCodeCardProps {
  shopId: string;
  tableNo: string;
}

export function QRCodeCard({ shopId, tableNo }: QRCodeCardProps) {
  const generateQRCodeUrl = () => {
    const date = new Date().toISOString().split('T')[0];
    const raw = `smartorder-${shopId}-${date}-${tableNo}`;
    const hash = btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(-12);
    return `${window.location.origin}/order/${shopId}/${tableNo}/${hash}`;
  };

  const orderUrl = generateQRCodeUrl();

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow group">
      <span className="font-bold text-slate-700">桌號: {tableNo}</span>
      <div className="p-3 bg-slate-50 rounded-xl relative">
        <QRCodeSVG value={orderUrl} size={110} />
      </div>
      <div className="flex flex-col gap-2 w-full mt-2">
        <button
          onClick={() => window.open(orderUrl, '_blank')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
        >
          <ExternalLink size={14} /> 在新分頁預覽
        </button>
        <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
          <Download size={14} /> 下載圖檔
        </button>
      </div>
    </div>
  );
}
