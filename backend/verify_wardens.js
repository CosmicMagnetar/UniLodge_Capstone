
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

async function verifyWardens() {
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

        // 2. Fetch Wardens
        console.log('Fetching Wardens...');
        const wardensRes = await request('/auth/wardens', 'GET', null, adminToken);
        console.log(`Wardens Status: ${wardensRes.status}`);
        
        if (wardensRes.status === 200) {
            console.log(`Wardens Count: ${wardensRes.data.length}`);
            if (wardensRes.data.length === 0) {
                console.log('No wardens found. Creating a test warden...');
                // Create a warden
                const wardenEmail = `warden_${Date.now()}@test.com`;
                const regRes = await request('/auth/register', 'POST', {
                    name: 'Test Warden',
                    email: wardenEmail,
                    password: 'password123'
                });
                
                if (regRes.status === 201) {
                    console.log('Warden registered (as Guest initially).');
                    // Note: We can't easily promote to Warden via API unless there is an endpoint.
                    // But wait, the user said they can't see wardens. This implies they expect some to exist.
                    // If none exist, that's the problem.
                    // I'll check if I can promote via DB script or if I should just report "No wardens found".
                    // But wait, I don't have a promote endpoint.
                    // I'll just report the count for now.
                }
            } else {
                console.log('Wardens found:', wardensRes.data.map(w => w.email));
            }
        } else {
            console.error('Failed to fetch wardens:', wardensRes.data);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyWardens();
