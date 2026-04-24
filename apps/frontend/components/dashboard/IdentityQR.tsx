"use client";
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface IdentityQRProps {
  bookingId: string;
  userName: string;
}

export const IdentityQR: React.FC<IdentityQRProps> = ({ bookingId, userName }) => {
  const [customQr, setCustomQr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomQr(localStorage.getItem('uni_settings_gate_qr'));
    }
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-2">Digital Identity</h3>
      <p className="text-sm text-slate-500 mb-4">{userName}</p>
      <div className="p-4 bg-white rounded-xl shadow-inner border border-slate-100 flex items-center justify-center min-h-[192px] min-w-[192px]">
        {customQr ? (
          <img src={customQr} alt="Custom Gate Pass QR" className="max-w-[160px] max-h-[160px] object-contain" />
        ) : (
          <QRCodeSVG value={`IDENTITY:${bookingId}`} size={160} />
        )}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">Scan at the security gate for entry</p>
    </div>
  );
};
