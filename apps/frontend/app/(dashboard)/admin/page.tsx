"use client";
import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { api } from '@/services/api';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedUser = await api.getMe();
                setUser(fetchedUser);
                if (fetchedUser.role !== Role.ADMIN) router.push('/');
                


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
        loadData();
    }, []);

    if (loading) return <LoadingPage />;
    if (!user) return null;

    return <AdminDashboard user={user} bookings={bookings} />;
}
