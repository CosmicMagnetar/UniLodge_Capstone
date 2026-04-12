import React, { useState } from 'react';
import { User, Room, Role, Booking } from '../types.ts';
import { api } from '../services/api.ts';
import { RoomCard } from './RoomCard.tsx';
import { Card, Button, Input, Badge } from './ui.tsx';
import AiAgentChat from './AiAgentChat.tsx';
import { GridBackground } from '../components/ui/GlowingCard.tsx';
import { Search, Filter, MapPin, Calendar, X, CreditCard, CheckCircle, Clock, FileText, AlertCircle, Map, Utensils, User as UserIcon } from 'lucide-react';
import { useToast } from '../components/ToastProvider.tsx';

export type GuestDashboardProps = { 
    user: User; 
    rooms: Room[]; 
    onBook: (roomId: string) => void; 
};

// Sub-components
const FeaturedCard: React.FC<{ imgSrc: string; title: string; subtitle: string }> = ({ imgSrc, title, subtitle }) => (
  <div className="group cursor-pointer">
    <div className="relative overflow-hidden rounded-2xl mb-4 shadow-md">
        <img src={imgSrc} alt={title} className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white font-semibold">View Details</span>
        </div>
    </div>
    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500">{subtitle}</p>
  </div>
);

const TestimonialCard: React.FC<{ quote: string; authorImg: string; authorName: string }> = ({ quote, authorImg, authorName }) => (
  <Card className="p-8 bg-slate-50 border-none">
    <div className="flex items-start gap-4">
      <img src={authorImg} alt={authorName} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
      <div>
        <p className="text-slate-600 italic mb-4 leading-relaxed">"{quote}"</p>
        <p className="font-bold text-slate-900 text-sm">- {authorName}</p>
      </div>
    </div>
  </Card>
);

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ user, rooms, onBook }) => {
    const { success, error } = useToast();
    const [activeFilter, setActiveFilter] = useState('All Rooms');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [roomType, setRoomType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Room[]>(rooms);
    const [isSearching, setIsSearching] = useState(false);
    const [requestForm, setRequestForm] = useState({
        roomId: '',
        university: '',
        visitType: '',
        reason: '',
        startDate: '',
        endDate: ''
    });

    React.useEffect(() => {
        loadData();
        setSearchResults(rooms);
    }, [rooms]);

    const loadData = async () => {
        try {
            const [bookingsData, requestsData] = await Promise.all([
                api.getBookings(),
                api.getUserBookingRequests()
            ]);
            setMyBookings(bookingsData);
            setMyRequests(requestsData);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    };

    // Debounced search function
    React.useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const results = await api.getRooms({ search: searchQuery });
                    setSearchResults(results);
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults(rooms);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delaySearch);
    }, [searchQuery, rooms]);

    const handlePay = async (bookingId: string) => {
        try {
            await api.processPayment(bookingId, 'credit_card');
            success('Payment processed successfully!');
            loadData();
        } catch (err: any) {
            error(err.message || 'Payment failed');
        }
    };

    const filters = ['All Rooms', 'Single Room', 'Furnished Options', 'Near Campus'];
    const universities = ['Harvard University', 'MIT', 'Stanford University', 'UCLA', 'Yale University', 'Princeton University'];
    const visitTypes = ['Guest Lecturer', 'Guest Intern', 'Research Collaboration', 'Visiting Faculty', 'Conference Attendee', 'Other'];
    
    const featuredListings = [
        { imgSrc: '/images/collections/village.png', title: 'The Village', subtitle: 'Average Rent: $750/month' },
        { imgSrc: '/images/collections/shared-apartments.png', title: 'Shared Apartments', subtitle: 'Average Rent: $500/month' },
        { imgSrc: '/images/collections/near-campus.png', title: 'Near Campus', subtitle: 'Average Rent: $1100/month' },
    ];

    const handleRoomBook = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        setRequestForm(prev => ({ 
            ...prev, 
            roomId,
            university: (room as any)?.university || prev.university 
        }));
        setShowRequestModal(true);
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!requestForm.roomId) {
            error('Please select a room for your request');
            return;
        }

        try {
            await api.createBookingRequest({
                roomId: requestForm.roomId,
                checkInDate: requestForm.startDate,
                checkOutDate: requestForm.endDate,
                message: `[${requestForm.visitType}] ${requestForm.reason} (University: ${requestForm.university})`
            });
            
            success('Guest request submitted successfully!');
            setShowRequestModal(false);
            loadData();
            // Reset form
            setRequestForm({
                roomId: '',
                university: '',
                visitType: '',
                reason: '',
                startDate: '',
                endDate: ''
            });
        } catch (err: any) {
            console.error('Failed to submit request:', err);
            error(err.message || 'Failed to submit request');
        }
    };

    const [sortBy, setSortBy] = useState('');

    // ... (rest of state)

    // Filter rooms based on selected criteria (use search results if searching)
    const baseRooms = searchQuery.trim() ? searchResults : rooms;
    const filteredRooms = baseRooms.filter(room => {
        if (!room.isAvailable) return false;
        if (selectedUniversity && room.university !== selectedUniversity) return false;
        if (roomType && room.type !== roomType) return false;
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (room.price < min || room.price > max) return false;
        }
        if (activeFilter !== 'All Rooms') {
            if (activeFilter === 'Single Room' && room.type !== 'Single') return false;
            if (activeFilter === 'Furnished Options' && !room.furnished) return false;
            if (activeFilter === 'Near Campus' && !room.nearCampus) return false;
        }
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'uni_asc') return a.university.localeCompare(b.university);
        if (sortBy === 'uni_desc') return b.university.localeCompare(a.university);
        return 0;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-24">
            <AiAgentChat userRole={Role.GUEST} />
            
            {/* Hero Section */}
            <div className="mb-12">
                <GridBackground
                    title={`Welcome, ${user.name}`}
                    description="Find your perfect campus accommodation with our verified listings."
                    showAvailability={false}
                    className="w-full max-w-7xl mx-auto"
                    action={
                        <button 
                            onClick={() => setShowRequestModal(true)}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Submit Guest Request
                        </button>
                    }
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
                {/* My Bookings Section */}
                {myBookings.length > 0 && (
                    <Card className="p-8 shadow-xl border-none mb-12 bg-white/95 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="text-blue-600" />
                                My Bookings
                            </h2>
                        </div>
                        <div className="grid gap-4">
                            {myBookings.map(booking => (
                                <div 
                                    key={booking.id} 
                                    onClick={() => setSelectedBooking(booking)}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-200 transition-all bg-slate-50 cursor-pointer hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {booking.status === 'Confirmed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                {(booking.room as any)?.roomNumber ? `Room ${(booking.room as any).roomNumber}` : 'Room Booking'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">${booking.totalPrice}</p>
                                            <Badge className={`${
                                                booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                            </Badge>
                                        </div>
                                        {booking.status === 'Confirmed' && booking.paymentStatus !== 'paid' && (
                                            <Button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePay(booking.id);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Pay Now
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedBooking(booking)}
                                            className="border-slate-200 hover:bg-slate-50"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Booking Details Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 bg-white">
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Booking Details</h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {(selectedBooking.room as any)?.roomNumber ? `Room ${(selectedBooking.room as any).roomNumber}` : 'Room Booking'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedBooking(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        {/* Status Cards */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Check In</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${selectedBooking.checkInCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <p className="font-semibold text-slate-700">
                                                        {selectedBooking.checkInCompleted ? 'Completed' : 'Pending'}
                                                    </p>
                                                </div>
                                                {selectedBooking.checkInTime && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(selectedBooking.checkInTime).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Check Out</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${selectedBooking.checkOutCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <p className="font-semibold text-slate-700">
                                                        {selectedBooking.checkOutCompleted ? 'Completed' : 'Pending'}
                                                    </p>
                                                </div>
                                                {selectedBooking.checkOutTime && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(selectedBooking.checkOutTime).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mess Card */}
                                        {selectedBooking.checkInCompleted && !selectedBooking.checkOutCompleted ? (
                                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
                                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                                                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
                                                
                                                <div className="relative z-10">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-2">
                                                            <Utensils className="text-blue-200" />
                                                            <h3 className="font-bold text-lg tracking-wide">MESS CARD</h3>
                                                        </div>
                                                        <img src="/images/UniLodge.png" alt="Logo" className="h-8 opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                                            <UserIcon size={32} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-blue-100 text-xs uppercase tracking-wider">Guest Name</p>
                                                            <p className="font-bold text-xl">{user.name}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-blue-200 text-xs uppercase">Room No</p>
                                                            <p className="font-semibold">{(selectedBooking.room as any)?.roomNumber || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-blue-200 text-xs uppercase">Valid Until</p>
                                                            <p className="font-semibold">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                                                <Utensils className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-slate-500 font-medium">Mess Card Unavailable</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {selectedBooking.checkOutCompleted 
                                                        ? 'Booking completed' 
                                                        : 'Please check in to access your digital mess card'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Map Section */}
                                    <div className="h-full min-h-[300px] bg-slate-100 rounded-xl overflow-hidden relative">
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                                            <div className="text-center">
                                                <MapPin className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                                                <p className="text-slate-500 font-medium">University Map</p>
                                                <p className="text-xs text-slate-400">{(selectedBooking.room as any)?.university || 'Campus Location'}</p>
                                            </div>
                                        </div>
                                        {/* Placeholder for actual map integration */}
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            frameBorder="0" 
                                            style={{ border: 0, opacity: 0.6 }}
                                            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent((selectedBooking.room as any)?.university || 'University')}`}
                                            allowFullScreen
                                        ></iframe>
                                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <Map size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">Campus Navigation</p>
                                                    <p className="text-xs text-slate-500">Get directions to your room and mess</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* My Requests Section */}
                {myRequests.length > 0 && (
                    <Card className="p-8 shadow-xl border-none mb-12 bg-white/95 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="text-purple-600" />
                                My Requests
                            </h2>
                        </div>
                        <div className="grid gap-4">
                            {myRequests.map(request => (
                                <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-purple-200 transition-all bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                            request.status === 'approved' ? 'bg-green-100 text-green-600' :
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {request.status === 'approved' ? <CheckCircle size={24} /> : 
                                             request.status === 'pending' ? <Clock size={24} /> : 
                                             <AlertCircle size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                Request for {(request.room as any)?.roomNumber || 'Room'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Submitted on {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={`${
                                            request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Featured Listings - Overlapping Hero */}
                <Card className="p-8 shadow-xl border-none mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Featured Collections</h2>
                        <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredListings.map(item => (
                            <FeaturedCard key={item.title} {...item} />
                        ))}
                    </div>
                </Card>

                {/* Advanced Filters */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-1/4 space-y-6">
                        <Card className="p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-6 text-slate-900">
                                <Filter size={20} />
                                <h2 className="font-bold text-lg">Filters</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3">University</label>
                                    <select
                                        value={selectedUniversity}
                                        onChange={(e) => setSelectedUniversity(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map(uni => (
                                            <option key={uni} value={uni}>{uni}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3">Room Type</label>
                                    <select
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">All Types</option>
                                        <option value="Single">Single</option>
                                        <option value="Double">Double</option>
                                        <option value="Suite">Suite</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Recommended</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="uni_asc">University: A-Z</option>
                                        <option value="uni_desc">University: Z-A</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3">Price Range</label>
                                    <select
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Any Price</option>
                                        <option value="0-500">$0 - $500</option>
                                        <option value="500-1000">$500 - $1000</option>
                                        <option value="1000-1500">$1000 - $1500</option>
                                        <option value="1500-5000">$1500+</option>
                                    </select>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedUniversity('');
                                        setRoomType('');
                                        setPriceRange('');
                                        setSortBy('');
                                        setActiveFilter('All Rooms');
                                    }}
                                    className="w-full"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-3/4">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by room number, type, university, or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                )}
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Filter Tabs */}
                        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                            {filters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all ${
                                        activeFilter === filter 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Room Grid */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Available Rooms <span className="text-slate-400 font-normal text-lg ml-2">{filteredRooms.length} results</span>
                                </h2>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredRooms.map(room => (
                                <RoomCard key={room.id} room={room} onBook={handleRoomBook} />
                                ))}
                            </div>
                            
                            {filteredRooms.length === 0 && (
                                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                    <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900">No rooms found</h3>
                                    <p className="text-slate-500">Try adjusting your filters to find what you're looking for.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Academics</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Hear from visiting scholars and students who have found their home away from home.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TestimonialCard 
                            quote="As a visiting lecturer, finding accommodation was always stressful. This platform made it seamless! The verification process gave me peace of mind."
                            authorImg="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&fit=crop"
                            authorName="Dr. Sarah Mitchell"
                        />
                        <TestimonialCard 
                            quote="The proximity to the lab and the included mess facility made my summer internship incredibly productive. Highly recommended for students."
                            authorImg="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&fit=crop"
                            authorName="James Wilson"
                        />
                    </div>
                </div>
            </div>

            {/* Guest Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Submit Guest Request</h2>
                                    <p className="text-slate-500 text-sm mt-1">Request special accommodation or extended stays.</p>
                                </div>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">University *</label>
                                        <select
                                            required
                                            value={requestForm.university}
                                            onChange={(e) => setRequestForm({...requestForm, university: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select University</option>
                                            {universities.map(uni => (
                                                <option key={uni} value={uni}>{uni}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Room *</label>
                                        <select
                                            required
                                            value={requestForm.roomId}
                                            onChange={(e) => setRequestForm({...requestForm, roomId: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select Room</option>
                                            {rooms.map((room: any) => (
                                                <option key={room.id} value={room.id}>
                                                    {room.roomNumber} - {room.type} (${room.price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Visit Type *</label>
                                        <select
                                            required
                                            value={requestForm.visitType}
                                            onChange={(e) => setRequestForm({...requestForm, visitType: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select Visit Type</option>
                                            {visitTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                                        <Input
                                            type="date"
                                            required
                                            value={requestForm.startDate}
                                            onChange={(e) => setRequestForm({...requestForm, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                                        <Input
                                            type="date"
                                            required
                                            value={requestForm.endDate}
                                            onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Visit *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={requestForm.reason}
                                        onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                                        placeholder="Please describe the purpose of your visit..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" className="flex-1 py-3 text-base">
                                        Submit Request
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowRequestModal(false)}
                                        className="flex-1 py-3 text-base"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};