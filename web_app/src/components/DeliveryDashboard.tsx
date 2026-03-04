'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, Sparkles, Loader2, User } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/lib/LanguageContext';

export default function DeliveryDashboard() {
    const { t, language } = useLanguage();
    const { orders, loading, loadOrders } = useOrders();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizedSequence, setOptimizedSequence] = useState<string[] | null>(null);
    const [depotAddress, setDepotAddress] = useState<any>(null);
    const [completingOrder, setCompletingOrder] = useState<any>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

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
            const clientNames = ordersWithoutAddress.map(o => o.client?.name || t.common.error).join(', ');
            alert(`${t.delivery.optimization_failed_title}\n\n${t.delivery.missing_address_error(clientNames)}`);
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
            setDepotAddress(data.depot);

            // Show success message with stats
            if (data.stats) {
                alert(t.delivery.optimization_success(data.stats.totalStops, data.stats.estimatedTimeSaved, data.stats.routeEfficiency));
            }
        } catch (error) {
            console.error('Optimization error:', error);
            alert(t.delivery.optimization_failed);
        } finally {
            setOptimizing(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

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
            alert(t.delivery.delivery_completed);
        } catch (err) {
            console.error(err);
            alert(t.delivery.delivery_error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 page-transition">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-gray-500 font-medium">{t.delivery.scanning}</p>
        </div>
    );

    // Only orders where ALL items are ready for delivery (not delivered yet)
    const readyOrders = orders.filter(o =>
        o.items.length > 0 &&
        o.items.every(i => i.status === 'ready_for_delivery') &&
        !o.items.every(i => i.status === 'delivered')
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 page-transition mb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{t.delivery.dashboard}</h2>
                    <p className="text-sm text-gray-500 font-medium">{t.delivery.optimization}</p>
                </div>
                <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none mr-2 whitespace-nowrap">{t.common.ready_for_delivery}</span>
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
                        <span className="font-bold text-gray-700 text-sm">{t.delivery.orders_selected}</span>
                    </div>
                    <button
                        onClick={handleOptimize}
                        disabled={selectedIds.length < 2 || optimizing}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 text-sm"
                    >
                        {optimizing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.delivery.analyzing_routes}</>
                        ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> {t.delivery.optimize}</>
                        )}
                    </button>
                </div>
            )}

            {/* Orders List */}
            <div className="grid gap-4">
                {/* Show depot as start point if route is optimized */}
                {optimizedSequence && optimizedSequence.length > 0 && depotAddress && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-5">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                                <Navigation className="w-4 h-4" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-green-800 text-sm uppercase tracking-wide">{t.delivery.start_point || 'Start Point'}</span>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                        {t.delivery.depot || 'Depot'}
                                    </span>
                                </div>
                                <p className="font-bold text-gray-800">{depotAddress.name}</p>
                                <div className="flex items-start text-xs text-gray-600 font-medium">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{depotAddress.street} {depotAddress.number}, {depotAddress.postalCode} {depotAddress.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                <div className="p-5 flex flex-col gap-4">
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
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded text-sm">{order.id}</span>
                                                <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                                                    {t.delivery.items_count(order.items.length)}
                                                </span>
                                            </div>
                                            <p className="font-bold text-gray-800 break-words">{order.client?.name || t.common.error}</p>
                                            <div className="flex items-start text-xs text-gray-400 font-medium">
                                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                <span className="break-words">
                                                    {order.client?.street && order.client?.number
                                                        ? `${order.client.street} ${order.client.number}, ${order.client.postalCode || ''} ${order.client.city || ''}`.trim()
                                                        : t.delivery.no_address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pl-14">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                {mounted ? new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-CH' : 'en-CH') : ''}
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
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCompletingOrder(order);
                                            }}
                                            className="text-xs bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-gray-200 flex items-center justify-center active:scale-95 w-full sm:w-auto"
                                        >
                                            {t.delivery.complete}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                
                {/* Show depot as end point if route is optimized */}
                {optimizedSequence && optimizedSequence.length > 0 && depotAddress && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-5">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-800 text-sm uppercase tracking-wide">{t.delivery.end_point || 'End Point'}</span>
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                        {t.delivery.return_to_depot || 'Return to Depot'}
                                    </span>
                                </div>
                                <p className="font-bold text-gray-800">{depotAddress.name}</p>
                                <div className="flex items-start text-xs text-gray-600 font-medium">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span>{depotAddress.street} {depotAddress.number}, {depotAddress.postalCode} {depotAddress.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {readyOrders.length === 0 && (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <Truck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">{t.delivery.no_orders}</p>
                </div>
            )}

            {completingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden fade-in">
                        <div className="bg-blue-600 p-6 text-white text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-1">{t.delivery.final_check}</h3>
                            <p className="text-xs text-blue-100 font-medium">{t.delivery.final_check_desc(completingOrder.id, completingOrder.client?.name || t.common.error)}</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t.delivery.receiver_signature}</p>
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
                                    {t.common.cancel}
                                </button>
                                <button
                                    onClick={handleCompleteDelivery}
                                    disabled={!signature || submitting}
                                    className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center active:scale-95"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t.delivery.confirm_delivered}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
