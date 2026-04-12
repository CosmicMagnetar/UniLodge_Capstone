import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { contactService } from '../container';
import { submitContactSchema, updateContactStatusSchema } from '../validators/schemas';
import { ValidationError } from '../errors/AppError';

/**
 * ContactController — Thin Controller (SRP)
 */

export const submitContactForm = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = submitContactSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const { name, email, subject, message } = parsed.data;
    const result = await contactService.submitForm(name, email, subject, message, req.user?.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contacts = await contactService.getAllContacts(req.query.status as string);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

export const updateContactStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateContactStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const result = await contactService.updateStatus(req.params.id, parsed.data.status);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
