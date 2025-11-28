'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/services/dashboard.service';
import { useQuery } from '@tanstack/react-query';
import { Package, Warehouse, TrendingUp, AlertCircle } from 'lucide-react';
import { STALE_TIMES } from '@/lib/query-config';

export default function DashboardPage() {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
        staleTime: STALE_TIMES.DASHBOARD_STATS,
    });

    const stats = [
        {
            title: 'Total Products',
            value: isLoading ? 'Loading...' : statsData?.totalProducts.toString() || '0',
            icon: Package,
            description: 'Active products in system',
            color: 'text-blue-600',
        },
        {
            title: 'Warehouses',
            value: isLoading ? 'Loading...' : statsData?.totalWarehouses.toString() || '0',
            icon: Warehouse,
            description: 'Active warehouse locations',
            color: 'text-green-600',
        },
        {
            title: 'Stock Movements',
            value: isLoading ? 'Loading...' : statsData?.totalMovements.toString() || '0',
            icon: TrendingUp,
            description: 'Today\'s transactions',
            color: 'text-purple-600',
        },
        {
            title: 'Low Stock Items',
            value: isLoading ? 'Loading...' : statsData?.lowStockItems.toString() || '0',
            icon: AlertCircle,
            description: 'Items below minimum',
            color: 'text-red-600',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Welcome to your Warehouse Management System
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                        Start managing your warehouse by setting up the following:
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">1. Add Products</h3>
                            <p className="text-sm text-muted-foreground">
                                Create your product catalog with SKUs and details
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                            <Warehouse className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">2. Setup Warehouses</h3>
                            <p className="text-sm text-muted-foreground">
                                Define your warehouse structure with zones and locations
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">3. Manage Inventory</h3>
                            <p className="text-sm text-muted-foreground">
                                Track stock movements and maintain accurate inventory levels
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
