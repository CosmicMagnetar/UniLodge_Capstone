
// Mock data
const requests = [
    { id: '1', status: 'pending' },
    { id: '2', status: 'approved' },
    { id: '3', status: 'rejected' },
    { id: '4', status: 'pending' }
];

const bookings = [
    { id: '1', paymentStatus: 'paid' },
    { id: '2', paymentStatus: 'pending' },
    { id: '3', paymentStatus: 'paid' },
    { id: '4', paymentStatus: 'failed' } // Should be treated as not paid/pending specific or just 'all'
];

// Filter Logic Simulation
function filterRequests(requests, filter) {
    if (filter === 'all') return requests;
    return requests.filter(r => r.status === filter);
}

function filterBookings(bookings, filter) {
    if (filter === 'all') return bookings;
    return bookings.filter(b => (b.paymentStatus || 'pending') === filter);
}

console.log('--- Testing Admin Filtering Logic ---');

// Test 1: Request Filtering
const pendingRequests = filterRequests(requests, 'pending');
console.log('Pending Requests:', pendingRequests.length);
if (pendingRequests.length === 2 && pendingRequests.every(r => r.status === 'pending')) console.log('PASS: Pending Requests');
else console.error('FAIL: Pending Requests');

const approvedRequests = filterRequests(requests, 'approved');
console.log('Approved Requests:', approvedRequests.length);
if (approvedRequests.length === 1 && approvedRequests[0].status === 'approved') console.log('PASS: Approved Requests');
else console.error('FAIL: Approved Requests');

// Test 2: Payment Filtering
const paidBookings = filterBookings(bookings, 'paid');
console.log('Paid Bookings:', paidBookings.length);
if (paidBookings.length === 2 && paidBookings.every(b => b.paymentStatus === 'paid')) console.log('PASS: Paid Bookings');
else console.error('FAIL: Paid Bookings');

const pendingBookings = filterBookings(bookings, 'pending');
console.log('Pending Bookings:', pendingBookings.length);
// Note: 'failed' is not 'pending', so it shouldn't be included if we strictly match 'pending'.
// But getPaymentStatus defaults to 'pending' if undefined. Here it is defined as 'failed'.
// So it should only match 'pending'.
if (pendingBookings.length === 1 && pendingBookings[0].paymentStatus === 'pending') console.log('PASS: Pending Bookings');
else console.error('FAIL: Pending Bookings');
