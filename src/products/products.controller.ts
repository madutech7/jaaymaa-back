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
}


