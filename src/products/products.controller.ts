import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create product (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'is_featured', required: false, type: Boolean })
  @ApiQuery({ name: 'is_new_arrival', required: false, type: Boolean })
  @ApiQuery({ name: 'is_best_seller', required: false, type: Boolean })
  @ApiQuery({ name: 'min_price', required: false, type: Number })
  @ApiQuery({ name: 'max_price', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'draft', 'archived'] })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price-asc', 'price-desc', 'popular', 'rating'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('category_id') category_id?: string,
    @Query('search') search?: string,
    @Query('is_featured') is_featured?: boolean,
    @Query('is_new_arrival') is_new_arrival?: boolean,
    @Query('is_best_seller') is_best_seller?: boolean,
    @Query('min_price') min_price?: number,
    @Query('max_price') max_price?: number,
    @Query('status') status?: 'active' | 'draft' | 'archived',
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters: any = {};
    
    if (category_id) filters.category_id = category_id;
    if (search) filters.search = search;
    if (is_featured !== undefined) filters.is_featured = is_featured;
    if (is_new_arrival !== undefined) filters.is_new_arrival = is_new_arrival;
    if (is_best_seller !== undefined) filters.is_best_seller = is_best_seller;
    if (min_price !== undefined && min_price !== null) filters.min_price = Number(min_price);
    if (max_price !== undefined && max_price !== null) filters.max_price = Number(max_price);
    if (status) filters.status = status;
    if (sort) filters.sort = sort;
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);
    
    return this.productsService.findAll(filters);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get product count' })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'is_featured', required: false, type: Boolean })
  @ApiQuery({ name: 'is_new_arrival', required: false, type: Boolean })
  @ApiQuery({ name: 'is_best_seller', required: false, type: Boolean })
  @ApiQuery({ name: 'min_price', required: false, type: Number })
  @ApiQuery({ name: 'max_price', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'draft', 'archived'] })
  count(
    @Query('category_id') category_id?: string,
    @Query('search') search?: string,
    @Query('is_featured') is_featured?: boolean,
    @Query('is_new_arrival') is_new_arrival?: boolean,
    @Query('is_best_seller') is_best_seller?: boolean,
    @Query('min_price') min_price?: number,
    @Query('max_price') max_price?: number,
    @Query('status') status?: 'active' | 'draft' | 'archived',
  ) {
    const filters: any = {};
    
    if (category_id) filters.category_id = category_id;
    if (search) filters.search = search;
    if (is_featured !== undefined) filters.is_featured = is_featured;
    if (is_new_arrival !== undefined) filters.is_new_arrival = is_new_arrival;
    if (is_best_seller !== undefined) filters.is_best_seller = is_best_seller;
    if (min_price !== undefined && min_price !== null) filters.min_price = Number(min_price);
    if (max_price !== undefined && max_price !== null) filters.max_price = Number(max_price);
    if (status) filters.status = status;
    
    return this.productsService.count(filters);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get('inventory-logs')
  @ApiOperation({ summary: 'Get inventory logs (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'variant_id', required: false })
  @ApiQuery({ name: 'change_type', required: false, enum: ['sale', 'restock', 'adjustment', 'return'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getInventoryLogs(
    @Query('product_id') product_id?: string,
    @Query('variant_id') variant_id?: string,
    @Query('change_type') change_type?: 'sale' | 'restock' | 'adjustment' | 'return',
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const filters: any = {};
    if (product_id) filters.product_id = product_id;
    if (variant_id) filters.variant_id = variant_id;
    if (change_type) filters.change_type = change_type;
    if (limit) filters.limit = Number(limit);
    if (page) filters.page = Number(page);

    return this.productsService.getInventoryLogs(filters);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiQuery({ name: 'type', required: false, enum: ['similar', 'frequently_bought', 'alternative'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecommendations(
    @Param('id') id: string,
    @Query('type') type?: 'similar' | 'frequently_bought' | 'alternative',
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getRecommendations(id, type, limit ? parseInt(limit.toString()) : 8);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('inventory-logs')
  @ApiOperation({ summary: 'Create inventory log (Admin only)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  createInventoryLog(@Body() logData: {
    product_id?: string;
    variant_id?: string;
    change_type: 'sale' | 'restock' | 'adjustment' | 'return';
    quantity_change: number;
    notes?: string;
    reference_id?: string;
  }) {
    return this.productsService.createInventoryLog(logData);
  }
}


