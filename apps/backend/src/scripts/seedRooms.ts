
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room';
import { connectDB } from '../config/database';

dotenv.config();

const universities = [
    'Harvard University',
    'MIT',
    'Stanford University',
    'UCLA',
    'Yale University',
    'Princeton University',
    'Columbia University',
    'University of Pennsylvania',
    'Cornell University',
    'Brown University',
    'Duke University',
    'Northwestern University',
    'University of Chicago',
    'Johns Hopkins University',
    'Caltech',
    'UC Berkeley',
    'University of Michigan',
    'NYU',
    'Boston University',
    'University of Texas at Austin'
];

const roomTypes = ['Single', 'Double', 'Suite', 'Studio'];

const amenitiesList = [
    'WiFi', 'AC', 'Heater', 'Kitchen', 'Laundry', 'Gym', 'Pool', 'Parking',
    'TV', 'Study Desk', 'Private Bathroom', 'Balcony', 'Microwave', 'Refrigerator',
    'Dishwasher', 'Coffee Maker', 'Iron', 'Hair Dryer', 'Safe', 'Closet'
];

// Real room images from Unsplash
const roomImages = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
    'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800',
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    'https://images.unsplash.com/photo-1616594266889-c5c96e2f4322?w=800',
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800',
    'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800',
    'https://images.unsplash.com/photo-1616594266537-2a2c6c0eb4d7?w=800',
    'https://images.unsplash.com/photo-1616594266506-0b8f2c0f5e1e?w=800',
    'https://images.unsplash.com/photo-1616594266458-5c5e5c5e5c5e?w=800'
];

const descriptions = [
    'A comfortable and cozy room perfect for students.',
    'Modern and spacious accommodation with excellent amenities.',
    'Bright and airy room with natural lighting.',
    'Newly renovated space with contemporary furnishings.',
    'Quiet and peaceful environment ideal for studying.',
    'Conveniently located near campus facilities.',
    'Stylish room with all essential amenities.',
    'Affordable and well-maintained accommodation.',
    'Premium room with luxury finishes.',
    'Budget-friendly option without compromising comfort.'
];

const generateRooms = () => {
    const rooms = [];
    let count = 1;

    for (const uni of universities) {
        // Create 5-8 rooms per university to get 100+ total
        const numRooms = Math.floor(Math.random() * 4) + 5;

        for (let i = 0; i < numRooms; i++) {
            const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];

            // More realistic pricing based on type
            let basePrice;
            switch (type) {
                case 'Single':
                    basePrice = 800 + Math.floor(Math.random() * 400);
                    break;
                case 'Double':
                    basePrice = 500 + Math.floor(Math.random() * 300);
                    break;
                case 'Suite':
                    basePrice = 1200 + Math.floor(Math.random() * 800);
                    break;
                case 'Studio':
                    basePrice = 1000 + Math.floor(Math.random() * 600);
                    break;
                default:
                    basePrice = 700;
            }

            // Random amenities (4-8)
            const amenities = [];
            const shuffledAmenities = [...amenitiesList].sort(() => 0.5 - Math.random());
            const numAmenities = Math.floor(Math.random() * 5) + 4;
            for (let j = 0; j < numAmenities; j++) {
                amenities.push(shuffledAmenities[j]);
            }

            // Random image
            const imageUrl = roomImages[Math.floor(Math.random() * roomImages.length)];

            // Random description
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];

            // Capacity based on type
            let capacity;
            switch (type) {
                case 'Single':
                    capacity = 1;
                    break;
                case 'Double':
                    capacity = 2;
                    break;
                case 'Suite':
                    capacity = 4;
                    break;
                case 'Studio':
                    capacity = 1;
                    break;
                default:
                    capacity = 1;
            }

            rooms.push({
                roomNumber: `${100 + count}`,
                type,
                price: basePrice,
                description: `${description} Located at ${uni}.`,
                isAvailable: Math.random() > 0.2, // 80% available
                amenities,
                imageUrl,
                university: uni,
                capacity,
                approvalStatus: 'approved'
            });
            count++;
        }
    }
    return rooms;
};

const seedRooms = async () => {
    try {
        await connectDB();

        console.log('Clearing existing rooms...');
        await Room.deleteMany({});

        console.log('Seeding new rooms...');
        const rooms = generateRooms();
        await Room.insertMany(rooms);

        console.log(`Successfully seeded ${rooms.length} rooms.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding rooms:', error);
        process.exit(1);
    }
};

seedRooms();
