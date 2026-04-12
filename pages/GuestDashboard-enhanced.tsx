import React, { useState, useEffect } from 'react';
import { User, Room, Booking } from '../types.ts';
import { RoomCard } from './RoomCard.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { BookingRequestModal } from '../components/booking/BookingRequestModal.tsx';
import { PaymentModal } from '../components/payment/PaymentModal.tsx';
import { CheckInOutPanel } from '../components/booking/CheckInOutPanel.tsx';
import { api } from '../services/api.ts';

export type GuestDashboardProps = { 
    user: User; 
    rooms: Room[]; 
    bookings: Booking[];
    onBook: (roomId: string) => void;
    onRefresh: () => void;
};

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ user, rooms, bookings, onBook, onRefresh }) => {
    const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'requests'>('rooms');
    const [bookingRequests, setBookingRequests] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBookingRequests();
    }, []);

    const loadBookingRequests = async () => {
        try {
            const requests = await api.getUserBookingRequests();
            setBookingRequests(requests);
        } catch (error) {
            console.error('Failed to load booking requests:', error);
        }
    };

    const handleRequestBooking = (room: Room) => {
        setSelectedRoom(room);
        setShowBookingModal(true);
    };

    const handlePayNow = (booking: Booking) => {
        setSelectedBookingForPayment(booking);
    };

    const handleCheckIn = async (bookingId: string) => {
        try {
            setLoading(true);
            await api.checkIn(bookingId);
            alert('Check-in completed successfully!');
            onRefresh();
        } catch (error: any) {
            alert(error.message || 'Failed to check in');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        try {
            setLoading(true);
            await api.checkOut(bookingId);
            alert('Check-out completed successfully!');
            onRefresh();
        } catch (error: any) {
            alert(error.message || 'Failed to check out');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-16 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="container mx-auto relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">Welcome, {user.name}!</h1>
                    <p className="text-xl md:text-2xl opacity-90">Find and manage your campus accommodations</p>
                    <div className="flex gap-6 mt-6">
                        <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full">
                            <span className="text-sm opacity-80">Active Bookings</span>
                            <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'Confirmed').length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full">
                            <span className="text-sm opacity-80">Pending Requests</span>
                            <p className="text-2xl font-bold">{bookingRequests.filter(r => r.status === 'pending').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-3 mb-8 bg-white p-2 rounded-full shadow-md w-fit">
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-6 py-3 font-semibold rounded-full transition-all duration-300 ${
                            activeTab === 'rooms'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Browse Rooms
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-3 font-semibold rounded-full transition-all duration-300 relative ${
                            activeTab === 'bookings'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        My Bookings
                        {bookings.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                {bookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 font-semibold rounded-full transition-all duration-300 relative ${
                            activeTab === 'requests'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Requests
                        {bookingRequests.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                {bookingRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'rooms' && (
                    <div className="animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.filter(r => r.isAvailable).map(room => (
                                <div key={room.id} className="hover-lift">
                                    <RoomCard room={room} onBook={() => handleRequestBooking(room)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-bold">My Bookings</h2>
                        {bookings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <p className="text-gray-500">You don't have any bookings yet.</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div key={booking.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover-lift">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Room #{booking.room?.roomNumber} - {booking.room?.type}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant={booking.status === 'Confirmed' ? 'confirmed' : booking.status === 'Pending' ? 'pending' : 'cancelled'}>
                                                {booking.status}
                                            </Badge>
                                            {booking.paymentStatus && (
                                                <Badge variant={booking.paymentStatus === 'paid' ? 'paid' : 'pending'}>
                                                    {booking.paymentStatus}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Check-in/out Timeline */}
                                    {booking.paymentStatus && <CheckInOutPanel booking={booking} />}

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-sm text-gray-600">Total: </span>
                                                <span className="text-lg font-bold text-blue-600">${booking.totalPrice}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* Pay Now Button */}
                                                {booking.status === 'Confirmed' && booking.paymentStatus === 'unpaid' && (
                                                    <button
                                                        onClick={() => handlePayNow(booking)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}

                                                {/* Check In Button */}
                                                {booking.paymentStatus === 'paid' && !booking.checkInCompleted && (
                                                    <button
                                                        onClick={() => handleCheckIn(booking.id)}
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                    >
                                                        Check In
                                                    </button>
                                                )}

                                                {/* Check Out Button */}
                                                {booking.checkInCompleted && !booking.checkOutCompleted && (
                                                    <button
                                                        onClick={() => handleCheckOut(booking.id)}
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        Check Out
                                                    </button>
                                                )}

                                                {/* Transaction Details */}
                                                {booking.paymentStatus === 'paid' && booking.transactionId && (
                                                    <div className="text-sm text-gray-600">
                                                        <div>Txn: {booking.transactionId}</div>
                                                        <div>Paid: {formatDate(booking.paymentDate!)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-bold">My Booking Requests</h2>
                        {bookingRequests.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-600 text-lg font-medium">No booking requests yet</p>
                                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">Browse available rooms and click "Request Booking" to submit your first request!</p>
                                <button 
                                    onClick={() => setActiveTab('rooms')}
                                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Browse Rooms
                                </button>
                            </div>
                        ) : (
                            bookingRequests.map((request) => (
                                <div key={request._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Room #{request.roomId?.roomNumber} - {request.roomId?.type}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(request.checkInDate)} - {formatDate(request.checkOutDate)}
                                            </p>
                                        </div>
                                        <Badge 
                                            variant={request.status} 
                                            pulse={request.status === 'pending'}
                                        >
                                            {request.status}
                                        </Badge>
                                    </div>
                                    {request.message && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            <span className="font-medium">Message:</span> {request.message}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Submitted: {formatDate(request.createdAt)}
                                    </p>
                                    {request.status === 'approved' && (
                                        <p className="text-sm text-green-600 mt-2 font-medium">
                                            ✓ Approved! Check your bookings to complete payment.
                                        </p>
                                    )}
                                    {request.status === 'rejected' && (
                                        <p className="text-sm text-red-600 mt-2">
                                            Request was not approved. Please try a different room or dates.
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showBookingModal && selectedRoom && (
                <BookingRequestModal
                    isOpen={showBookingModal}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedRoom(null);
                    }}
                    room={selectedRoom}
                    onSuccess={() => {
                        loadBookingRequests();
                        setShowBookingModal(false);
                        setSelectedRoom(null);
                    }}
                />
            )}

            {selectedBookingForPayment && (
                <PaymentModal
                    isOpen={!!selectedBookingForPayment}
                    onClose={() => setSelectedBookingForPayment(null)}
                    booking={selectedBookingForPayment}
                    onSuccess={() => {
                        onRefresh();
                        setSelectedBookingForPayment(null);
                    }}
                />
            )}
        </div>
    );
};
