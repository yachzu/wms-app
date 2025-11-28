'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi, Warehouse } from '@/services/warehouses.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { STALE_TIMES } from '@/lib/query-config';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WarehousesPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        capacity: 0,
    });

    const { data: warehouses, isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: warehousesApi.getAll,
        staleTime: STALE_TIMES.WAREHOUSES,
    });

    const createMutation = useMutation({
        mutationFn: warehousesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setIsCreateOpen(false);
            resetForm();
            toast.success('Warehouse created successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to create warehouse');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) =>
            warehousesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setIsCreateOpen(false); // Fix: Close the dialog
            setEditingWarehouse(null);
            resetForm();
            toast.success('Warehouse updated successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to update warehouse');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: warehousesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setDeleteId(null);
            toast.success('Warehouse deleted successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to delete warehouse');
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            capacity: 0,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingWarehouse) {
            updateMutation.mutate({ id: editingWarehouse.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData({
            name: warehouse.name,
            address: warehouse.address || '',
            capacity: warehouse.capacity || 0,
        });
        setIsCreateOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Warehouses</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your warehouse locations and zones
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingWarehouse(null); resetForm(); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingWarehouse ? 'Edit Warehouse' : 'Create New Warehouse'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingWarehouse
                                    ? 'Update warehouse details'
                                    : 'Add a new warehouse location'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Warehouse Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            capacity: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p className="col-span-full text-center py-8 text-muted-foreground">
                        Loading warehouses...
                    </p>
                ) : warehouses && warehouses.length > 0 ? (
                    warehouses.map((warehouse) => (
                        <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="flex items-center gap-2">
                                        <WarehouseIcon className="h-5 w-5 text-blue-600" />
                                        {warehouse.name}
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(warehouse)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(warehouse.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {warehouse.address || 'No address provided'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Capacity:</span>
                                        <span className="font-medium">{warehouse.capacity || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Zones:</span>
                                        <span className="font-medium">{warehouse.zones?.length || 0}</span>
                                    </div>
                                    <div className="pt-4">
                                        <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                            <Button variant="outline" className="w-full">
                                                Manage Zones & Locations
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                        <WarehouseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No warehouses found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create your first warehouse to get started
                        </p>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the warehouse and all its associated zones and locations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
