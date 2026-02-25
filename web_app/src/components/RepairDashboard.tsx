'use client';

import Link from 'next/link';
import { Hammer, CheckCircle, AlertTriangle } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

export default function RepairDashboard() {
    const { orders, loading } = useOrders();

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading repair requests...</div>;

    // Filter items that need repair: Only Worn and Damaged items
    const repairItems = orders.flatMap(order =>
        order.items
            .filter(item =>
                ['Worn', 'Damaged'].includes(item.state || '') ||
                ['repair_needed', 'repair_estimated'].includes(item.status || '')
            )
            .map(item => ({ ...item, orderId: order.id, clientName: order.client?.name || 'Unknown' }))
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 page-transition">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Hammer className="w-6 h-6 mr-2 text-orange-600" />
                    Repair Team Dashboard
                </h2>
                <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex items-center">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest leading-none mr-2">Pending</span>
                    <span className="text-lg font-black text-orange-800 leading-none">{repairItems.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {repairItems.map(item => (
                        <div key={`${item.orderId}-${item.id}`} className="p-5 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono font-bold text-gray-900 px-2 py-1 bg-gray-100 rounded text-sm">#{item.id}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Order: {item.orderId}
                                    </span>
                                </div>
                                {item.repairCost && item.repairCost > 0 ? (
                                    <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 flex items-center uppercase tracking-wider">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Estimate Ready (CHF {item.repairCost.toFixed(2)})
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 flex items-center uppercase tracking-wider animate-pulse">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Needs Estimate
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Condition:</span>
                                        <span className={`text-xs font-bold ${item.state === 'Damaged' ? 'text-red-500' : 'text-orange-500'}`}>{item.state}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">{item.clientName}</p>
                                </div>

                                <Link
                                    href={`/repair/${item.orderId}/${item.id}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-100 transition-all active:scale-95"
                                >
                                    {(item.repairCost || 0) > 0 ? 'Edit Estimate' : 'Create Estimate'}
                                </Link>
                            </div>
                        </div>
                    ))}

                    {repairItems.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <Hammer className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="font-medium">No rugs currently require repair.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
