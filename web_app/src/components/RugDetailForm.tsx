'use client';

import { useState, useEffect } from 'react';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RugDetailFormProps {
    orderId: string;
    itemId: string;
    initialData?: {
        length?: string;
        width?: string;
        state?: string;
        material?: string;
        photo?: string | null;
    };
}

export default function RugDetailForm({ orderId, itemId }: RugDetailFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        length: '',
        width: '',
        state: 'Good',
        material: 'Synthetic',
        photo: null as File | null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [existingPhoto, setExistingPhoto] = useState<string | null>(null);

    const [cleaningCost, setCleaningCost] = useState(0);

    useEffect(() => {
        const fetchRugData = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) throw new Error('Order not found');
                const order = await response.json();

                const item = order.items.find((i: { id: string }) => i.id === itemId);
                if (item) {
                    setFormData({
                        length: item.length || '',
                        width: item.width || '',
                        state: item.state || 'Good',
                        material: item.material || 'Synthetic',
                        photo: null,
                    });
                    setExistingPhoto(item.photo || null);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load rug details');
            } finally {
                setLoading(false);
            }
        };

        fetchRugData();
    }, [orderId, itemId]);

    useEffect(() => {
        const l = parseFloat(formData.length);
        const w = parseFloat(formData.width);
        if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
            const area = l * w;
            let rate = 20; // Default
            switch (formData.material) {
                case 'Wool': rate = 20; break;
                case 'Silk': rate = 50; break;
                case 'Synthetic': rate = 15; break;
                case 'Cotton': rate = 20; break;
                case 'Blend': rate = 15; break;
                case 'Unknown': rate = 20; break;
            }
            setCleaningCost(Number((area * rate).toFixed(2)));
        } else {
            setCleaningCost(0);
        }
    }, [formData.length, formData.width, formData.material]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // In a real app, we'd upload the file and send data to API
        // Here we'll simulate updating the local JSON via a new API endpoint (to be created)

        try {
            const response = await fetch('/api/operations/update-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    itemId,
                    ...formData,
                    cleaningCost,
                    status: 'measured',
                    photo: formData.photo ? formData.photo.name : existingPhoto,
                }),
            });

            if (response.ok) {
                alert('Item details saved!');
                router.push('/operations');
            } else {
                alert('Failed to save details');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving details');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
                <Link href="/operations" className="mr-4 text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Rug Details</h2>
                    <p className="text-sm font-mono text-gray-500">{itemId}</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                    <p className="text-gray-500">Loading rug details...</p>
                </div>
            ) : error ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-blue-600 font-medium"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">

                    {/* Photo Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pre-cleaning Photo</label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                {formData.photo || existingPhoto ? (
                                    <div className="text-center">
                                        <p className="text-green-600 font-medium">{formData.photo ? formData.photo.name : existingPhoto}</p>
                                        <p className="text-xs text-gray-500 mt-1">Tap to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-10 h-10 mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-500"><span className="font-semibold">Tap to take photo</span></p>
                                    </div>
                                )}
                                <input
                                    id="photo-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="rug-length" className="block text-sm font-medium text-gray-700">Length (m)</label>
                            <input
                                id="rug-length"
                                type="number"
                                step="0.01"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.length}
                                onChange={e => setFormData(prev => ({ ...prev, length: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label htmlFor="rug-width" className="block text-sm font-medium text-gray-700">Width (m)</label>
                            <input
                                id="rug-width"
                                type="number"
                                step="0.01"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.width}
                                onChange={e => setFormData(prev => ({ ...prev, width: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Dropdowns */}
                    <div>
                        <label htmlFor="rug-state" className="block text-sm font-medium text-gray-700">State / Condition</label>
                        <select
                            id="rug-state"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={formData.state}
                            onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        >
                            <option value="Good">Good</option>
                            <option value="Stained">Stained</option>
                            <option value="Worn">Worn</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Heavily Soiled">Heavily Soiled</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="rug-material" className="block text-sm font-medium text-gray-700">Material / Type</label>
                        <select
                            id="rug-material"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={formData.material}
                            onChange={e => setFormData(prev => ({ ...prev, material: e.target.value }))}
                        >
                            <option value="Synthetic">Synthetic</option>
                            <option value="Wool">Wool</option>
                            <option value="Silk">Silk</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Blend">Blend</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Save Details
                    </button>
                </form>
            )}
        </div>
    );
}
