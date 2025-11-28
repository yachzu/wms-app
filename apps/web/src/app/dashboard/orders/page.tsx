'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, MovementType, OrderStatus } from '@/services/orders.service';
import { productsApi } from '@/services/products.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Package, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OrderItemForm {
    productId: string;
    quantity: number;
}

export default function OrdersPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [orderType, setOrderType] = useState<MovementType>(MovementType.IN);
    const [partnerName, setPartnerName] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [orderItems, setOrderItems] = useState<OrderItemForm[]>([
        { productId: '', quantity: 1 },
    ]);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: ordersApi.getAll,
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: productsApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setIsCreateOpen(false);
            resetForm();
            toast.success('Order created successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to create order');
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            ordersApi.updateStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order status updated');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to update order');
        },
    });

    const resetForm = () => {
        setOrderType(MovementType.IN);
        setPartnerName('');
        setExpectedDate('');
        setOrderItems([{ productId: '', quantity: 1 }]);
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof OrderItemForm, value: string | number) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setOrderItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validItems = orderItems.filter(item => item.productId && item.quantity > 0);
        if (validItems.length === 0) {
            toast.error('Please select at least one product with valid quantity');
            return;
        }

        console.log('Submitting order:', {
            type: orderType,
            partnerName: partnerName || undefined,
            expectedDate: expectedDate || undefined,
            items: validItems,
        });

        createMutation.mutate({
            type: orderType,
            partnerName: partnerName || undefined,
            expectedDate: expectedDate || undefined,
            items: validItems,
        });
    };

    const getStatusBadge = (status: OrderStatus) => {
        const styles = {
            [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-700',
            [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
            [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-700',
            [OrderStatus.COMPLETED]: 'bg-green-100 text-green-700',
            [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage inbound and outbound orders
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Order
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Order</DialogTitle>
                            <DialogDescription>
                                Create a purchase order (IN) or sales order (OUT)
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Order Type</Label>
                                    <Select
                                        value={orderType}
                                        onValueChange={(val: MovementType) => setOrderType(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={MovementType.IN}>Purchase Order (IN)</SelectItem>
                                            <SelectItem value={MovementType.OUT}>Sales Order (OUT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Partner Name</Label>
                                    <Input
                                        placeholder={orderType === MovementType.IN ? 'Supplier' : 'Customer'}
                                        value={partnerName}
                                        onChange={(e) => setPartnerName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Expected Date (Optional)</Label>
                                <Input
                                    type="date"
                                    value={expectedDate}
                                    onChange={(e) => setExpectedDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Order Items</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Item
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <Select
                                                    value={item.productId}
                                                    onValueChange={(val) => handleItemChange(index, 'productId', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products?.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.sku} - {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-24">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity.toString()}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        handleItemChange(index, 'quantity', isNaN(val) ? 0 : val);
                                                    }}
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            {orderItems.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                Create Order
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
                    <CardDescription>
                        {orders?.length || 0} orders
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center py-8 text-muted-foreground">
                            Loading orders...
                        </p>
                    ) : orders && orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Expected Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <span className={`font-medium ${order.type === 'IN' ? 'text-green-600' : 'text-blue-600'}`}>
                                                {order.type === 'IN' ? 'Purchase' : 'Sales'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{order.partnerName || '-'}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {order.items.length} item(s)
                                                <div className="text-xs text-muted-foreground">
                                                    {order.items.map(i => i.product.sku).join(', ')}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {order.expectedDate ? format(new Date(order.expectedDate), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {order.status === OrderStatus.PENDING && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => updateStatusMutation.mutate({
                                                                id: order.id,
                                                                status: OrderStatus.PROCESSING,
                                                            })}
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => updateStatusMutation.mutate({
                                                                id: order.id,
                                                                status: OrderStatus.CANCELLED,
                                                            })}
                                                        >
                                                            <XCircle className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === OrderStatus.PROCESSING && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateStatusMutation.mutate({
                                                            id: order.id,
                                                            status: OrderStatus.COMPLETED,
                                                        })}
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No orders yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Click &quot;Create Order&quot; to add your first order
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
