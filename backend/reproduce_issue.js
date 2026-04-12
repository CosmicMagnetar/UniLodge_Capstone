
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
    console.log('--- Starting Reproduction ---');

    // 1. Register Guest
    const guestEmail = `guest_${Date.now()}@test.com`;
    console.log(`Registering Guest: ${guestEmail}`);
    let res = await request('/auth/register', 'POST', {
        name: 'Test Guest',
        email: guestEmail,
        password: 'password123'
    });
    if (res.status !== 201) {
        console.error('Guest registration failed:', res.data);
        return;
    }
    const guestToken = res.data.token;
    const guestId = res.data.user.id;
    console.log('Guest registered.');

    // 2. Register Admin
    const adminEmail = `admin_${Date.now()}@test.com`;
    console.log(`Registering Admin: ${adminEmail}`);
    // Note: Registering as admin might not be allowed directly, usually need to update DB.
    // But let's try to login as an existing admin if possible, or create a user and update role?
    // The backend might not allow creating ADMIN via register.
    // Let's check authController... but I can't check it now.
    // I'll try to register and then maybe I can't make them admin easily without DB access.
    // Wait, I can use the `db-manager.sh` or just assume I can register?
    // Let's try to register as admin if the endpoint allows role?
    // Usually it doesn't.
    // I'll try to use a known admin if I knew one.
    // Or I can try to register and see if I can use a secret code?
    // Let's assume I can't easily create an admin.
    // But I can create a booking request as guest.
    
    // Let's just try to create the request first.
    console.log('Creating Booking Request...');
    const dummyRoomId = '60d5ecb8b487343568912341';
    res = await request('/booking-requests', 'POST', {
        roomId: dummyRoomId,
        checkInDate: '2025-01-01',
        checkOutDate: '2025-01-05',
        message: 'Test request'
    }, guestToken);
    
    console.log('Create Request Status:', res.status);
    console.log('Create Request Data:', JSON.stringify(res.data, null, 2));

    if (res.status !== 201) {
        console.error('Failed to create request.');
        return;
    }
    const requestId = res.data._id || res.data.id;
    console.log(`Request Created: ${requestId}`);

    // If I can't act as admin, I can't approve.
    // But I can check if the guest can see it.
    console.log('Guest fetching my requests...');
    res = await request('/booking-requests/my-requests', 'GET', null, guestToken);
    console.log('My Requests Status:', res.status);
    // console.log('My Requests Data:', JSON.stringify(res.data, null, 2));
    
    const myReq = res.data.find(r => r.id === requestId || r._id === requestId);
    if (myReq) {
        console.log('Guest can see the request.');
        console.log('Room field:', myReq.room);
    } else {
        console.error('Guest CANNOT see the request!');
    }

    // Now I really need an admin to approve.
    // I'll try to register a user and hope I can update it in DB?
    // I don't have DB access from here easily (unless I use mongo shell).
    // But I can try to login with a hardcoded admin if there is one?
    // I saw `seed.ts` was missing.
    // 3. Login as Admin
    console.log('Logging in as Admin...');
    res = await request('/auth/login', 'POST', {
        email: 'admin@test.com',
        password: 'password123'
    });
    
    let adminToken;
    if (res.status === 200) {
        console.log('Logged in as Admin.');
        adminToken = res.data.token;
    } else {
        console.error('Failed to login as Admin:', res.data);
        return;
    }

    if (!adminToken) {
        console.warn('Skipping Admin steps - no Admin access.');
        return;
    }

    // Admin Approve
    console.log(`Admin approving request ${requestId}...`);
    res = await request(`/booking-requests/${requestId}/approve`, 'POST', {}, adminToken);
    console.log('Approve Status:', res.status);
    console.log('Approve Data:', JSON.stringify(res.data, null, 2));

    if (res.status !== 200) {
        console.error('Approval failed.');
        return;
    }

    // Admin List Bookings
    console.log('Admin listing all bookings...');
    res = await request('/bookings', 'GET', null, adminToken);
    console.log('List Bookings Status:', res.status);
    // console.log('List Bookings Data:', JSON.stringify(res.data, null, 2));

    // Guest Pay for Booking
    console.log('Guest paying for booking...');
    // We need the booking ID. The approved request created a booking.
    // Let's find the booking for this user and room.
    res = await request('/bookings', 'GET', null, guestToken);
    const myBooking = res.data.find(b => b.room && (b.room._id === dummyRoomId || b.room.id === dummyRoomId));
    
    if (!myBooking) {
        console.error('Guest cannot find the booking to pay!');
        return;
    }
    
    const bookingId = myBooking.id || myBooking._id;
    console.log(`Found booking to pay: ${bookingId}`);

    res = await request(`/bookings/${bookingId}/payment`, 'POST', {
        paymentMethod: 'credit_card'
    }, guestToken);
    
    console.log('Payment Status:', res.status);
    console.log('Payment Data:', JSON.stringify(res.data, null, 2));

    if (res.status !== 200) {
        console.error('Payment failed!');
    } else {
        console.log('Payment successful!');
    }
}

main().catch(console.error);
