'use client';

import { useState } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, Sparkles, Loader2, User } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { useOrders } from '@/hooks/useOrders';

export default function DeliveryDashboard() {
    const { orders, loading, loadOrders } = useOrders();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizedSequence, setOptimizedSequence] = useState<string[] | null>(null);
    const [completingOrder, setCompletingOrder] = useState<any>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleOptimize = async () => {
        if (selectedIds.length < 2) return;

        // Check if all selected orders have client addresses
        const selectedOrders = readyOrders.filter(order => selectedIds.includes(order.id));
        const ordersWithoutAddress = selectedOrders.filter(order => 
            !order.client?.postalCode || !order.client?.city || !order.client?.street
        );

        if (ordersWithoutAddress.length > 0) {
            const clientNames = ordersWithoutAddress.map(o => o.client?.name || 'Unknown').join(', ');
            alert(`❌ Cannot optimize route!\n\nThe following clients are missing address information:\n${clientNames}\n\nPlease add complete addresses (street, postal code, city) for these clients before optimizing the route.`);
            return;
        }

        setOptimizing(true);
        try {
            const response = await fetch('/api/delivery/optimize-route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds: selectedIds })
            });

            if (!response.ok) throw new Error('Optimization failed');

            const data = await response.json();
            setOptimizedSequence(data.optimizedRoute);
            
            // Show success message with stats
            if (data.stats) {
                alert(`Route optimized! 🎯\n\nStops: ${data.stats.totalStops}\nTime saved: ${data.stats.estimatedTimeSaved}\nEfficiency: ${data.stats.routeEfficiency} better`);
            }
        } catch (error) {
            console.error('Optimization error:', error);
            alert('Failed to optimize route. Please try again.');
        } finally {
            setOptimizing(false);
        }
    };

    const handleCompleteDelivery = async () => {
        if (!completingOrder || !signature) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/delivery/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: completingOrder.id,
                    deliverySignature: signature
                })
            });

            if (!res.ok) throw new Error('Failed to complete delivery');

            // Refresh the list from the hook
            await loadOrders();

            setCompletingOrder(null);
            setSignature(null);
            alert('Delivery completed successfully!');
        } catch (err) {
            console.error(err);
            alert('Error completing delivery. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 page-transition">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-gray-500 font-medium">Scanning for ready orders...</p>
        </div>
    );

    // Only orders that have items ready for delivery
    const readyOrders = orders.filter(o => o.items.some(i => i.status === 'ready_for_delivery'));

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 page-transition">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Delivery Dashboard</h2>
                    <p className="text-sm text-gray-500 font-medium">Route optimization & item tracking</p>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none mr-2">Ready</span>
                    <span className="text-lg font-black text-blue-800 leading-none">{readyOrders.length}</span>
                </div>
            </div>

            {/* Selection and Action Bar */}
            {selectedIds.length > 0 && (
                <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-blue-200 flex flex-col md:flex-row justify-between items-center gap-4 fade-in slide-in-top">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {selectedIds.length}
                        </div>
                        <span className="font-bold text-gray-700 text-sm">Orders selected for delivery</span>
                    </div>
                    <button
                        onClick={handleOptimize}
                        disabled={selectedIds.length < 2 || optimizing}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 text-sm"
                    >
                        {optimizing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Routes...</>
                        ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Smart Optimize Route</>
                        )}
                    </button>
                </div>
            )}

            {/* Orders List */}
            <div className="grid gap-4">
                {readyOrders
                    .sort((a, b) => {
                        // If we have an optimized sequence, sort by it
                        if (optimizedSequence && optimizedSequence.length > 0) {
                            const indexA = optimizedSequence.indexOf(a.id);
                            const indexB = optimizedSequence.indexOf(b.id);
                            if (indexA !== -1 && indexB !== -1) {
                                return indexA - indexB;
                            }
                        }
                        return 0;
                    })
                    .map((order, index) => {
                        const isOptimized = optimizedSequence && optimizedSequence.includes(order.id);
                        const sequenceNumber = isOptimized ? optimizedSequence.indexOf(order.id) + 1 : null;
                        
                        return (
                    <div
                        key={order.id}
                        onClick={() => toggleSelection(order.id)}
                        className={`group cursor-pointer bg-white rounded-2xl border-2 transition-all overflow-hidden ${selectedIds.includes(order.id)
                            ? 'border-blue-500 ring-4 ring-blue-500/10'
                            : 'border-white hover:border-blue-100 shadow-sm'
                            }`}
                    >
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                {sequenceNumber && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                                        {sequenceNumber}
                                    </div>
                                )}
                                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${selectedIds.includes(order.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-200 group-hover:border-blue-400'
                                    } flex items-center justify-center`}>
                                    {selectedIds.includes(order.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded text-sm">{order.id}</span>
                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                            {order.items.length} items
                                        </span>
                                    </div>
                                    <p className="font-bold text-gray-800">{order.client?.name || 'Unknown Client'}</p>
                                    <div className="flex items-center text-xs text-gray-400 font-medium">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                                        {order.client?.street && order.client?.number
                                            ? `${order.client.street} ${order.client.number}, ${order.client.postalCode || ''} ${order.client.city || ''}`.trim()
                                            : "No address provided"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col items-center md:items-end justify-between gap-2">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                    {new Date(order.createdAt).toLocaleDateString('en-CH')}
                                </span>
                                <div className="flex -space-x-1.5">
                                    {order.items.slice(0, 5).map((item) => (
                                        <div
                                            key={item.id}
                                            className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-sm ${item.status === 'delivered' ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {item.id.split('-').pop()}
                                        </div>
                                    ))}
                                    {order.items.length > 5 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[9px] font-black text-gray-400 shadow-sm">
                                            +{order.items.length - 5}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCompletingOrder(order);
                                    }}
                                    className="mt-2 text-xs bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-gray-200 flex items-center self-end active:scale-95"
                                >
                                    Complete delivery
                                </button>
                            </div>
                        </div>
                    </div>
                        );
                    })}
            </div>

            {readyOrders.length === 0 && (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <Truck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">No orders ready for delivery</p>
                </div>
            )}

            {completingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden fade-in">
                        <div className="bg-blue-600 p-6 text-white text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-1">Final Delivery Check</h3>
                            <p className="text-xs text-blue-100 font-medium">Order {completingOrder.id} for {completingOrder.client?.name}</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Receiver Signature</p>
                                <SignaturePad onEnd={setSignature} />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setCompletingOrder(null);
                                        setSignature(null);
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCompleteDelivery}
                                    disabled={!signature || submitting}
                                    className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center active:scale-95"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Items Delivered'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
