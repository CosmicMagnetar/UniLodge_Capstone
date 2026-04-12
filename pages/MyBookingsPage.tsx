import React from 'react';
import { Booking } from '../types.ts';
import { Card, Button, Badge } from './ui.tsx';
import { Calendar, CreditCard, Clock, MapPin, AlertCircle } from 'lucide-react';

export type MyBookingsPageProps = { 
    bookings: Booking[]; 
    onCancel?: (bookingId: string) => void; 
};

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ bookings, onCancel }) => (
    <div className="min-h-screen bg-slate-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
                <p className="text-slate-500 mt-1">Manage your upcoming and past stays.</p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No bookings found</h3>
                    <p className="text-slate-500 mt-1">You haven't made any reservations yet.</p>
                    <Button className="mt-6" onClick={() => window.location.href = '/'}>Browse Rooms</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map(booking => (
                        <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
                            <div className="flex flex-col md:flex-row">
                                {/* Image Section */}
                                <div className="md:w-64 h-48 md:h-auto relative">
                                    <img 
                                        src={booking.room?.imageUrl || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800'} 
                                        alt="Room" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm shadow-sm">
                                            {booking.room?.type} Room
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-1">
                                                    Room {booking.room?.roomNumber}
                                                </h2>
                                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                    <MapPin size={16} />
                                                    {booking.room?.building || 'Main Campus Hostel'}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 w-fit ${
                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                <span className={`h-2 w-2 rounded-full ${
                                                    booking.status === 'Confirmed' ? 'bg-green-500' :
                                                    booking.status === 'Pending' ? 'bg-yellow-500' :
                                                    booking.status === 'Cancelled' ? 'bg-red-500' :
                                                    'bg-slate-500'
                                                }`}></span>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</p>
                                                    <p className="font-semibold text-slate-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Check Out</p>
                                                    <p className="font-semibold text-slate-900">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-slate-900">
                                            <CreditCard size={20} className="text-slate-400" />
                                            <span className="font-bold text-lg">
                                                ${booking.totalPrice || (booking.room?.price || 0) * Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                                            </span>
                                            <span className="text-slate-500 text-sm font-normal">Total Amount</span>
                                        </div>

                                        {booking.status === 'Pending' && onCancel && (
                                            <Button 
                                                onClick={() => onCancel(booking.id)} 
                                                variant="outline" 
                                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                            >
                                                Cancel Booking
                                            </Button>
                                        )}
                                        {booking.status === 'Confirmed' && (
                                            <Button variant="outline" className="w-full sm:w-auto">
                                                Download Receipt
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    </div>
);