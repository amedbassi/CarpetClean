'use client';

import { useState, useEffect } from 'react';
import { Save, ArrowLeft, Hammer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RepairEstimateFormProps {
    orderId: string;
    itemId: string;
}

export default function RepairEstimateForm({ orderId, itemId }: RepairEstimateFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        repairDescription: '',
        repairCost: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Optional: Fetch existing estimate if editing
        fetch(`/api/orders/${orderId}`)
            .then(res => res.json())
            .then(data => {
                const item = data.items.find((i: any) => i.id === itemId);
                if (item) {
                    setFormData({
                        repairDescription: item.repairDescription || '',
                        repairCost: item.repairCost ? item.repairCost.toString() : '',
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [orderId, itemId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/operations/update-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    itemId,
                    repairDescription: formData.repairDescription,
                    repairCost: parseFloat(formData.repairCost),
                    status: 'repair_estimated',
                }),
            });

            if (response.ok) {
                alert('Repair estimate saved!');
                router.push('/repair');
            } else {
                alert('Failed to save estimate');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving estimate');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading item details...</div>;

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
                <Link href="/repair" className="mr-4 text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Repair Estimate</h2>
                    <p className="text-sm font-mono text-gray-500">{itemId}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                <div className="flex items-center justify-center mb-4 text-orange-600">
                    <Hammer className="w-12 h-12 bg-orange-50 p-2 rounded-full" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Repair Description</label>
                    <textarea
                        required
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Describe the damage and required repairs..."
                        value={formData.repairDescription}
                        onChange={e => setFormData(prev => ({ ...prev, repairDescription: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Repair Cost ($)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-lg font-bold"
                            placeholder="0.00"
                            value={formData.repairCost}
                            onChange={e => setFormData(prev => ({ ...prev, repairCost: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition-all active:scale-[0.98]"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Save & Set Estimated
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-3 italic">
                        Once saved, this estimate will be included in the client's approval link.
                    </p>
                </div>
            </form>
        </div>
    );
}
