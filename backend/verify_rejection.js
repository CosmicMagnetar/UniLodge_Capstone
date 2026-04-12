
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

async function verifyRejection() {
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

        const adminToken = loginRes.data.token;
        console.log('Logged in as Admin.');

        // 2. Login as Guest (to create request)
        // We'll just register a new one to be clean
        const guestEmail = `guest_reject_${Date.now()}@test.com`;
        const regRes = await request('/auth/register', 'POST', {
            name: 'Reject Test Guest',
            email: guestEmail,
            password: 'password123'
        });
        
        const guestToken = regRes.data.token;
        console.log('Registered Guest.');

        // 3. Create Request
        console.log('Creating Request...');
        // Need a valid room ID. Let's fetch one.
        const roomsRes = await request('/rooms');
        const roomId = roomsRes.data[0]._id || roomsRes.data[0].id;

        const createRes = await request('/booking-requests', 'POST', {
            roomId,
            checkInDate: '2025-02-01',
            checkOutDate: '2025-02-05',
            message: 'Please reject me'
        }, guestToken);

        const requestId = createRes.data._id || createRes.data.id;
        console.log(`Request Created: ${requestId}`);

        // 4. Reject Request
        console.log('Rejecting Request...');
        const rejectRes = await request(`/booking-requests/${requestId}/reject`, 'POST', {}, adminToken);
        console.log(`Reject Status: ${rejectRes.status}`);

        // 5. Verify it still exists and is rejected
        console.log('Verifying Rejection Persistence...');
        const checkRes = await request('/booking-requests', 'GET', null, adminToken);
        const rejectedReq = checkRes.data.find(r => r.id === requestId || r._id === requestId);

        if (rejectedReq) {
            console.log(`Found Request. Status: ${rejectedReq.status}`);
            if (rejectedReq.status === 'rejected') {
                console.log('PASS: Request is persisted and rejected.');
            } else {
                console.error('FAIL: Request status is not rejected.');
            }
        } else {
            console.error('FAIL: Request was deleted!');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyRejection();
