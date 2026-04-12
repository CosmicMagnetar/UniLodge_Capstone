
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { connectDB } from '../config/database';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const email = 'admin@test.com';
        const password = 'password123';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User exists. Updating role to ADMIN.');
            user.role = 'ADMIN';
            await user.save();
        } else {
            console.log('Creating new ADMIN user.');
            user = await User.create({
                name: 'Admin User',
                email,
                password,
                role: 'ADMIN'
            });
        }

        console.log(`Admin user ready: ${email} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
