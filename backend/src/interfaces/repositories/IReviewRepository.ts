import { IReview } from '../../models/Review';

/**
 * IReviewRepository — Interface Segregation Principle (ISP)
 */
export interface IReviewRepository {
  findByRoom(roomId: string): Promise<IReview[]>;
  create(data: Partial<IReview>): Promise<IReview>;
}
