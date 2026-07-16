# Warehouse Management System (WMS)

A production-grade, full-stack Warehouse Management System built with a modern monorepo architecture.

## Key Features

### Warehouse Operations
- **Multi-Warehouse Support**: Manage multiple warehouses, zones, and locations.
- **Inventory Management**: Real-time tracking of stock levels and movements.
- **Stock Movements**: Inbound, Outbound, Transfer, and Adjustment operations.
- **FIFO Strategy**: First-In-First-Out logic for automated stock deduction.

### Product Management
- **Product Catalog**: Manage products with SKU, barcode, and min stock levels.
- **Low Stock Alerts**: Dashboard indicators for items below minimum stock.

### Order Management
- **Purchase & Sales Orders**: Create and track orders.
- **Automated Fulfillment**: Auto-deduct stock upon order completion.
- **Status Tracking**: Pending, Processing, Completed, Cancelled statuses.

### Security and Performance
- **Authentication**: Secure JWT auth with role-based access control (RBAC).
- **Security**: Helmet.js headers, Rate Limiting, CORS protection.
- **Performance**: N+1 query optimization, Compression, Database indexing.
- **Logging**: Structured JSON logging with Winston.

## Architecture

- **Monorepo**: Managed by [Turborepo](https://turbo.build/repo).
- **Frontend**: [Next.js](https://nextjs.org/) (App Router) - `apps/web`.
- **Backend**: [NestJS](https://nestjs.com/) - `apps/api`.
- **Database**: PostgreSQL (Neon) - `packages/database` (Prisma).

## Getting Started

### Prerequisites
- Node.js (LTS)
- npm

### Installation

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    - Copy `.env.example` to `.env` in `apps/api` and `packages/database`.
    - Configure `DATABASE_URL` and `JWT_SECRET`.

### Running Locally

To run both Frontend and Backend simultaneously:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## Project Structure

```text
.
├── apps/
│   ├── web/            # Next.js Frontend (Tailwind, Shadcn/UI)
│   └── api/            # NestJS Backend (Prisma, Passport)
├── packages/
│   └── database/       # Shared Prisma Schema & Client
├── turbo.json          # Turborepo Configuration
└── package.json        # Root Scripts
```

## Development Commands

- `npm run dev`: Start development servers.
- `npm run build`: Build all apps and packages.
- `npm run lint`: Lint all code.
- `npm run db:generate`: Generate Prisma client.
- `npm run db:push`: Push schema changes to DB.
- `npm run db:seed`: Seed database with mock data.

## Deployment

### Recommended Stack (Free Tier)
- **Backend + DB**: [Railway](https://railway.app)
- **Frontend**: [Vercel](https://vercel.com)

### Deployment Steps
1. Push code to GitHub.
2. Connect repo to Railway (for API & DB).
3. Connect repo to Vercel (for Web).
4. Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).

## Security

- **JWT**: 256-bit secret keys.
- **Headers**: Helmet.js security headers.
- **Rate Limiting**: 100 requests per minute per IP.
- **CORS**: Strict origin validation.
- **Input Validation**: DTO validation with whitelist.

## License

This project is licensed under the MIT License.
