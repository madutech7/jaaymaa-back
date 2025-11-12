import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    // Check if user already reviewed this product
    const existing = await this.reviewsRepository.findOne({
      where: {
        product_id: createReviewDto.product_id,
        user_id: userId,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      user_id: userId,
    });

    return await this.reviewsRepository.save(review);
  }

  async findAll(productId?: string): Promise<Review[]> {
    const query = this.reviewsRepository.createQueryBuilder('review');

    if (productId) {
      query.where('review.product_id = :productId', { productId });
    }

    query.leftJoinAndSelect('review.user', 'user');
    query.leftJoinAndSelect('review.product', 'product');
    query.orderBy('review.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<Review> {
    const review = await this.findOne(id);

    if (review.user_id !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    return await this.reviewsRepository.save(review);
  }

  async remove(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const review = await this.findOne(id);

    if (!isAdmin && review.user_id !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewsRepository.remove(review);
  }
}


