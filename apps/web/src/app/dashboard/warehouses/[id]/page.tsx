'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi, Zone, Location } from '@/services/warehouses.service';
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
import { Plus, ArrowLeft, Map, Box, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

export default function WarehouseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const warehouseId = params.id as string;
    const queryClient = useQueryClient();

    const [isZoneOpen, setIsZoneOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [selectedZoneId, setSelectedZoneId] = useState<string>('');

    // Edit/Delete State
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);

    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);

    const [zoneForm, setZoneForm] = useState({ name: '' });
    const [locationForm, setLocationForm] = useState<{
        code: string;
        type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH';
        zoneId: string;
    }>({
        code: '',
        type: 'PICKING',
        zoneId: '',
    });

    const { data: warehouse, isLoading } = useQuery({
        queryKey: ['warehouse', warehouseId],
        queryFn: () => warehousesApi.getOne(warehouseId),
    });

    const createZoneMutation = useMutation({
        mutationFn: warehousesApi.createZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
            setIsZoneOpen(false);
            setZoneForm({ name: '' });
            toast.success('Zone created successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to create zone');
        },
    });

    const updateZoneMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
            warehousesApi.updateZone(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
            setIsZoneOpen(false);
            setEditingZone(null);
            setZoneForm({ name: '' });
            toast.success('Zone updated successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to update zone');
        },
    });

    const deleteZoneMutation = useMutation({
        mutationFn: warehousesApi.deleteZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
            setDeleteZoneId(null);
            toast.success('Zone deleted successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to delete zone');
        },
    });

    const createLocationMutation = useMutation({
        mutationFn: warehousesApi.createLocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
            setIsLocationOpen(false);
            setLocationForm({ code: '', type: 'PICKING', zoneId: '' });
            toast.success('Location created successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to create location');
        },
    });

    const updateLocationMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { code: string; type: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH' } }) =>
            warehousesApi.updateLocation(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
            setIsLocationOpen(false);
            setEditingLocation(null);
            setLocationForm({ code: '', type: 'PICKING', zoneId: '' });
            toast.success('Location updated successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to update location');
        },
    });

    const deleteLocationMutation = useMutation({
        mutationFn: warehousesApi.deleteLocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse', warehouseId] });
            setDeleteLocationId(null);
            toast.success('Location deleted successfully');
        },
        onError: (error: Error) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Failed to delete location');
        },
    });

    const handleCreateOrUpdateZone = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingZone) {
            updateZoneMutation.mutate({ id: editingZone.id, data: { name: zoneForm.name } });
        } else {
            createZoneMutation.mutate({
                name: zoneForm.name,
                warehouseId,
            });
        }
    };

    const handleEditZone = (zone: Zone) => {
        setEditingZone(zone);
        setZoneForm({ name: zone.name });
        setIsZoneOpen(true);
    };

    const handleCreateOrUpdateLocation = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLocation) {
            updateLocationMutation.mutate({
                id: editingLocation.id,
                data: {
                    code: locationForm.code,
                    type: locationForm.type,
                },
            });
        } else {
            createLocationMutation.mutate({
                ...locationForm,
                zoneId: selectedZoneId,
            });
        }
    };

    const handleEditLocation = (location: Location) => {
        setEditingLocation(location);
        setLocationForm({
            code: location.code,
            type: location.type,
            zoneId: location.zoneId,
        });
        setSelectedZoneId(location.zoneId);
        setIsLocationOpen(true);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading warehouse details...</div>;
    }

    if (!warehouse) {
        return <div className="text-center py-8">Warehouse not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Zones & Locations</h2>
                    <p className="text-muted-foreground">Manage storage zones and bin locations</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isZoneOpen} onOpenChange={(open) => {
                        setIsZoneOpen(open);
                        if (!open) {
                            setEditingZone(null);
                            setZoneForm({ name: '' });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Zone
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingZone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
                                <DialogDescription>
                                    {editingZone ? 'Update zone name' : 'Create a new storage zone (e.g., Zone A, Bulk Area)'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateOrUpdateZone} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Zone Name</Label>
                                    <Input
                                        id="name"
                                        value={zoneForm.name}
                                        onChange={(e) => setZoneForm({ name: e.target.value })}
                                        placeholder="e.g. Zone A"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingZone ? 'Update Zone' : 'Create Zone'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isLocationOpen} onOpenChange={(open) => {
                        setIsLocationOpen(open);
                        if (!open) {
                            setEditingLocation(null);
                            setLocationForm({ code: '', type: 'PICKING', zoneId: '' });
                            setSelectedZoneId('');
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button disabled={!warehouse.zones || warehouse.zones.length === 0}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Location
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
                                <DialogDescription>
                                    {editingLocation ? 'Update location details' : 'Create a specific storage location/bin'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateOrUpdateLocation} className="space-y-4">
                                {!editingLocation && (
                                    <div className="space-y-2">
                                        <Label htmlFor="zone">Select Zone</Label>
                                        <Select
                                            value={selectedZoneId}
                                            onValueChange={setSelectedZoneId}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a zone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {warehouse.zones?.map((zone) => (
                                                    <SelectItem key={zone.id} value={zone.id}>
                                                        {zone.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="code">Location Code</Label>
                                    <Input
                                        id="code"
                                        value={locationForm.code}
                                        onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                                        placeholder="e.g. A-01-01"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={locationForm.type}
                                        onValueChange={(value: string) => setLocationForm({ ...locationForm, type: value as 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PICKING">Picking</SelectItem>
                                            <SelectItem value="BULK">Bulk Storage</SelectItem>
                                            <SelectItem value="RECEIVING">Receiving</SelectItem>
                                            <SelectItem value="DISPATCH">Dispatch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingLocation ? 'Update Location' : 'Create Location'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {warehouse.zones && warehouse.zones.length > 0 ? (
                    warehouse.zones.map((zone) => (
                        <Card key={zone.id}>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium">{zone.name}</CardTitle>
                                    <CardDescription>
                                        {zone.locations?.length || 0} locations
                                    </CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditZone(zone)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => setDeleteZoneId(zone.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {zone.locations && zone.locations.length > 0 ? (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                            Locations in {zone.name}
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {zone.locations.map((location) => (
                                                    <TableRow key={location.id}>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                            <Box className="h-4 w-4 text-muted-foreground" />
                                                            {location.code}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${location.type === 'PICKING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                                                location.type === 'BULK' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                                }`}>
                                                                {location.type}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right text-muted-foreground">
                                                            Active
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEditLocation(location)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => setDeleteLocationId(location.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-md">
                                        No locations in this zone yet
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                        <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No zones defined</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create a zone to start adding locations
                        </p>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteZoneId} onOpenChange={() => setDeleteZoneId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the zone and all its locations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteZoneId && deleteZoneMutation.mutate(deleteZoneId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteLocationId} onOpenChange={() => setDeleteLocationId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the location.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteLocationId && deleteLocationMutation.mutate(deleteLocationId)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
