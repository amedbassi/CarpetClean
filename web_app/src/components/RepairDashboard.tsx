'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Hammer, CheckCircle, AlertTriangle, Mail, Edit } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Client, Order, CarpetItem } from '@/lib/types';

interface RepairOrder extends Order {
    repairItems: CarpetItem[];
}

export default function RepairDashboard() {
    const { orders, loading } = useOrders();
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientForm, setClientForm] = useState<Client | null>(null);

    const sendRepairApprovalRequest = async (order: RepairOrder) => {
        // Check if any items have repair costs
        const hasRepairItems = order.repairItems.some(item => (item.repairCost || 0) > 0);
        if (!hasRepairItems) {
            alert('No repair estimates found. Please add repair costs to items that need repair.');
            return;
        }

        if (!order.client?.email) {
            alert('Client must have an email address to send the repair estimate.');
            if (order.client) {
                setEditingClient(order.client);
                setClientForm(order.client);
            }
            return;
        }

        // Copy link to clipboard first (as backup)
        const approvalLink = `${window.location.origin}/approve/${order.id}`;
        try {
            await navigator.clipboard.writeText(approvalLink);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }

        // Update the repair approval status to pending
        try {
            const response = await fetch('/api/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    repairApprovalStatus: 'pending'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Send email
            const emailResponse = await fetch('/api/send-estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    estimateType: 'repair'
                }),
            });

            if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                throw new Error(errorData.error || 'Failed to send email');
            }

            alert(`✅ Repair estimate sent successfully!\n\nEmail sent to: ${order.client.email}\n\n📋 Link also copied to clipboard as backup.`);
            window.location.reload();
        } catch (error) {
            console.error('Error sending repair estimate:', error);
            alert(`⚠️ Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}\n\n📋 However, the approval link has been copied to your clipboard.\n\nYou can manually send it to: ${order.client.email}`);
            window.location.reload();
        }
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
                window.location.reload();
            } else {
                alert('Failed to update client information');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating client information');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading repair requests...</div>;

    // Group repair items by order (exclude fully delivered orders)
    const repairOrdersMap = new Map<string, RepairOrder>();
    orders
        .filter(order => !order.items.every(item => item.status === 'delivered'))
        .forEach(order => {
            const repairItems = order.items.filter(item =>
                ['Worn', 'Damaged'].includes(item.state || '') ||
                ['repair_needed', 'repair_estimated'].includes(item.status || '')
            );
            if (repairItems.length > 0) {
                repairOrdersMap.set(order.id, {
                    ...order,
                    repairItems
                });
            }
        });

    const repairOrders = Array.from(repairOrdersMap.values());

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 page-transition">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Hammer className="w-6 h-6 mr-2 text-orange-600" />
                    Repair Team Dashboard
                </h2>
                <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex items-center">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest leading-none mr-2">Orders</span>
                    <span className="text-lg font-black text-orange-800 leading-none">{repairOrders.length}</span>
                </div>
            </div>

            <div className="space-y-4">
                {repairOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-6">
                                <span className="font-mono font-bold text-gray-900">{order.id}</span>
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
                                <div className="flex items-center gap-2">
                                    {/* Only show status badge if estimate has been sent (not "not_needed") */}
                                    {order.repairApprovalStatus !== 'not_needed' && (
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                            order.repairApprovalStatus === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : order.repairApprovalStatus === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {order.repairApprovalStatus === 'approved'
                                                ? 'Approved'
                                                : order.repairApprovalStatus === 'rejected'
                                                ? 'Rejected'
                                                : 'Pending'}
                                        </span>
                                    )}
                                    
                                    <button
                                        onClick={() => sendRepairApprovalRequest(order)}
                                        disabled={
                                            !order.repairItems.some(item => (item.repairCost || 0) > 0) ||
                                            (order.repairApprovalStatus === 'pending' || order.repairApprovalStatus === 'approved')
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm text-xs font-bold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                                        title={
                                            !order.repairItems.some(item => (item.repairCost || 0) > 0)
                                                ? "Add repair estimates first"
                                                : (order.repairApprovalStatus === 'pending' || order.repairApprovalStatus === 'approved')
                                                ? "Estimate already sent"
                                                : "Send Repair Estimate"
                                        }
                                    >
                                        <Mail className="w-3 h-3" />
                                        Send Repair
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {order.repairItems.map(item => (
                                <div key={item.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-mono font-bold text-gray-900 px-2 py-1 bg-gray-100 rounded text-sm">#{item.id}</span>
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
                                            {item.repairDescription && (
                                                <p className="text-xs text-gray-600 mt-1">{item.repairDescription}</p>
                                            )}
                                        </div>

                                        <Link
                                            href={`/repair/${order.id}/${item.id}`}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-100 transition-all active:scale-95"
                                        >
                                            {(item.repairCost || 0) > 0 ? 'Edit Estimate' : 'Create Estimate'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {repairOrders.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                        <Hammer className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="font-medium">No rugs currently require repair.</p>
                    </div>
                )}
            </div>

            {/* Client Details Modal */}
            {editingClient && clientForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setEditingClient(null)}>
                    <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Client Information</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={clientForm.name}
                                    onChange={e => setClientForm({...clientForm, name: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    value={clientForm.phone || ''}
                                    onChange={e => setClientForm({...clientForm, phone: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={clientForm.email || ''}
                                    onChange={e => setClientForm({...clientForm, email: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Street</label>
                                    <input
                                        type="text"
                                        value={clientForm.street || ''}
                                        onChange={e => setClientForm({...clientForm, street: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Number</label>
                                    <input
                                        type="text"
                                        value={clientForm.number || ''}
                                        onChange={e => setClientForm({...clientForm, number: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input
                                        type="text"
                                        value={clientForm.postalCode || ''}
                                        onChange={e => setClientForm({...clientForm, postalCode: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        value={clientForm.city || ''}
                                        onChange={e => setClientForm({...clientForm, city: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    value={clientForm.country || ''}
                                    onChange={e => setClientForm({...clientForm, country: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={saveClientInfo}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setEditingClient(null);
                                    setClientForm(null);
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
