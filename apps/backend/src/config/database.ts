import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User';
import Room from '../models/Room';

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend .env file
dotenv.config({ path: `${__dirname}/../../.env` });

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    // Seed initial data if database is empty
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    // Only seed if explicitly enabled via environment variable
    if (process.env.SEED_DATABASE !== 'true') {
      console.log('ℹ️  Database seeding disabled. Set SEED_DATABASE=true in .env to enable.');
      return;
    }

    console.log('🌱 Starting database seeding...');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@campus.edu' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@campus.edu',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'ADMIN',
      });
      await admin.save();
      console.log('✅ Seeded admin user');
    }

    // Check if guest user exists
    const guestExists = await User.findOne({ email: 'guest@visitor.com' });
    if (!guestExists) {
      const guest = new User({
        name: 'Guest User',
        email: 'guest@visitor.com',
        password: 'guest123', // Will be hashed by pre-save hook
        role: 'GUEST',
      });
      await guest.save();
      console.log('✅ Seeded guest user');
    }

    // Check if rooms exist
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const rooms = [
        {
          roomNumber: '101',
          type: 'Single' as const,
          price: 50,
          amenities: ['Wi-Fi', 'Desk', 'Private Bathroom'],
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          isAvailable: true,
          description: 'Cozy single room perfect for individual travelers',
          capacity: 1,
        },
        {
          roomNumber: '102',
          type: 'Single' as const,
          price: 55,
          amenities: ['Wi-Fi', 'Desk', 'Shared Bathroom', 'AC', 'Window View'],
          rating: 4.7,
          imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800',
          isAvailable: false,
          description: 'Single room with beautiful campus view',
          capacity: 1,
        },
        {
          roomNumber: '201',
          type: 'Double' as const,
          price: 80,
          amenities: ['Wi-Fi', 'Desk', 'TV', 'Private Bathroom', 'AC'],
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1590490359854-dfba59547d3c?q=80&w=800',
          isAvailable: true,
          description: 'Spacious double room for couples or friends',
          capacity: 2,
        },
        {
          roomNumber: '202',
          type: 'Suite' as const,
          price: 120,
          amenities: ['Wi-Fi', 'Desk', 'TV', 'Kitchenette', 'Private Bathroom', 'AC', 'Balcony'],
          rating: 4.9,
          imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800',
          isAvailable: true,
          description: 'Luxurious suite with full amenities and modern design',
          capacity: 3,
        },
      ];

      await Room.insertMany(rooms);
      console.log('✅ Seeded rooms');
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export default mongoose;
