# SHOPLUX Backend API

Backend API for SHOPLUX e-commerce platform built with NestJS and PostgreSQL (Neon).

## Features

- 🚀 Built with NestJS
- 🗄️ PostgreSQL with TypeORM
- 🔐 JWT Authentication
- 🌐 Google OAuth Integration
- 📝 Swagger API Documentation
- ✅ Validation with class-validator
- 🎯 Row Level Security (RLS)
- 📊 Analytics Views
- 🛒 Complete E-commerce Features
- 📧 Email confirmation for orders

## Prerequisites

- Node.js 18+ 
- PostgreSQL (Neon recommended)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables with your values:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
   - `EMAIL_USER`: Email address for sending emails (default: madutech@gmail.com)
   - `EMAIL_PASSWORD`: Gmail application password (not your regular password)
   
### Email Configuration (Gmail)

Pour configurer l'envoi d'emails avec Gmail:

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application:
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Autre (nom personnalisé)"
   - Entrez "JAAYMA" comme nom
   - Copiez le mot de passe généré (16 caractères)
3. Ajoutez dans votre fichier `.env`:
   ```
   EMAIL_USER=madutech@gmail.com
   EMAIL_PASSWORD=votre_mot_de_passe_application
   ```

## Database Setup

1. Create a new database on Neon (https://neon.tech)
2. Run the SQL schema provided in the project root
3. Update the `DATABASE_URL` in `.env`

## Running the app

```bash
# Development
npm run start:dev

# Production mode
npm run start:prod
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api/docs

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── products/       # Product management
├── categories/     # Category management
├── orders/         # Order processing
├── reviews/        # Product reviews
├── carts/          # Shopping cart
├── wishlists/      # User wishlists
├── addresses/      # User addresses
├── coupons/        # Discount coupons
├── notifications/  # User notifications
├── support/        # Customer support
├── email/          # Email service (order confirmations)
├── config/         # Configuration
├── common/         # Shared utilities
└── main.ts         # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/profile` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

... and many more endpoints for all features.

## License

Proprietary - JAAYMA





