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

async function verifyAdminData() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await request('/auth/login', 'POST', {
            email: 'admin@test.com',
            password: 'password123'
        });

        if (loginRes.status !== 200) {
            console.error('Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        console.log('Logged in. Token received.');

        // 2. Fetch Pending Rooms
        console.log('Fetching Pending Rooms...');
        const roomsRes = await request('/rooms/pending', 'GET', null, token);
        console.log(`Pending Rooms Status: ${roomsRes.status}`);
        if (roomsRes.status === 200) {
            console.log(`Pending Rooms Count: ${roomsRes.data.length}`);
        } else {
            console.error('Failed to fetch pending rooms:', roomsRes.data);
        }

        // 3. Fetch Bookings
        console.log('Fetching Bookings...');
        const bookingsRes = await request('/bookings', 'GET', null, token);
        console.log(`Bookings Status: ${bookingsRes.status}`);
        if (bookingsRes.status === 200) {
            console.log(`Bookings Count: ${bookingsRes.data.length}`);
            if (bookingsRes.data.length > 0) {
                console.log('Sample Booking Payment Status:', bookingsRes.data[0].paymentStatus);
            }
        } else {
            console.error('Failed to fetch bookings:', bookingsRes.data);
        }

        // 4. Fetch Booking Requests
        console.log('Fetching Booking Requests...');
        const requestsRes = await request('/booking-requests', 'GET', null, token);
        console.log(`Booking Requests Status: ${requestsRes.status}`);
        if (requestsRes.status === 200) {
            console.log(`Booking Requests Count: ${requestsRes.data.length}`);
            const statuses = requestsRes.data.reduce((acc, r) => {
                acc[r.status] = (acc[r.status] || 0) + 1;
                return acc;
            }, {});
            console.log('Request Statuses:', statuses);
        } else {
            console.error('Failed to fetch booking requests:', requestsRes.data);
        }

    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verifyAdminData();
