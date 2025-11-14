import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductRecommendation } from './entities/product-recommendation.entity';
import { InventoryLog } from './entities/inventory-log.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductRecommendation)
    private recommendationsRepository: Repository<ProductRecommendation>,
    @InjectRepository(InventoryLog)
    private inventoryLogsRepository: Repository<InventoryLog>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(filters?: {
    category_id?: string;
    search?: string;
    is_featured?: boolean;
    is_new_arrival?: boolean;
    is_best_seller?: boolean;
    min_price?: number;
    max_price?: number;
    status?: 'active' | 'draft' | 'archived';
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    // Clean filters: remove null/undefined values to prevent SQL issues
    const cleanFilters: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== null && value !== undefined) {
          // Special handling for price filters - ensure they are valid numbers
          if (key === 'min_price' || key === 'max_price') {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue > 0) {
              cleanFilters[key] = numValue;
            }
          } else {
            cleanFilters[key] = value;
          }
        }
      });
    }
    
    // Load category relation (needed for product display)
    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Apply filters - same logic as count method
    if (cleanFilters?.category_id) {
      // Ensure category_id is treated as UUID string
      const categoryId = String(cleanFilters.category_id).trim();
      if (categoryId) {
        queryBuilder.andWhere('product.category_id = :category_id', { category_id: categoryId });
      }
    }

    if (cleanFilters?.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.short_description ILIKE :search)',
        { search: `%${cleanFilters.search}%` }
      );
    }

    if (cleanFilters?.is_featured !== undefined) {
      queryBuilder.andWhere('product.is_featured = :is_featured', { is_featured: cleanFilters.is_featured });
    }

    if (cleanFilters?.is_new_arrival !== undefined) {
      queryBuilder.andWhere('product.is_new_arrival = :is_new_arrival', { is_new_arrival: cleanFilters.is_new_arrival });
    }

    if (cleanFilters?.is_best_seller !== undefined) {
      queryBuilder.andWhere('product.is_best_seller = :is_best_seller', { is_best_seller: cleanFilters.is_best_seller });
    }

    // Apply price filters only if valid numeric values are provided (already cleaned)
    if (cleanFilters?.min_price) {
      queryBuilder.andWhere('product.price >= :min_price', { min_price: cleanFilters.min_price });
    }

    if (cleanFilters?.max_price) {
      queryBuilder.andWhere('product.price <= :max_price', { max_price: cleanFilters.max_price });
    }

    // Apply status filter
    // By default, exclude archived products (show active and draft)
    // If status is explicitly provided, use that filter
    if (cleanFilters?.status !== undefined && cleanFilters?.status !== null) {
      queryBuilder.andWhere('product.status = :status', { status: cleanFilters.status });
    } else {
      queryBuilder.andWhere('product.status != :archivedStatus', { archivedStatus: 'archived' });
    }

    // Apply sorting
    if (cleanFilters?.sort) {
      switch (cleanFilters.sort) {
        case 'newest':
          queryBuilder.orderBy('product.created_at', 'DESC');
          break;
        case 'price-asc':
          queryBuilder.orderBy('product.price', 'ASC');
          break;
        case 'price-desc':
          queryBuilder.orderBy('product.price', 'DESC');
          break;
        case 'popular':
          queryBuilder.orderBy('product.review_count', 'DESC');
          break;
        case 'rating':
          queryBuilder.orderBy('product.rating', 'DESC');
          break;
        default:
          queryBuilder.orderBy('product.created_at', 'DESC');
      }
    } else {
      queryBuilder.orderBy('product.created_at', 'DESC');
    }

    // Apply pagination with default limit
    const limit = cleanFilters?.limit || 12; // Default limit of 12 products
    if (cleanFilters?.page) {
      const skip = (cleanFilters.page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    } else {
      // Apply default limit even if no page specified
      queryBuilder.take(limit);
    }

    // Use getRawAndEntities() for better performance with large datasets
    // But for now, getMany() is fine as we're already limiting results
    const products = await queryBuilder.getMany();
    
    // Optimize: Remove unnecessary data before returning
    return products.map(product => {
      // Ensure images are properly formatted
      if (product.images && typeof product.images === 'string') {
        try {
          product.images = JSON.parse(product.images);
        } catch {
          product.images = [];
        }
      }
      return product;
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'reviews', 'product_images', 'product_variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['category', 'reviews', 'product_images', 'product_variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = quantity;
    return await this.productsRepository.save(product);
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }
    product.stock -= quantity;
    return await this.productsRepository.save(product);
  }

  async count(filters?: {
    category_id?: string;
    search?: string;
    is_featured?: boolean;
    is_new_arrival?: boolean;
    is_best_seller?: boolean;
    min_price?: number;
    max_price?: number;
    status?: 'active' | 'draft' | 'archived';
  }): Promise<number> {
    // Clean filters: remove null/undefined values to prevent SQL issues
    const cleanFilters: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== null && value !== undefined) {
          // Special handling for price filters - ensure they are valid numbers
          if (key === 'min_price' || key === 'max_price') {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue > 0) {
              cleanFilters[key] = numValue;
            }
          } else {
            cleanFilters[key] = value;
          }
        }
      });
    }
    
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    // Apply filters - must match exactly with findAll
    if (cleanFilters?.category_id) {
      // Ensure category_id is treated as UUID string
      const categoryId = String(cleanFilters.category_id).trim();
      if (categoryId) {
        queryBuilder.andWhere('product.category_id = :category_id', { category_id: categoryId });
      }
    }

    if (cleanFilters?.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.short_description ILIKE :search)',
        { search: `%${cleanFilters.search}%` }
      );
    }

    if (cleanFilters?.is_featured !== undefined) {
      queryBuilder.andWhere('product.is_featured = :is_featured', { is_featured: cleanFilters.is_featured });
    }

    if (cleanFilters?.is_new_arrival !== undefined) {
      queryBuilder.andWhere('product.is_new_arrival = :is_new_arrival', { is_new_arrival: cleanFilters.is_new_arrival });
    }

    if (cleanFilters?.is_best_seller !== undefined) {
      queryBuilder.andWhere('product.is_best_seller = :is_best_seller', { is_best_seller: cleanFilters.is_best_seller });
    }

    // Apply price filters only if valid numeric values are provided (already cleaned)
    if (cleanFilters?.min_price) {
      queryBuilder.andWhere('product.price >= :min_price', { min_price: cleanFilters.min_price });
    }

    if (cleanFilters?.max_price) {
      queryBuilder.andWhere('product.price <= :max_price', { max_price: cleanFilters.max_price });
    }

    // Apply status filter
    // IMPORTANT: Apply status filter BEFORE other filters to ensure correct count
    // By default, exclude archived products (matching findAll behavior)
    if (cleanFilters?.status !== undefined && cleanFilters?.status !== null) {
      queryBuilder.andWhere('product.status = :status', { status: cleanFilters.status });
    } else {
      queryBuilder.andWhere('product.status != :archivedStatus', { archivedStatus: 'archived' });
    }

    // Use getRawOne with COUNT(*) to ensure accurate count
    // This is more reliable than getCount() when using complex filters
    const result = await queryBuilder
      .select('COUNT(*)', 'count')
      .getRawOne();
    
    // Handle different possible result formats
    const count = result ? (parseInt(result.count, 10) || parseInt(result.COUNT, 10) || 0) : 0;
    return count;
  }

  /**
   * Get product recommendations
   * Returns recommended products based on the recommendation table or similar products
   */
  async getRecommendations(
    productId: string,
    type?: 'similar' | 'frequently_bought' | 'alternative',
    limit: number = 8
  ): Promise<Product[]> {
    // First, try to get recommendations from the recommendations table
    const queryBuilder = this.recommendationsRepository
      .createQueryBuilder('rec')
      .leftJoinAndSelect('rec.recommended_product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .where('rec.product_id = :productId', { productId })
      .andWhere('product.status = :status', { status: 'active' });

    if (type) {
      queryBuilder.andWhere('rec.type = :type', { type });
    }

    queryBuilder
      .orderBy('rec.score', 'DESC')
      .addOrderBy('rec.created_at', 'DESC')
      .limit(limit);

    const recommendations = await queryBuilder.getMany();

    // If we have recommendations from the table, return them
    if (recommendations.length > 0) {
      return recommendations.map(rec => rec.recommended_product);
    }

    // Otherwise, fallback to similar products from the same category
    const product = await this.findOne(productId);
    if (!product || !product.category_id) {
      return [];
    }

    // Get similar products from the same category
    const similarProducts = await this.productsRepository.find({
      where: {
        category_id: product.category_id,
        status: 'active',
      },
      relations: ['category'],
      take: limit + 1, // +1 to exclude the current product
    });

    // Filter out the current product and return
    return similarProducts
      .filter(p => p.id !== productId)
      .slice(0, limit);
  }

  // Inventory Logs
  async getInventoryLogs(filters?: {
    product_id?: string;
    variant_id?: string;
    change_type?: 'sale' | 'restock' | 'adjustment' | 'return';
    limit?: number;
    page?: number;
  }): Promise<InventoryLog[]> {
    try {
      // Build where conditions
      const where: any = {};

      if (filters?.product_id) {
        where.product_id = filters.product_id;
      }

      if (filters?.variant_id) {
        where.variant_id = filters.variant_id;
      }

      if (filters?.change_type) {
        where.change_type = filters.change_type;
      }

      const limit = filters?.limit || 50;
      const skip = filters?.page ? (filters.page - 1) * limit : 0;

      // Use find without relations to avoid issues with nullable foreign keys
      // Relations can cause errors when foreign keys are null
      const findOptions: any = {
        where: Object.keys(where).length > 0 ? where : undefined,
        order: { created_at: 'DESC' },
        take: limit,
        skip: skip,
      };

      // Don't load relations for now to avoid issues with nullable foreign keys
      // The frontend can handle the data without relations
      const logs = await this.inventoryLogsRepository.find(findOptions);

      return logs;
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async createInventoryLog(logData: {
    product_id?: string;
    variant_id?: string;
    change_type: 'sale' | 'restock' | 'adjustment' | 'return';
    quantity_change: number;
    notes?: string;
    reference_id?: string;
    created_by?: string;
  }): Promise<InventoryLog> {
    // Get current quantity from product or variant
    let quantityBefore = 0;
    if (logData.product_id) {
      const product = await this.productsRepository.findOne({ where: { id: logData.product_id } });
      quantityBefore = product?.stock_quantity || 0;
    } else if (logData.variant_id) {
      // Note: You may need to add variant repository if not already available
      // For now, we'll set quantity before to 0 if variant-based
      quantityBefore = 0;
    }

    const quantityAfter = quantityBefore + logData.quantity_change;

    const log = this.inventoryLogsRepository.create({
      product_id: logData.product_id || null,
      variant_id: logData.variant_id || null,
      change_type: logData.change_type,
      quantity_change: logData.quantity_change,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      notes: logData.notes || null,
      reference_id: logData.reference_id || null,
      created_by: logData.created_by || null,
    });

    return await this.inventoryLogsRepository.save(log);
  }
}


