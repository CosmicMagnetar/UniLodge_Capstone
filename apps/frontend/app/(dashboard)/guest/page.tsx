"use client";
import React, { useEffect, useState } from 'react';
import { GuestDashboard } from './GuestDashboard';
import { api } from '@/services/api';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function GuestPage() {
    const [user, setUser] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const loadData = async () => {
        try {
            const fetchedUser = await api.getMe();
            setUser(fetchedUser);
            if (fetchedUser.role === Role.ADMIN) router.push('/admin');
            if (fetchedUser.role === Role.WARDEN) router.push('/warden');
            
            const fetchedRooms = await api.getRooms();
            setRooms(fetchedRooms.map((r: any) => ({
                id: r._id || r.id,
                roomNumber: r.roomNumber,
                type: r.type,
                price: r.price,
                amenities: r.amenities || [],
                rating: r.rating || 0,
                imageUrl: r.imageUrl,
                isAvailable: r.isAvailable,
                description: r.description,
                capacity: r.capacity,
                university: r.university,
            })));
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);


    if (loading) return <LoadingPage />;
    if (!user) return null;

    return <GuestDashboard user={user} rooms={rooms} />;
}
