# JB Inverters E-commerce Website

A clean, minimal e-commerce website for JB Inverters built with Next.js, TypeScript, and TailwindCSS. Features a complete admin dashboard, cart functionality, and Venmo checkout integration.

## Features

### Frontend
- **Homepage** with hero section and product grid
- **Mail-In Service** dedicated page with detailed instructions
- **Shopping Cart** with local storage persistence
- **Contact Form** with email notifications
- **Policy Pages** (Shipping, Refunds, Terms of Service)
- **Responsive Design** optimized for mobile and desktop

### Backend & Admin
- **Admin Dashboard** with product and order management
- **Authentication System** using NextAuth.js
- **Database** with Prisma ORM and SQLite
- **API Routes** for products, orders, and contact messages
- **Email Integration** with Nodemailer

### E-commerce Features
- **Product Management** with inventory tracking
- **Order Management** with status tracking
- **Venmo Checkout** integration with deep links
- **Cart System** with quantity management
- **Contact Messages** management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jbinverters
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@jbinverters.com"

# Venmo Configuration
VENMO_USERNAME="jbinverters"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Admin Access

Default admin credentials:
- **Email**: admin@jbinverters.com
- **Password**: admin123

**Important**: Change these credentials in production!

Admin dashboard is available at `/admin/login`.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── cart/              # Cart page
│   ├── contact/           # Contact page
│   ├── mail-in-service/   # Mail-in service page
│   ├── policies/          # Policy pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── contexts/              # React contexts (Cart)
├── lib/                   # Utility functions
└── prisma/                # Database schema and seed
```

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all active products
- `POST /api/orders` - Create new order
- `POST /api/contact` - Submit contact form

### Admin Endpoints (Protected)
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create new product
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/messages` - Get contact messages

## Database Schema

### Products
- id, name, description, price, imageUrl, stock, isActive, timestamps

### Orders
- id, orderNumber, customerName, customerEmail, total, status, timestamps
- Related: OrderItems (productId, quantity, price)

### Admin
- id, email, password, timestamps

### ContactMessages
- id, name, email, message, isRead, timestamp

## Deployment

### Self-hosted Server

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Set up a reverse proxy (nginx) if needed
4. Configure SSL certificates
5. Set up database backups

### Environment Variables for Production

Make sure to set these in production:
- `NEXTAUTH_SECRET` - Random secret key
- `NEXTAUTH_URL` - Your domain URL
- `DATABASE_URL` - Production database URL
- Email configuration if using contact form
- `VENMO_USERNAME` - Your Venmo username

## Features in Detail

### Cart System
- Local storage persistence
- Quantity management
- Real-time total calculation
- Venmo checkout integration

### Mail-In Service
- Dedicated service page
- Detailed instructions
- Pricing and timeline information
- Integration with cart system

### Admin Dashboard
- Product management (CRUD operations)
- Order tracking and management
- Contact message management
- Statistics overview

### Venmo Integration
- Dynamic checkout links
- Order details in payment note
- Automatic order creation

## Customization

### Adding Products
1. Access admin dashboard
2. Go to Products tab
3. Click "Add Product"
4. Fill in product details

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/app/globals.css` for global styles
- Components use TailwindCSS classes

### Email Configuration
Configure SMTP settings in `.env` to enable contact form email notifications.

## Support

For support or questions, please contact the development team or create an issue in the repository.

## License

This project is proprietary software for JB Inverters.