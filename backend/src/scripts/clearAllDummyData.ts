import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Room from '../models/Room';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const clearAllDummyData = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB\n');

        // Find ALL rooms
        const allRooms = await Room.find({});
        console.log(`Total rooms in database: ${allRooms.length}`);

        if (allRooms.length > 0) {
            console.log('\nAll rooms:');
            allRooms.forEach((room: any, index: number) => {
                console.log(`  ${index + 1}. ${room.title || room.roomNumber} - ${room.type} - $${room.price}/month - Status: ${room.approvalStatus || 'N/A'}`);
            });
        }

        // Find rooms with pending approval status
        const pendingRooms = await Room.find({ approvalStatus: 'pending' });
        console.log(`\nRooms with pending approval: ${pendingRooms.length}`);

        // Find rooms WITHOUT approvalStatus field (old schema)
        const roomsWithoutStatus = await Room.find({ approvalStatus: { $exists: false } });
        console.log(`Rooms without approvalStatus field: ${roomsWithoutStatus.length}`);

        // Ask user what to do
        console.log('\n=== CLEANUP OPTIONS ===');
        console.log('This script will DELETE ALL ROOMS from the database.');
        console.log('This will clear all dummy/test data.');
        console.log('\nDeleting all rooms...');

        const result = await Room.deleteMany({});
        console.log(`\n✓ Successfully deleted ${result.deletedCount} rooms`);

        // Close connection
        await mongoose.connection.close();
        console.log('✓ Database connection closed');

    } catch (error) {
        console.error('Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the script
clearAllDummyData();
