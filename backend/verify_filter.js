
// Mock data similar to what we seeded

// Mock data similar to what we seeded
const rooms = [
    { id: '1', university: 'Harvard University', type: 'Single', price: 900, isAvailable: true, nearCampus: true, furnished: true },
    { id: '2', university: 'MIT', type: 'Double', price: 600, isAvailable: true, nearCampus: false, furnished: false },
    { id: '3', university: 'Stanford University', type: 'Suite', price: 1500, isAvailable: true, nearCampus: true, furnished: true },
    { id: '4', university: 'Harvard University', type: 'Double', price: 700, isAvailable: false, nearCampus: true, furnished: true }, // Unavailable
];

function filterRooms(rooms, criteria) {
    return rooms.filter(room => {
        if (!room.isAvailable) return false;
        if (criteria.university && room.university !== criteria.university) return false;
        if (criteria.type && room.type !== criteria.type) return false;
        if (criteria.priceRange) {
            const [min, max] = criteria.priceRange.split('-').map(Number);
            if (room.price < min || room.price > max) return false;
        }
        if (criteria.activeFilter !== 'All Rooms') {
            if (criteria.activeFilter === 'Single Room' && room.type !== 'Single') return false;
            if (criteria.activeFilter === 'Furnished Options' && !room.furnished) return false;
            if (criteria.activeFilter === 'Near Campus' && !room.nearCampus) return false;
        }
        return true;
    });
}

console.log('--- Testing Filter Logic ---');

// Test 1: Filter by University
const harvardRooms = filterRooms(rooms, { university: 'Harvard University', activeFilter: 'All Rooms' });
console.log('Harvard Rooms:', harvardRooms.length); // Should be 1 (one is unavailable)
if (harvardRooms.length === 1 && harvardRooms[0].id === '1') console.log('PASS: University Filter');
else console.error('FAIL: University Filter');

// Test 2: Filter by Type
const doubleRooms = filterRooms(rooms, { type: 'Double', activeFilter: 'All Rooms' });
console.log('Double Rooms:', doubleRooms.length); // Should be 1 (MIT)
if (doubleRooms.length === 1 && doubleRooms[0].id === '2') console.log('PASS: Type Filter');
else console.error('FAIL: Type Filter');

// Test 3: Filter by Price
const cheapRooms = filterRooms(rooms, { priceRange: '500-1000', activeFilter: 'All Rooms' });
console.log('Cheap Rooms:', cheapRooms.length); // Should be 2 (Harvard Single, MIT Double)
if (cheapRooms.length === 2) console.log('PASS: Price Filter');
else console.error('FAIL: Price Filter');

// Test 4: Quick Filter (Near Campus)
const nearCampusRooms = filterRooms(rooms, { activeFilter: 'Near Campus' });
console.log('Near Campus Rooms:', nearCampusRooms.length); // Should be 2 (Harvard Single, Stanford Suite)
if (nearCampusRooms.length === 2) console.log('PASS: Near Campus Filter');
else console.error('FAIL: Near Campus Filter');
