import Contact, { IContact } from '../models/Contact';
import { IContactRepository, ContactQueryFilters } from '../interfaces/repositories/IContactRepository';

/**
 * ContactRepository — Concrete Mongoose implementation.
 * 
 * Design Patterns: Repository Pattern, DIP, SRP
 */
export class ContactRepository implements IContactRepository {
  async findAll(filters: ContactQueryFilters): Promise<IContact[]> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    return Contact.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByIdAndUpdate(id: string, data: Partial<IContact>): Promise<IContact | null> {
    return Contact.findByIdAndUpdate(id, data, { new: true });
  }

  async create(data: Partial<IContact>): Promise<IContact> {
    const contact = new Contact(data);
    await contact.save();
    return contact;
  }
}
