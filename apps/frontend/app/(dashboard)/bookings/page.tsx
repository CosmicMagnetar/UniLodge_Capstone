"use client";
import React, { useEffect, useState } from 'react';
import { MyBookingsPage as BookingsDashboard } from './MyBookingsPage';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { LoadingPage } from '@/components/common/LoadingPage';
import { useRouter } from 'next/navigation';

export default function BookingsPageWrapper() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();
    const router = useRouter();

    const loadData = async () => {
        try {
            const fetchedUser = await api.getMe();
            setUser(fetchedUser);
            
            const fetchedBookings = await api.getBookings();
            setBookings(fetchedBookings.filter((b:any) => b.userId === fetchedUser.id || b.userId?._id === fetchedUser.id).map((b: any) => ({
                id: b.id || b._id,
                roomId: typeof b.roomId === "object" ? b.roomId._id : b.roomId,
                userId: typeof b.userId === "object" ? b.userId._id : b.userId,
                checkInDate: b.checkInDate,
                checkOutDate: b.checkOutDate,
                status: b.status,
                totalPrice: b.totalPrice,
                room: b.room || b.roomId,
                paymentStatus: b.paymentStatus,
            })));
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await api.updateBookingStatus(bookingId, "Cancelled");
            success("Booking cancelled successfully");
            loadData();
        } catch (err: any) {
            error(err.message || "Failed to cancel booking");
        }
    };

    if (loading) return <LoadingPage />;
    if (!user) return null;

    return <BookingsDashboard bookings={bookings} onCancel={handleCancelBooking} />;
}
