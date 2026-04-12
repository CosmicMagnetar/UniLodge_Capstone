import { IReview } from '../../../modules/reviews/Review';

/**
 * IReviewRepository — Interface Segregation Principle (ISP)
 */
export interface IReviewRepository {
  findByRoom(roomId: string): Promise<IReview[]>;
  create(data: Partial<IReview>): Promise<IReview>;
}
