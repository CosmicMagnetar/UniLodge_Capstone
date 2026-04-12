
// Mock room data
const rooms = [
    { id: '1', university: 'Harvard', price: 1000, isAvailable: true },
    { id: '2', university: 'MIT', price: 800, isAvailable: true },
    { id: '3', university: 'Stanford', price: 1200, isAvailable: true },
    { id: '4', university: 'Yale', price: 900, isAvailable: true },
];

function sortRooms(rooms, sortBy) {
    return [...rooms].sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'uni_asc') return a.university.localeCompare(b.university);
        if (sortBy === 'uni_desc') return b.university.localeCompare(a.university);
        return 0;
    });
}

console.log('--- Testing Sorting Logic ---');

// Test 1: Price Ascending
const priceAsc = sortRooms(rooms, 'price_asc');
console.log('Price Asc:', priceAsc.map(r => r.price));
if (priceAsc[0].price === 800 && priceAsc[3].price === 1200) console.log('PASS: Price Asc');
else console.error('FAIL: Price Asc');

// Test 2: Price Descending
const priceDesc = sortRooms(rooms, 'price_desc');
console.log('Price Desc:', priceDesc.map(r => r.price));
if (priceDesc[0].price === 1200 && priceDesc[3].price === 800) console.log('PASS: Price Desc');
else console.error('FAIL: Price Desc');

// Test 3: University Ascending
const uniAsc = sortRooms(rooms, 'uni_asc');
console.log('Uni Asc:', uniAsc.map(r => r.university));
if (uniAsc[0].university === 'Harvard' && uniAsc[3].university === 'Yale') console.log('PASS: Uni Asc');
else console.error('FAIL: Uni Asc');

// Test 4: University Descending
const uniDesc = sortRooms(rooms, 'uni_desc');
console.log('Uni Desc:', uniDesc.map(r => r.university));
if (uniDesc[0].university === 'Yale' && uniDesc[3].university === 'Harvard') console.log('PASS: Uni Desc');
else console.error('FAIL: Uni Desc');
