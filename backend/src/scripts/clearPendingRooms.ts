import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Room from '../models/Room';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const clearPendingRooms = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Find all pending rooms
        const pendingRooms = await Room.find({ approvalStatus: 'pending' });
        console.log(`\nFound ${pendingRooms.length} pending rooms:`);

        pendingRooms.forEach((room: any, index: number) => {
            console.log(`  ${index + 1}. ${room.title} - ${room.type} - $${room.price}/month`);
        });

        if (pendingRooms.length === 0) {
            console.log('\n✓ No pending rooms to clear!');
            await mongoose.connection.close();
            return;
        }

        // Delete all pending rooms
        console.log('\nDeleting pending rooms...');
        const result = await Room.deleteMany({ approvalStatus: 'pending' });
        console.log(`✓ Successfully deleted ${result.deletedCount} pending rooms`);

        // Close connection
        await mongoose.connection.close();
        console.log('✓ Database connection closed');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run the script
clearPendingRooms();
