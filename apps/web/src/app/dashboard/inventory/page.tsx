'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, MovementType } from '@/services/inventory.service';
import { productsApi } from '@/services/products.service';
import { warehousesApi } from '@/services/warehouses.service';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [moveType, setMoveType] = useState<MovementType>(MovementType.IN);

    const [formData, setFormData] = useState({
        productId: '',
        fromLocationId: '',
        toLocationId: '',
        quantity: 1,
        referenceId: '',
    });

    // Queries
    const { data: inventory, isLoading: isInventoryLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => inventoryApi.getBalance(),
    });

    const { data: movements, isLoading: isMovementsLoading } = useQuery({
        queryKey: ['movements'],
        queryFn: () => inventoryApi.getMovements(),
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: productsApi.getAll,
    });

    const { data: warehouses } = useQuery({
        queryKey: ['warehouses'],
        queryFn: warehousesApi.getAll,
    });

    // Flatten locations for easier selection
    const allLocations = warehouses?.flatMap(w =>
        w.zones.flatMap(z => z.locations.map(l => ({
            ...l,
            zoneName: z.name,
            warehouseName: w.name,
            displayName: `${w.name} > ${z.name} > ${l.code} (${l.type})`
        })))
    ) || [];

    const createMovementMutation = useMutation({
        mutationFn: inventoryApi.createMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['movements'] });
            setIsMoveOpen(false);
            setFormData({
                productId: '',
                fromLocationId: '',
                toLocationId: '',
                quantity: 1,
                referenceId: '',
            });
            toast.success('Stock movement recorded successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to create stock movement');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation based on type
        if (moveType === MovementType.IN && !formData.toLocationId) {
            toast.error('Destination location is required for IN movement');
            return;
        }
        if (moveType === MovementType.OUT && !formData.fromLocationId) {
            toast.error('Source location is required for OUT movement');
            return;
        }
        if (moveType === MovementType.TRANSFER && (!formData.fromLocationId || !formData.toLocationId)) {
            toast.error('Both source and destination locations are required for TRANSFER');
            return;
        }

        createMovementMutation.mutate({
            type: moveType,
            productId: formData.productId,
            quantity: Number(formData.quantity),
            fromLocationId: formData.fromLocationId || undefined,
            toLocationId: formData.toLocationId || undefined,
            referenceId: formData.referenceId || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Track stock levels and movements across all warehouses
                    </p>
                </div>
                <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Register Movement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Register Stock Movement</DialogTitle>
                            <DialogDescription>
                                Record incoming stock, outgoing shipments, or internal transfers.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Movement Type</Label>
                                <Select
                                    value={moveType}
                                    onValueChange={(val: MovementType) => setMoveType(val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={MovementType.IN}>IN (Purchase/Return)</SelectItem>
                                        <SelectItem value={MovementType.OUT}>OUT (Sale/Loss)</SelectItem>
                                        <SelectItem value={MovementType.TRANSFER}>TRANSFER (Internal)</SelectItem>
                                        <SelectItem value={MovementType.ADJUSTMENT}>ADJUSTMENT (Correction)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={formData.productId}
                                    onValueChange={(val) => setFormData({ ...formData, productId: val })}
                                    required
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

                            {(moveType === MovementType.OUT || moveType === MovementType.TRANSFER) && (
                                <div className="space-y-2">
                                    <Label>From Location</Label>
                                    <Select
                                        value={formData.fromLocationId}
                                        onValueChange={(val) => setFormData({ ...formData, fromLocationId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select source location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allLocations.map((l) => (
                                                <SelectItem key={l.id} value={l.id}>
                                                    {l.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(moveType === MovementType.IN || moveType === MovementType.TRANSFER || moveType === MovementType.ADJUSTMENT) && (
                                <div className="space-y-2">
                                    <Label>To Location</Label>
                                    <Select
                                        value={formData.toLocationId}
                                        onValueChange={(val) => setFormData({ ...formData, toLocationId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select destination location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allLocations.map((l) => (
                                                <SelectItem key={l.id} value={l.id}>
                                                    {l.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.quantity.toString()}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setFormData({ ...formData, quantity: isNaN(val) ? 0 : val });
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference ID (Optional)</Label>
                                    <Input
                                        placeholder="PO-123, SO-456"
                                        value={formData.referenceId}
                                        onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                Confirm Movement
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="stock" className="w-full">
                <TabsList>
                    <TabsTrigger value="stock">Current Stock</TabsTrigger>
                    <TabsTrigger value="movements">Movement History</TabsTrigger>
                </TabsList>

                <TabsContent value="stock" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Inventory Levels</CardTitle>
                            <CardDescription>
                                Real-time stock levels by product and location
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isInventoryLoading ? (
                                <div className="text-center py-4">Loading inventory...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventory && inventory.length > 0 ? (
                                            inventory.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                                    <TableCell>{item.product.sku}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{item.location.code}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {item.location.zone?.warehouse?.name} - {item.location.zone?.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        {item.quantity}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No inventory items found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="movements" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Movement History</CardTitle>
                            <CardDescription>
                                Audit log of all inventory transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isMovementsLoading ? (
                                <div className="text-center py-4">Loading history...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead>User</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {movements && movements.length > 0 ? (
                                            movements.map((move) => (
                                                <TableRow key={move.id}>
                                                    <TableCell className="whitespace-nowrap">
                                                        {format(new Date(move.createdAt), 'MMM d, HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${move.type === 'IN' ? 'bg-green-100 text-green-700' :
                                                            move.type === 'OUT' ? 'bg-red-100 text-red-700' :
                                                                move.type === 'TRANSFER' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {move.type}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{move.product?.name}</span>
                                                            <span className="text-xs text-muted-foreground">{move.product?.sku}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {move.fromLocation?.code || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {move.toLocation?.code || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {move.type === 'OUT' ? '-' : '+'}{move.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {move.createdBy?.name}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No movements recorded yet
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
