import Review, { IReview } from './Review';
import { IReviewRepository } from '../../shared/interfaces/repositories/IReviewRepository';

/**
 * ReviewRepository — Concrete Mongoose implementation.
 * 
 * Design Patterns: Repository Pattern, DIP, SRP
 */
export class ReviewRepository implements IReviewRepository {
  async findByRoom(roomId: string): Promise<IReview[]> {
    return Review.find({ roomId }).populate('userId', 'name');
  }

  async create(data: Partial<IReview>): Promise<IReview> {
    const review = new Review(data);
    await review.save();
    return review;
  }
}
