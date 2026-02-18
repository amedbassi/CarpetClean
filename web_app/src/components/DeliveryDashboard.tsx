'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, Sparkles, Loader2 } from 'lucide-react';

interface CarpetItem {
    id: string;
    status: string;
}

interface Order {
    id: string;
    createdAt: string;
    clientName: string;
    address: string;
    items: CarpetItem[];
}

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizedSequence, setOptimizedSequence] = useState<string[] | null>(null);

    useEffect(() => {
        fetch('/api/delivery/ready')
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

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleOptimize = () => {
        if (selectedIds.length < 2) return;

        setOptimizing(true);
        // Simulate AI logic/API call
        setTimeout(() => {
            // Mock optimization: Sorting selected IDs alphabetically or based on a mock distance logic
            // In a real app, this would be a TSP solver call
            const optimized = [...selectedIds].sort();
            setOptimizedSequence(optimized);
            setOptimizing(false);
        }, 1500);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-gray-500 font-medium">Scanning for ready orders...</p>
        </div>
    );

    const readyOrders = orders;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Delivery Dashboard</h2>
                    <p className="text-sm text-gray-500">Manage ready orders and optimize routes</p>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none mr-2">Ready</span>
                    <span className="text-lg font-black text-blue-800 leading-none">{readyOrders.length}</span>
                </div>
            </div>

            {/* Selection and Action Bar */}
            {selectedIds.length > 0 && (
                <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-blue-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {selectedIds.length}
                        </div>
                        <span className="font-medium text-gray-700">Orders selected for delivery</span>
                    </div>
                    <button
                        onClick={handleOptimize}
                        disabled={selectedIds.length < 2 || optimizing}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                        {optimizing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Analyzing Routs...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Smart Optimize Route
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Orders List */}
            <div className="grid gap-4">
                {readyOrders.map(order => (
                    <div
                        key={order.id}
                        onClick={() => toggleSelection(order.id)}
                        className={`group cursor-pointer bg-white rounded-xl border-2 transition-all overflow-hidden ${selectedIds.includes(order.id)
                                ? 'border-blue-500 ring-4 ring-blue-500/10'
                                : 'border-gray-100 hover:border-blue-200'
                            }`}
                    >
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${selectedIds.includes(order.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-300 group-hover:border-blue-400'
                                    } flex items-center justify-center`}>
                                    {selectedIds.includes(order.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono font-bold text-gray-800">{order.id}</span>
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                            {order.items.length} items
                                        </span>
                                    </div>
                                    <p className="font-semibold text-gray-700">{order.clientName}</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                                        {order.address || "No address provided"}
                                    </div>
                                </div>
                            </div>

                            {/* Status and Items Info */}
                            <div className="flex md:flex-col items-center md:items-end justify-between gap-1">
                                <span className="text-xs text-gray-400 font-medium">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex -space-x-2">
                                    {order.items.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold ${item.status === 'delivered' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                                                }`}
                                            title={`Item ${item.id}: ${item.status}`}
                                        >
                                            {item.id}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {optimizedSequence && selectedIds.includes(order.id) && (
                            <div className="bg-blue-50 px-5 py-2 border-t border-blue-100 flex items-center">
                                <Navigation className="w-3 h-3 text-blue-500 mr-2" />
                                <span className="text-[10px] font-bold text-blue-700 uppercase">
                                    Stop #{optimizedSequence.indexOf(order.id) + 1} in Optimized Route
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {readyOrders.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No orders ready for delivery yet.</p>
                    <p className="text-sm text-gray-400">Complete measurements in Operations to see them here.</p>
                </div>
            )}
        </div>
    );
}
