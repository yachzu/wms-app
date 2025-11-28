# WMS API Documentation

Base URL: `http://localhost:3001`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

**Header:** `Authorization: Bearer <token>`

### Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token
- `GET /auth/profile` - Get current user profile

---

## Dashboard

- `GET /dashboard/stats` - Get dashboard statistics (Total Products, Low Stock, Movements, etc.)

---

## Products

- `POST /products` - Create product
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

---

## Warehouses

- `POST /warehouses` - Create warehouse
- `GET /warehouses` - List warehouses (with zones/locations)
- `GET /warehouses/:id` - Get warehouse details
- `PATCH /warehouses/:id` - Update warehouse
- `DELETE /warehouses/:id` - Delete warehouse

### Zones & Locations
- `POST /warehouses/zones` - Create zone
- `POST /warehouses/locations` - Create location
- `GET /warehouses/zones/all` - List zones
- `GET /warehouses/locations/all` - List locations

---

## Inventory

### Stock Movements
- `POST /inventory/movements` - Create movement (IN/OUT/TRANSFER/ADJUSTMENT)
- `GET /inventory/movements` - Get movement history (Audit Log)

**Movement Types:**
- `IN`: Receive stock (requires `toLocationId`)
- `OUT`: Ship stock (requires `fromLocationId`)
- `TRANSFER`: Move stock (requires `fromLocationId` & `toLocationId`)
- `ADJUSTMENT`: Correct stock (requires `toLocationId`)

### Balance
- `GET /inventory/balance` - Get current stock balance
  - Query Params: `productId`, `locationId`

---

## Orders

- `POST /orders` - Create order (IN/OUT)
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status (PENDING -> PROCESSING -> COMPLETED/CANCELLED)

**Note:** Completing an order automatically triggers stock movements (FIFO deduction for OUT orders).
