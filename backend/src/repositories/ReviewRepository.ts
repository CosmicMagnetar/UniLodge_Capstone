import Review, { IReview } from '../models/Review';
import { IReviewRepository } from '../interfaces/repositories/IReviewRepository';

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
