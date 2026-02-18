'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hammer, CheckCircle, AlertTriangle } from 'lucide-react';

interface CarpetItem {
    id: string;
    status: string;
    state?: string;
    repairCost?: number;
    repairDescription?: string;
}

interface Order {
    id: string;
    createdAt: string;
    clientName: string;
    items: CarpetItem[];
}

export default function RepairDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading repair requests...</div>;

    // Filter items that need repair: Only Worn and Damaged items
    const repairItems = orders.flatMap(order =>
        order.items
            .filter(item =>
                ['Worn', 'Damaged'].includes(item.state || '') ||
                ['repair_needed', 'repair_estimated'].includes(item.status || '')
            )
            .map(item => ({ ...item, orderId: order.id, clientName: order.clientName }))
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Hammer className="w-6 h-6 mr-2 text-orange-600" />
                Repair Team Dashboard
            </h2>

            <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h3 className="text-sm font-medium text-orange-800">Rugs Needing Attention</h3>
                    <p className="text-3xl font-bold text-orange-900">{repairItems.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="divide-y">
                    {repairItems.map(item => (
                        <div key={`${item.orderId}-${item.id}`} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono font-bold text-gray-700">{item.id}</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                                        Order: {item.orderId}
                                    </span>
                                </div>
                                {item.repairCost && item.repairCost > 0 ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Estimate Ready (${item.repairCost.toFixed(2)})
                                    </span>
                                ) : (
                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Needs Estimate
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Condition: <span className="font-medium text-red-600">{item.state}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">Client: {item.clientName}</p>
                                </div>

                                <Link
                                    href={`/repair/${item.orderId}/${item.id}`}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                                >
                                    {(item.repairCost || 0) > 0 ? 'Edit Estimate' : 'Create Estimate'}
                                </Link>
                            </div>
                        </div>
                    ))}

                    {repairItems.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No rugs currently require repair.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
