import { Response } from 'express';
import Contact from '../models/Contact';
import { AuthRequest } from '../types';

// Submit contact form
export const submitContactForm = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;
        const userId = req.user?.id;

        const contact = new Contact({
            name,
            email,
            subject,
            message,
            userId,
        });

        await contact.save();

        res.status(201).json({ message: 'Contact form submitted successfully', contact });
    } catch (error) {
        console.error('Submit contact form error:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
};

// Get all contact submissions (Admin)
export const getAllContacts = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;
        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        const contacts = await Contact.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Failed to get contacts' });
    }
};

// Update contact status (Admin)
export const updateContactStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact status updated', contact });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ error: 'Failed to update contact status' });
    }
};
