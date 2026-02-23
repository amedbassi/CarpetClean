'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ruler, CheckCircle, Package, Truck } from 'lucide-react';

interface CarpetItem {
    id: string;
    status: string;
}

interface Order {
    id: string;
    createdAt: string;
    clientName: string;
    items: CarpetItem[];
    requiresApproval: boolean;
    approvalStatus: 'not_needed' | 'pending' | 'approved' | 'rejected';
}

export default function OperationsDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = () => {
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
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, itemId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/operations/update-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    itemId,
                    status: newStatus,
                }),
            });

            if (response.ok) {
                loadOrders(); // Refresh the list
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    const toggleApprovalRequired = async (orderId: string, currentVal: boolean) => {
        try {
            const response = await fetch('/api/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    // Toggle the flag
                    requiresApproval: !currentVal,
                    // When turning approval ON, default to "pending" (client estimate approval needed)
                    // When turning approval OFF, mark as "not_needed"
                    approvalStatus: !currentVal ? 'pending' : 'not_needed'
                }),
            });

            if (response.ok) {
                loadOrders();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    const pendingRugs_count = orders.flatMap(o => o.items).filter(i => !i.status || i.status === 'pending').length;
    const measuredRugs_count = orders.flatMap(o => o.items).filter(i => i.status === 'measured').length;
    const readyRugs_count = orders.flatMap(o => o.items).filter(i => i.status === 'ready_for_delivery').length;

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'measured':
                return (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Measured
                    </span>
                );
            case 'ready_for_delivery':
                return (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                        <Package className="w-3 h-3 mr-1" /> Ready
                    </span>
                );
            case 'delivered':
                return (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center">
                        <Truck className="w-3 h-3 mr-1" /> Delivered
                    </span>
                );
            default:
                return (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Pending
                    </span>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Operations Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="text-sm font-medium text-yellow-600">Pending Measurement</h3>
                    <p className="text-3xl font-bold text-yellow-800">{pendingRugs_count}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-600">Measured</h3>
                    <p className="text-3xl font-bold text-blue-800">{measuredRugs_count}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-sm font-medium text-green-600">Ready for Delivery</h3>
                    <p className="text-3xl font-bold text-green-800">{readyRugs_count}</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <span className="font-mono font-bold text-gray-700">{order.id}</span>
                                    <span className="text-sm text-gray-500 ml-3">{order.clientName}</span>
                                </div>
                                <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1 rounded-md border text-xs shadow-sm hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={order.requiresApproval}
                                        onChange={() => toggleApprovalRequired(order.id, order.requiresApproval)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">Requires Client Approval</span>
                                </label>
                                {order.requiresApproval && (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                            order.approvalStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {order.approvalStatus.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-gray-500">
                                {(() => {
                                    const date = new Date(order.createdAt);
                                    if (isNaN(date.getTime())) return 'Invalid Date';
                                    return new Intl.DateTimeFormat('en-CH', {
                                        timeZone: 'Europe/Zurich',
                                    }).format(date);
                                })()}
                            </span>
                        </div>
                        <div className="divide-y">
                            {order.items.map(item => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-mono font-medium text-gray-800">{item.id}</span>
                                            {getStatusBadge(item.status)}
                                        </div>

                                        <Link
                                            href={`/operations/${order.id}/${item.id}`}
                                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            <Ruler className="w-4 h-4 mr-1" />
                                            {item.status === 'measured' || item.status === 'ready_for_delivery' ? 'Edit Details' : 'Input Details'}
                                        </Link>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 mt-2">
                                        {item.status === 'measured' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, item.id, 'ready_for_delivery')}
                                                disabled={order.requiresApproval && order.approvalStatus !== 'approved'}
                                                className={`px-3 py-1.5 text-white text-xs font-medium rounded transition flex items-center ${order.requiresApproval && order.approvalStatus !== 'approved'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                    }`}
                                            >
                                                <Package className="w-3 h-3 mr-1" />
                                                Mark as Ready
                                            </button>
                                        )}
                                        {order.requiresApproval && order.approvalStatus === 'pending' && (
                                            <p className="text-[10px] text-orange-600 italic mt-1">
                                                * Waiting for client approval of estimate
                                            </p>
                                        )}
                                        {item.status === 'ready_for_delivery' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, item.id, 'delivered')}
                                                className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition flex items-center"
                                            >
                                                <Truck className="w-3 h-3 mr-1" />
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No orders found.</div>
                )}
            </div>
        </div>
    );
}
