import React from 'react';
import { User, Booking, Role } from '../types.ts';
import { Card, Badge, Button } from './ui.tsx';
import  AiAgentChat  from './AiAgentChat.tsx';
import { UserCheck, LogOut, Clock, Calendar, Mail, User as UserIcon } from 'lucide-react';

export type WardenDashboardProps = {
    user: User;
    bookings: Booking[];
    onCheckIn: (bookingId: string) => void;
    onCheckOut: (bookingId: string) => void;
};

// Helper to format date/time
const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
    });
};

export const WardenDashboard: React.FC<WardenDashboardProps> = ({ user, bookings, onCheckIn, onCheckOut }) => {
    
    // Wardens only care about Confirmed, CheckedIn, or CheckedOut bookings
    const relevantBookings = bookings.filter(b => 
        b.status === 'Confirmed' || b.status === 'CheckedIn' || b.status === 'CheckedOut'
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main Content: Booking List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Guest Management</h2>
                            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                {relevantBookings.length} Active Bookings
                            </span>
                        </div>

                        {relevantBookings.length === 0 ? (
                            <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <UserCheck size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No active bookings</h3>
                                <p className="text-slate-500 mt-1">There are no guests to manage at this time.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {relevantBookings.map(booking => (
                                    <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow border-slate-200">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-6">
                                            {/* Booking Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        {booking.user?.name || 'Guest'}
                                                    </h3>
                                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                                                        Room {booking.room?.roomNumber}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-2 mt-3">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar size={16} className="text-slate-400" />
                                                        <span>
                                                            {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail size={16} className="text-slate-400" />
                                                        <span>{booking.user?.email || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* Check-in/Out Times */}
                                                {(booking.status === 'CheckedIn' || booking.status === 'CheckedOut') && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Checked In</p>
                                                            <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                                                <Clock size={14} className="text-green-500" />
                                                                {formatDateTime(booking.actualCheckIn)}
                                                            </p>
                                                        </div>
                                                        {booking.actualCheckOut && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Checked Out</p>
                                                                <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                                                    <Clock size={14} className="text-slate-400" />
                                                                    {formatDateTime(booking.actualCheckOut)}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Status & Actions */}
                                            <div className="flex flex-col items-start sm:items-end gap-3 min-w-[140px]">
                                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 ${
                                                    booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'CheckedIn' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    <span className={`h-2 w-2 rounded-full ${
                                                        booking.status === 'Confirmed' ? 'bg-blue-500' :
                                                        booking.status === 'CheckedIn' ? 'bg-green-500' :
                                                        'bg-slate-500'
                                                    }`}></span>
                                                    {booking.status}
                                                </span>
                                                
                                                {/* Action Buttons */}
                                                {booking.status === 'Confirmed' && (
                                                    <Button 
                                                        onClick={() => onCheckIn(booking.id)} 
                                                        className="w-full sm:w-auto gap-2 shadow-sm"
                                                    >
                                                        <UserCheck size={16} /> Check In
                                                    </Button>
                                                )}
                                                {booking.status === 'CheckedIn' && (
                                                    <Button 
                                                        onClick={() => onCheckOut(booking.id)} 
                                                        variant="secondary" 
                                                        className="w-full sm:w-auto gap-2"
                                                    >
                                                        <LogOut size={16} /> Check Out
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Sidebar: AI Chat */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-8">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <UserIcon size={20} className="text-blue-600" />
                                Warden Assistant
                            </h3>
                            <AiAgentChat userRole={Role.WARDEN} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};