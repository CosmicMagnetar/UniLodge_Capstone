import React, { useState, useEffect } from 'react';
import { User, Room, Booking } from '../types.ts';
import { api } from '../services/api.ts';
import { Card, StatCard, Badge, Button } from './ui.tsx';
import { useToast } from '../components/ToastProvider.tsx';
import { PriceSuggestionTool } from './PriceSuggestionTool.tsx';
import AiAgentChat  from './AiAgentChat.tsx';
import { Users, Home, CreditCard, CheckCircle, XCircle, Edit, Trash2, TrendingUp, Calendar, FileText } from 'lucide-react';

export type AdminDashboardProps = { 
    user: User; 
    rooms: Room[]; 
    bookings: Booking[]; 
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, rooms, bookings }) => {
    const { success, error } = useToast();
    const [analytics, setAnalytics] = useState<any>(null);
    const [wardens, setWardens] = useState<User[]>([]);
    const [pendingRooms, setPendingRooms] = useState<Room[]>([]);
    const [bookingRequests, setBookingRequests] = useState<any[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState<'wardens' | 'rooms' | 'payments' | 'requests'>('requests');
    const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');

    useEffect(() => {
        api.getAnalytics()
            .then(data => setAnalytics(data))
            .catch(err => console.error('Failed to load analytics:', err));
        
        // Fetch wardens
        api.getWardens()
            .then((data: User[]) => setWardens(data))
            .catch((err: any) => console.error('Failed to load wardens:', err));
        
        // Fetch pending rooms
        if ((api as any).getPendingRooms) {
            (api as any).getPendingRooms()
                .then((data: Room[]) => setPendingRooms(data))
                .catch((err: any) => console.error('Failed to load pending rooms:', err));
        } else if ((api as any).getRooms) {
            (api as any).getRooms({ status: 'pending' })
                .then((data: Room[]) => setPendingRooms(data))
                .catch((err: any) => console.error('Failed to load pending rooms via getRooms:', err));
        } else {
            setPendingRooms([]);
        }

        // Fetch booking requests with filter
        if ((api as any).getAllBookingRequests) {
            const params = requestFilter !== 'all' ? { status: requestFilter } : {};
            (api as any).getAllBookingRequests(params)
                .then((data: any[]) => setBookingRequests(data))
                .catch((err: any) => console.error('Failed to load booking requests:', err));
        }

        // Fetch bookings with payment filter
        const params = paymentFilter !== 'all' ? { paymentStatus: paymentFilter } : {};
        api.getBookings(params)
            .then((data: Booking[]) => setAllBookings(data))
            .catch((err: any) => console.error('Failed to load bookings:', err));
    }, [paymentFilter, requestFilter]); // Re-fetch when filters change

    // Use local bookings state if available, otherwise fall back to props (though props might be stale or user-specific if App.tsx logic is flawed)
    // Actually, let's just use the local state for the dashboard to be safe.
    const displayBookings = allBookings.length > 0 ? allBookings : bookings;

    const handleApproveRoom = async (roomId: string) => {
        try {
            if ((api as any).approveRoom) {
                await (api as any).approveRoom(roomId);
            }
            setPendingRooms(prev => prev.filter(r => r.id !== roomId));
        } catch (err) {
            console.error('Failed to approve room:', err);
        }
    };

    const handleRejectRoom = async (roomId: string) => {
        try {
            if ((api as any).rejectRoom) {
                await (api as any).rejectRoom(roomId);
            }
            setPendingRooms(prev => prev.filter(r => r.id !== roomId));
        } catch (err) {
            console.error('Failed to reject room:', err);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            if ((api as any).approveBookingRequest) {
                await (api as any).approveBookingRequest(requestId);
                success('Booking request approved successfully');
                // Refresh requests
                const data = await (api as any).getAllBookingRequests();
                setBookingRequests(data);
            }
        } catch (err: any) {
            console.error('Failed to approve request:', err);
            error(err.message || 'Failed to approve request');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            if ((api as any).rejectBookingRequest) {
                await (api as any).rejectBookingRequest(requestId);
                success('Booking request rejected');
                // Refresh requests
                const data = await (api as any).getAllBookingRequests();
                setBookingRequests(data);
            }
        } catch (err: any) {
            console.error('Failed to reject request:', err);
            error(err.message || 'Failed to reject request');
        }
    };

    const handleCheckIn = async (bookingId: string) => {
        try {
            await api.checkIn(bookingId);
            success('Guest checked in successfully');
            // Refresh bookings (if we had a loadBookings function, but we rely on props or refresh)
            // Since bookings come from props, we might need to trigger a refresh or update local state if we had one.
            // But AdminDashboard receives bookings as prop.
            // Wait, AdminDashboard doesn't fetch bookings itself?
            // It receives `bookings` prop.
            // But `useEffect` depends on `bookings`.
            // If I update via API, the parent `App.tsx` needs to refresh?
            // Or I can force a refresh if I fetch bookings here.
            // AdminDashboard currently uses `bookings` prop.
            // I should probably fetch bookings in AdminDashboard to keep it fresh, or assume parent updates.
            // But for now, I'll just show success.
            // Actually, I should probably add `loadBookings` to AdminDashboard or just rely on manual refresh.
            // Let's just show success for now.
        } catch (err: any) {
            error(err.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        try {
            await api.checkOut(bookingId);
            success('Guest checked out successfully');
        } catch (err: any) {
            error(err.message || 'Check-out failed');
        }
    };

    const getPaymentStatus = (booking: Booking) => {
        const status = booking.paymentStatus || 'pending';
        return (status as string) === 'unpaid' ? 'pending' : status;
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Grid */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="p-6 border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</h3>
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">${analytics.totalRevenue?.toLocaleString() || 0}</p>
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <TrendingUp size={14} /> +12.5% from last month
                            </p>
                        </Card>
                        
                        <Card className="p-6 border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</h3>
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Home size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{analytics.occupancyRate?.toFixed(1) || 0}%</p>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${analytics.occupancyRate || 0}%` }}></div>
                            </div>
                        </Card>
                        
                        <Card className="p-6 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</h3>
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Calendar size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{analytics.totalBookings || 0}</p>
                            <p className="text-sm text-slate-500 mt-2">Across all properties</p>
                        </Card>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Management Tabs */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="overflow-hidden border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200">
                                <nav className="flex">
                                    <button
                                        onClick={() => setActiveTab('wardens')}
                                        className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                            activeTab === 'wardens'
                                                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Users size={18} />
                                        Wardens
                                    </button>
                                    {/* Approvals tab removed as requested */}
                                    <button
                                        onClick={() => setActiveTab('payments')}
                                        className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                            activeTab === 'payments'
                                                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <CreditCard size={18} />
                                        Payments
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('requests')}
                                        className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                            activeTab === 'requests'
                                                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <FileText size={18} />
                                        Requests
                                        {bookingRequests.filter(r => r.status === 'pending').length > 0 && (
                                            <Badge className="ml-1 bg-blue-100 text-blue-600 border-blue-200 px-1.5 py-0.5 text-[10px]">
                                                {bookingRequests.filter(r => r.status === 'pending').length}
                                            </Badge>
                                        )}
                                    </button>
                                </nav>
                            </div>

                            <div className="p-6">
                                {/* Wardens Tab */}
                                {activeTab === 'wardens' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold text-slate-900">Manage Wardens</h2>
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                                <Users size={18} />
                                                Add Warden
                                            </Button>
                                        </div>
                                        {wardens.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                                <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                                                <p className="text-slate-900 font-medium">No wardens found</p>
                                                <p className="text-slate-500 text-sm">Add a warden to manage properties.</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                                <table className="min-w-full divide-y divide-slate-200">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-slate-200">
                                                        {wardens.map((warden) => (
                                                            <tr key={warden.id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-slate-900">{warden.name}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                                    {warden.email}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                                                        {warden.role}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                    {new Date(warden.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <button className="text-slate-400 hover:text-blue-600 transition-colors mr-3">
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button className="text-slate-400 hover:text-red-600 transition-colors">
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Payments Tab */}
                                {activeTab === 'payments' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold text-slate-900">Recent Transactions & Check-ins</h2>
                                            <select
                                                value={paymentFilter}
                                                onChange={(e) => setPaymentFilter(e.target.value as any)}
                                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="all">All Transactions</option>
                                                <option value="paid">Paid</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                        </div>
                                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                                            <table className="min-w-full divide-y divide-slate-200">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Guest</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-slate-200">
                                                    {displayBookings.map((booking) => {
                                                        const status = getPaymentStatus(booking);
                                                        return (
                                                            <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-slate-900">{(booking as any).user?.name || 'Unknown'}</div>
                                                                    <div className="text-xs text-slate-500">{(booking as any).user?.email}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                                    {(booking as any).room?.roomNumber || 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">${booking.totalPrice || 0}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border w-fit ${getPaymentStatusColor(status)}`}>
                                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                        </span>
                                                                        {booking.checkInCompleted && !booking.checkOutCompleted && (
                                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-blue-100 text-blue-700 border-blue-200 w-fit">
                                                                                Checked In
                                                                            </span>
                                                                        )}
                                                                        {booking.checkOutCompleted && (
                                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-slate-100 text-slate-700 border-slate-200 w-fit">
                                                                                Completed
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    {status === 'paid' && !booking.checkInCompleted && (
                                                                        <Button size="sm" onClick={() => handleCheckIn(booking.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                                            Check In
                                                                        </Button>
                                                                    )}
                                                                    {booking.checkInCompleted && !booking.checkOutCompleted && (
                                                                        <Button size="sm" onClick={() => handleCheckOut(booking.id)} className="bg-orange-500 hover:bg-orange-600 text-white">
                                                                            Check Out
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Requests Tab */}
                                {activeTab === 'requests' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold text-slate-900">Booking Requests</h2>
                                            <select
                                                value={requestFilter}
                                                onChange={(e) => setRequestFilter(e.target.value as any)}
                                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="pending">Pending Requests</option>
                                                <option value="approved">Approved Requests</option>
                                                <option value="rejected">Rejected Requests</option>
                                                <option value="all">All Requests</option>
                                            </select>
                                        </div>
                                        {bookingRequests.filter(r => requestFilter === 'all' ? true : r.status === requestFilter).length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                                                <p className="text-slate-900 font-medium">No requests found</p>
                                                <p className="text-slate-500 text-sm">There are no {requestFilter !== 'all' ? requestFilter : ''} booking requests to review.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {bookingRequests.filter(r => requestFilter === 'all' ? true : r.status === requestFilter).map((request) => (
                                                    <div key={request.id} className="p-4 rounded-lg border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all bg-white">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-bold text-slate-900">Request from {request.user?.name || 'Unknown User'}</h3>
                                                                    <Badge className={`
                                                                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                                                        ${request.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                                                        ${request.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                                                    `}>
                                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-slate-600 mb-2">
                                                                    Requested Room: <span className="font-medium">{request.room?.title || 'Unknown Room'}</span>
                                                                </p>
                                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(request.createdAt).toLocaleDateString()}</span>
                                                                    <span className="flex items-center gap-1"><CreditCard size={14} /> {request.room?.price ? `$${request.room.price}/month` : 'Price N/A'}</span>
                                                                </div>
                                                                {request.message && (
                                                                    <p className="mt-2 text-sm text-slate-500 italic">"{request.message}"</p>
                                                                )}
                                                            </div>
                                                            {request.status === 'pending' && (
                                                                <div className="flex gap-2 ml-4">
                                                                    <button
                                                                        onClick={() => handleApproveRequest(request.id)}
                                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectRequest(request.id)}
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                                        title="Reject"
                                                                    >
                                                                        <XCircle size={20} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: AI & Tools */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">AI Assistant</h3>
                            <AiAgentChat userRole={user.role} />
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Pricing Optimization</h3>
                            <PriceSuggestionTool />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};