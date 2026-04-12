import os

guest_page = """"use client";
import React, { useEffect, useState } from 'react';
import { GuestDashboard } from './GuestDashboard';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function GuestPage() {
    const [user, setUser] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error, info } = useToast();
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

    const handleBook = async (roomId: string) => {
        if (!user) {
            info("Please login to book a room");
            router.push('/login');
            return;
        }
        if (user.role === Role.ADMIN || user.role === Role.WARDEN) {
            error("Staff cannot book rooms.");
            return;
        }
        const checkIn = prompt("Enter check-in date (YYYY-MM-DD):");
        const checkOut = prompt("Enter check-out date (YYYY-MM-DD):");
        if (!checkIn || !checkOut) return;
        try {
            await api.createBooking(roomId, checkIn, checkOut);
            success("Booking created successfully!");
            loadData();
        } catch (err: any) {
            error(err.message || "Failed to create booking");
        }
    };

    if (loading) return <LoadingPage />;
    if (!user) return null;

    return <GuestDashboard user={user} rooms={rooms} onBook={handleBook} />;
}
"""

admin_page = """"use client";
import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedUser = await api.getMe();
                setUser(fetchedUser);
                if (fetchedUser.role !== Role.ADMIN) router.push('/');
                
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

    return <AdminDashboard user={user} rooms={rooms} bookings={bookings} />;
}
"""

warden_page = """"use client";
import React, { useEffect, useState } from 'react';
import { WardenDashboard } from './WardenDashboard';
import { api } from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { LoadingPage } from '@/components/common/LoadingPage';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function WardenPage() {
    const [user, setUser] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();
    const router = useRouter();

    const loadData = async () => {
        try {
            const fetchedUser = await api.getMe();
            setUser(fetchedUser);
            if (fetchedUser.role !== Role.WARDEN) router.push('/');
            
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

    return <WardenDashboard user={user} rooms={rooms} bookings={bookings} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />;
}
"""

bookings_page = """"use client";
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
"""

with open('app/(dashboard)/guest/page.tsx', 'w') as f:
    f.write(guest_page)
with open('app/(dashboard)/admin/page.tsx', 'w') as f:
    f.write(admin_page)
with open('app/(dashboard)/warden/page.tsx', 'w') as f:
    f.write(warden_page)
with open('app/(dashboard)/bookings/page.tsx', 'w') as f:
    f.write(bookings_page)

print("Wrappers created.")
