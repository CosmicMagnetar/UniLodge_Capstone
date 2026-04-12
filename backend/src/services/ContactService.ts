import { IContactRepository } from '../interfaces/repositories/IContactRepository';
import { NotFoundError } from '../errors/AppError';

/**
 * ContactService — Service Layer (SRP)
 * 
 * Single Responsibility: ALL contact form business logic.
 * DIP: Depends on IContactRepository interface.
 */
export class ContactService {
  constructor(
    private readonly contactRepository: IContactRepository
  ) {}

  /**
   * Submit a contact form
   */
  async submitForm(name: string, email: string, subject: string, message: string, userId?: string) {
    const contact = await this.contactRepository.create({
      name,
      email,
      subject,
      message,
      userId: userId as any,
    });

    return { message: 'Contact form submitted successfully', contact };
  }

  /**
   * Get all contacts (Admin)
   */
  async getAllContacts(status?: string) {
    return this.contactRepository.findAll({ status });
  }

  /**
   * Update contact status (Admin)
   */
  async updateStatus(id: string, status: string) {
    const contact = await this.contactRepository.findByIdAndUpdate(id, { status } as any);
    if (!contact) {
      throw new NotFoundError('Contact');
    }
    return { message: 'Contact status updated', contact };
  }
}
