import { IContact } from '../../models/Contact';

export interface ContactQueryFilters {
  status?: string;
}

/**
 * IContactRepository — Interface Segregation Principle (ISP)
 */
export interface IContactRepository {
  findAll(filters: ContactQueryFilters): Promise<IContact[]>;
  findByIdAndUpdate(id: string, data: Partial<IContact>): Promise<IContact | null>;
  create(data: Partial<IContact>): Promise<IContact>;
}
