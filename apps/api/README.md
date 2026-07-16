# WMS API

NestJS backend for the Warehouse Management System.

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT authentication (Passport)
- bcrypt password hashing

## Getting Started

```bash
npm run start:dev
```

API runs on [http://localhost:3001](http://localhost:3001).

## Key Modules

| Module | Description |
|--------|-------------|
| Auth | JWT login, register, profile |
| Users | User management (admin) |
| Products | Product CRUD |
| Warehouses | Warehouse, zone, location management |
| Inventory | Stock balance and movements |
| Orders | Purchase/sales orders with auto-fulfillment |

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/wms
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
```
