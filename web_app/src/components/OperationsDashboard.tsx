'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ruler, CheckCircle, Package, Truck, Mail, Edit, Info, Hash } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Client, Order } from '@/lib/types';

export default function OperationsDashboard() {
    const { orders, loading, loadOrders, updateItemStatus } = useOrders();
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientForm, setClientForm] = useState<Client | null>(null);

    const handleStatusUpdate = async (orderId: string, itemId: string, newStatus: string) => {
        const success = await updateItemStatus(orderId, itemId, newStatus);
        if (!success) alert('Failed to update status');
    };

    const toggleApprovalRequired = async (orderId: string, currentVal: boolean) => {
        try {
            const response = await fetch('/api/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    requiresCleaningApproval: !currentVal,
                    requiresRepairApproval: !currentVal,
                    cleaningApprovalStatus: !currentVal ? 'pending' : 'not_needed',
                    repairApprovalStatus: !currentVal ? 'pending' : 'not_needed'
                }),
            });

            if (response.ok) {
                loadOrders();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const sendApprovalRequest = async (order: Order) => {
        const allMeasured = order.items.every(item => item.status === 'measured' || item.status === 'ready_for_delivery' || item.status === 'delivered');
        if (!allMeasured) {
            alert('All carpets must be measured before sending the cleaning estimate for approval.');
            return;
        }

        if (!order.client?.email && !order.client?.phone) {
            alert('Client must have email or phone number to send the cleaning estimate.');
            if (order.client) {
                setEditingClient(order.client);
                setClientForm(order.client);
            }
            return;
        }

        const approvalLink = `${window.location.origin}/approve/${order.id}`;
        navigator.clipboard.writeText(approvalLink);
        alert(`Approval link copied to clipboard for ${order.client.name}!`);
    };

    const saveClientInfo = async () => {
        if (!clientForm) return;

        try {
            const response = await fetch(`/api/clients/${clientForm.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientForm),
            });

            if (response.ok) {
                setEditingClient(null);
                setClientForm(null);
                loadOrders();
                alert('Client information updated!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-20 text-center font-medium text-gray-400 animate-pulse">Loading operations...</div>;

    const pendingCount = orders.flatMap(o => o.items).filter(i => !i.status || i.status === 'pending').length;
    const measuredCount = orders.flatMap(o => o.items).filter(i => i.status === 'measured').length;
    const readyCount = orders.flatMap(o => o.items).filter(i => i.status === 'ready_for_delivery').length;

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 page-transition">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Operations Dashboard</h2>
                    <p className="text-sm text-gray-500 font-medium">Measurement & Status Management</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 text-center">
                        <span className="block text-[10px] font-black text-yellow-600 uppercase tracking-widest">Pending</span>
                        <span className="text-lg font-black text-yellow-800 leading-none">{pendingCount}</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-center">
                        <span className="block text-[10px] font-black text-blue-600 uppercase tracking-widest">Measured</span>
                        <span className="text-lg font-black text-blue-800 leading-none">{measuredCount}</span>
                    </div>
                    <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 text-center">
                        <span className="block text-[10px] font-black text-green-600 uppercase tracking-widest">Ready</span>
                        <span className="text-lg font-black text-green-800 leading-none">{readyCount}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono font-bold text-gray-900">{order.id}</span>
                                </div>
                                <div className="h-4 w-px bg-gray-200"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700">{order.client?.name || 'Unknown Client'}</span>
                                    <button
                                        onClick={() => { if (order.client) { setEditingClient(order.client); setClientForm(order.client); } }}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={order.requiresCleaningApproval || order.requiresRepairApproval}
                                        onChange={() => toggleApprovalRequired(order.id, order.requiresCleaningApproval || order.requiresRepairApproval)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Approval Flow
                                </label>

                                {(order.requiresCleaningApproval || order.requiresRepairApproval) && (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${(order.cleaningApprovalStatus === 'approved' || order.repairApprovalStatus === 'approved')
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {order.cleaningApprovalStatus === 'approved' ? 'Approved' : 'Pending'}
                                        </span>
                                        <button
                                            onClick={() => sendApprovalRequest(order)}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            title="Send/Copy Approval Link"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {order.items.map(item => (
                                <div key={item.id} className="p-5 hover:bg-gray-50/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-gray-400 text-sm">#{item.id}</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.status === 'measured' ? 'bg-blue-50 text-blue-600' :
                                                item.status === 'ready_for_delivery' ? 'bg-green-50 text-green-600' :
                                                    item.status === 'delivered' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-50 text-yellow-600'
                                                }`}>
                                                {item.status || 'pending'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {item.status === 'measured' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, item.id, 'ready_for_delivery')}
                                                    disabled={(order.requiresCleaningApproval || order.requiresRepairApproval) && (order.cleaningApprovalStatus !== 'approved')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-green-100 disabled:opacity-50 disabled:grayscale"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Mark Ready
                                                </button>
                                            )}
                                            {item.status === 'ready_for_delivery' && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold">
                                                    <Truck className="w-3 h-3" />
                                                    Ready for Exit
                                                </div>
                                            )}
                                            <Link
                                                href={`/operations/${order.id}/${item.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Ruler className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Client Modal */}
            {editingClient && clientForm && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl fade-in">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-600" />
                            Client Master Record
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    type="text"
                                    value={clientForm.name}
                                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={clientForm.phone || ''}
                                        onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                                    <input
                                        type="email"
                                        value={clientForm.email || ''}
                                        onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 pt-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Address Details</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        placeholder="Street"
                                        className="col-span-2 w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                                        value={clientForm.street || ''}
                                        onChange={e => setClientForm({ ...clientForm, street: e.target.value })}
                                    />
                                    <input
                                        placeholder="No."
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                                        value={clientForm.number || ''}
                                        onChange={e => setClientForm({ ...clientForm, number: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <input
                                        placeholder="Zip"
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                                        value={clientForm.postalCode || ''}
                                        onChange={e => setClientForm({ ...clientForm, postalCode: e.target.value })}
                                    />
                                    <input
                                        placeholder="City"
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                                        value={clientForm.city || ''}
                                        onChange={e => setClientForm({ ...clientForm, city: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setEditingClient(null)}
                                className="flex-1 px-4 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveClientInfo}
                                className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                Update Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
