"use client";
import React, { useEffect, useState } from 'react';
import { WardenDashboard } from './WardenDashboard';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function WardenPage() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();
    const router = useRouter();

    const loadData = async () => {
        try {
            const fetchedUser = await api.getMe();
            setUser(fetchedUser);
            if (fetchedUser.role !== Role.WARDEN) router.push('/');
            

            const fetchedBookings = await api.getBookings();
            setBookings(fetchedBookings.map((b: any) => ({
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

    const handleCheckIn = async (bookingId: string) => {
        try {
            await api.checkIn(bookingId);
            success("Guest checked in successfully");
            loadData();
        } catch (err: any) {
            error(err.message || "Check-in failed");
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        try {
            await api.checkOut(bookingId);
            success("Guest checked out successfully");
            loadData();
        } catch (err: any) {
            error(err.message || "Check-out failed");
        }
    };

    if (loading) return <LoadingPage />;
    if (!user) return null;

    return <WardenDashboard bookings={bookings} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />;
}
