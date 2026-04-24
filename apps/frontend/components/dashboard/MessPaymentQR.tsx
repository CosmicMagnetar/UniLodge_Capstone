"use client";
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface MessPaymentQRProps {
  studentId: string;
}

export const MessPaymentQR: React.FC<MessPaymentQRProps> = ({ studentId }) => {
  const [customQr, setCustomQr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomQr(localStorage.getItem('uni_settings_mess_qr'));
    }
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-2">Mess Payment</h3>
      <p className="text-sm text-slate-500 mb-4">Scan to pay for meals</p>
      <div className="p-4 bg-white rounded-xl shadow-inner border border-slate-100 flex items-center justify-center min-h-[192px] min-w-[192px]">
        {customQr ? (
          <img src={customQr} alt="Custom Mess QR" className="max-w-[160px] max-h-[160px] object-contain" />
        ) : (
          <QRCodeSVG value={`MESS_PAY:${studentId}`} size={160} fgColor="#2563eb" />
        )}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">Present at the mess counter</p>
    </div>
  );
};
