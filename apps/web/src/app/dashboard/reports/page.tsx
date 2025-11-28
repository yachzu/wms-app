'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, MovementTrend } from '@/services/analytics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';

export default function ReportsPage() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['analytics-stats'],
        queryFn: analyticsApi.getStats,
    });

    const { data: trends, isLoading: trendsLoading } = useQuery({
        queryKey: ['analytics-trends'],
        queryFn: analyticsApi.getMovementTrends,
    });

    const { data: warehouseStock, isLoading: warehouseLoading } = useQuery({
        queryKey: ['analytics-warehouse'],
        queryFn: analyticsApi.getStockByWarehouse,
    });

    if (statsLoading || trendsLoading || warehouseLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // Process trends data for chart
    const processedTrends = trends?.reduce((acc: { date: string;[key: string]: string | number }[], curr: MovementTrend) => {
        const date = new Date(curr.date).toLocaleDateString();
        const existing = acc.find(i => i.date === date);
        if (existing) {
            existing[curr.type] = curr.count;
        } else {
            acc.push({ date, [curr.type]: curr.count });
        }
        return acc;
    }, []) || [];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Advanced Reports</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats?.lowStockCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Stock Movement Trends (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="IN" stroke="#10b981" />
                                <Line type="monotone" dataKey="OUT" stroke="#ef4444" />
                                <Line type="monotone" dataKey="TRANSFER" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Stock by Warehouse</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={warehouseStock}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="stockCount" fill="#8884d8" name="Total Items" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
