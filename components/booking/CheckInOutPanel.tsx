import React from 'react';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Booking } from '../../types';

interface CheckInOutPanelProps {
  booking: Booking;
}

/**
 * CheckInOutPanel
 * Visualizes the check-in/out status of a booking.
 */
export const CheckInOutPanel: React.FC<CheckInOutPanelProps> = ({ booking }) => {
  const steps = [
    {
      id: 'confirmed',
      label: 'Confirmed',
      description: 'Your booking is confirmed',
      isCompleted: true, // If we're here, it's confirmed
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'paid',
      label: 'Paid',
      description: booking.paymentStatus === 'paid' ? 'Payment processed' : 'Awaiting payment',
      isCompleted: booking.paymentStatus === 'paid',
      icon: booking.paymentStatus === 'paid' ? CheckCircle2 : Clock,
      color: booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-blue-600',
      bgColor: booking.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-blue-100'
    },
    {
      id: 'checkin',
      label: 'Check-in',
      description: booking.checkInCompleted ? `Checked in: ${new Date(booking.checkInTime!).toLocaleTimeString()}` : 'Awaiting arrival',
      isCompleted: booking.checkInCompleted,
      icon: booking.checkInCompleted ? CheckCircle2 : Circle,
      color: booking.checkInCompleted ? 'text-green-600' : 'text-gray-400',
      bgColor: booking.checkInCompleted ? 'bg-green-100' : 'bg-gray-100'
    },
    {
      id: 'checkout',
      label: 'Check-out',
      description: booking.checkOutCompleted ? `Checked out: ${new Date(booking.checkOutTime!).toLocaleTimeString()}` : 'Departure scheduled',
      isCompleted: booking.checkOutCompleted,
      icon: booking.checkOutCompleted ? CheckCircle2 : Circle,
      color: booking.checkOutCompleted ? 'text-green-600' : 'text-gray-400',
      bgColor: booking.checkOutCompleted ? 'bg-green-100' : 'bg-gray-100'
    }
  ];

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600" />
        Booking Timeline
      </h4>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-center gap-4">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`absolute left-5 top-10 w-0.5 h-6 ${steps[index + 1].isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
            
            {/* Icon */}
            <div className={`z-10 w-10 min-w-[40px] h-10 rounded-full flex items-center justify-center ${step.bgColor} ${step.color}`}>
              <step.icon className="h-5 w-5" />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm ${step.isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
                {step.isCompleted && (
                  <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                    Done
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
