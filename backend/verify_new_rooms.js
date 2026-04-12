
const API_URL = 'http://localhost:3001/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function main() {
    console.log('--- Verifying New Rooms ---');

    // 1. Register Guest
    const guestEmail = `guest_new_${Date.now()}@test.com`;
    let res = await request('/auth/register', 'POST', {
        name: 'New Room Tester',
        email: guestEmail,
        password: 'password123'
    });
    const guestToken = res.data.token;
    console.log('Guest registered.');

    // 2. Fetch Rooms
    console.log('Fetching rooms...');
    res = await request('/rooms', 'GET'); // Assuming public endpoint or guest can access
    // Actually, GuestDashboard uses api.getBookings() and api.getUserBookingRequests().
    // But it receives `rooms` as prop.
    // Wait, the rooms are fetched in App.tsx or similar?
    // Let's check if there is a public rooms endpoint.
    // Usually it's /rooms.
    
    // If not, let's try to find a room via booking request creation?
    // No, I need a room ID.
    // Let's assume /rooms exists or I can query DB directly?
    // I can't query DB directly easily here.
    // Let's check roomController.ts to see if there is a getRooms.
    
    // I'll try to hit /rooms.
    res = await request('/rooms', 'GET');
    if (res.status === 404) {
        console.log('/rooms endpoint not found. Trying /api/rooms?');
        // It is /api/rooms if API_URL is /api.
    }
    
    console.log('Get Rooms Status:', res.status);
    if (res.status === 200) {
        const rooms = res.data;
        console.log(`Found ${rooms.length} rooms.`);
        if (rooms.length > 0) {
            const room = rooms[0];
            console.log('First room:', room.roomNumber, room.university, room.imageUrl);
            
            // 3. Book this room
            console.log(`Booking room ${room._id}...`);
            res = await request('/booking-requests', 'POST', {
                roomId: room._id,
                checkInDate: '2025-02-01',
                checkOutDate: '2025-02-05',
                message: 'Booking new room'
            }, guestToken);
            
            console.log('Booking Request Status:', res.status);
            if (res.status === 201) {
                console.log('Booking request successful!');
            } else {
                console.error('Booking request failed:', res.data);
            }
        }
    } else {
        console.error('Failed to fetch rooms.');
    }
}

main().catch(console.error);
