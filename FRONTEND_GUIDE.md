# WMS Frontend - User Guide

## Getting Started

### 1. Access the Application
Open your browser and navigate to: **http://localhost:3000**

### 2. Register an Account
- Click "Register here" on the login page
- Fill in your details:
  - Full Name
  - Email
  - Password (minimum 6 characters)
- Click "Register"

### 3. Login
- Enter your email and password
- Click "Login"
- You'll be redirected to the dashboard

## Features

### Dashboard
- Overview of your warehouse statistics
- Quick access to all modules
- Getting started guide

### Products Management
Navigate to **Products** from the sidebar.

**Add a Product:**
1. Click "Add Product" button
2. Fill in the form:
   - SKU (required, unique)
   - Product Name (required)
   - Description (optional)
   - Barcode (optional)
   - Minimum Stock (default: 0)
3. Click "Create Product"

**Edit a Product:**
1. Click the pencil icon on any product row
2. Update the fields (SKU cannot be changed)
3. Click "Update Product"

**Delete a Product:**
1. Click the trash icon on any product row
2. Confirm the deletion

### Navigation
- **Dashboard**: Overview and statistics
- **Products**: Product catalog management
- **Warehouses**: Warehouse structure (coming soon)
- **Inventory**: Stock movements and balance (coming soon)
- **Logout**: Sign out of the application

## Technical Details

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Auto-redirect to login if token expires
- Protected routes require authentication

### State Management
- **Server State**: React Query (automatic caching, refetching)
- **Client State**: Zustand (auth state)

### API Integration
- Base URL: http://localhost:3001
- Automatic token injection
- Error handling with toast notifications

## Troubleshooting

**Can't login?**
- Check if the backend API is running (port 3001)
- Verify your credentials
- Check browser console for errors

**Products not loading?**
- Ensure you're logged in
- Check network tab for API errors
- Verify backend is running

**Token expired?**
- You'll be automatically redirected to login
- Simply log in again
