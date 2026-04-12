import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { api } from '../../services/api';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  onSuccess: () => void;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  room,
  onSuccess 
}) => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateDates = () => {
    const errors: any = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (!checkInDate) {
      errors.checkIn = 'Check-in date is required';
    } else if (checkIn < today) {
      errors.checkIn = 'Check-in date cannot be in the past';
    }

    if (!checkOutDate) {
      errors.checkOut = 'Check-out date is required';
    } else if (checkOut <= checkIn) {
      errors.checkOut = 'Check-out must be after check-in';
    }

    return errors;
  };

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * room.price : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateDates();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.createBookingRequest({ 
        roomId: room.id, 
        checkInDate, 
        checkOutDate, 
        message 
      });
      alert('Booking request submitted successfully! Please wait for admin approval.');
      onSuccess();
      onClose();
      // Reset form
      setCheckInDate('');
      setCheckOutDate('');
      setMessage('');
      setErrors({});
    } catch (error: any) {
      alert(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice();
  const nights = checkInDate && checkOutDate 
    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Booking"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" color="text-white" />}
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900">{room.type} Room #{room.roomNumber}</h4>
          <p className="text-sm text-gray-600">${room.price} per night</p>
        </div>

        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => {
              setCheckInDate(e.target.value);
              setErrors({ ...errors, checkIn: '' });
            }}
            className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.checkIn ? 'border-red-500' : 'border-gray-300'
            }`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.checkIn && (
            <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
          )}
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => {
              setCheckOutDate(e.target.value);
              setErrors({ ...errors, checkOut: '' });
            }}
            className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.checkOut ? 'border-red-500' : 'border-gray-300'
            }`}
            min={checkInDate || new Date().toISOString().split('T')[0]}
          />
          {errors.checkOut && (
            <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any special requests or notes..."
            rows={3}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price Summary */}
        {nights > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{nights} {nights === 1 ? 'night' : 'nights'} × ${room.price}</span>
              <span className="font-medium">${totalPrice}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="font-semibold">Estimated Total:</span>
              <span className="text-lg font-bold text-blue-600">${totalPrice}</span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Your request will be reviewed by an admin. You'll be able to pay once approved.
        </p>
      </form>
    </Modal>
  );
};
