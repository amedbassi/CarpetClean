'use client';

import { useState, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Clock,
    CheckCircle2,
    DollarSign,
    Search,
    Filter,
    ArrowRight,
    ChevronRight,
    Users,
    Download,
    Eye,
    LinkIcon,
    User
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Order, CarpetItem } from '@/lib/types';

export default function DataReviewDashboard() {
    const { orders, loading } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [clientForm, setClientForm] = useState<any>(null);

    // Memoized Analytics
    const analytics = useMemo(() => {
        const totalItems = orders.flatMap(o => o.items);

        const statusCounts = totalItems.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const clientRevenue = orders.reduce((acc, order) => {
            const name = order.client?.name || 'Unknown';
            const value = order.items.reduce((sum, i) => sum + (i.cleaningCost || 0) + (i.repairCost || 0), 0);
            acc[name] = (acc[name] || 0) + value;
            return acc;
        }, {} as Record<string, number>);

        const topClients = Object.entries(clientRevenue)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            statusCounts,
            topClients,
            totalItemsCount: totalItems.length
        };
    }, [orders]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.client?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.client?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClient = clientFilter === 'all' || order.client?.name === clientFilter;

        if (statusFilter === 'all') return matchesSearch && matchesClient;

        if (['pending_approval', 'approved'].includes(statusFilter)) {
            const approvalStatus = statusFilter === 'pending_approval' ? 'pending' : 'approved';
            return matchesSearch && matchesClient && (order.cleaningApprovalStatus === approvalStatus || order.repairApprovalStatus === approvalStatus);
        }

        const hasStatus = order.items.some(item => item.status === statusFilter);
        return matchesSearch && matchesClient && hasStatus;
    });

    const uniqueClients = Array.from(new Set(orders.map(o => o.client?.name).filter(Boolean))) as string[];

    const exportToCSV = () => {
        const headers = ['Client', 'Order ID', 'Rug #', 'Individual Client', 'Item Status', 'Approval', 'Dimensions', 'Material', 'State', 'Cleaning Cost', 'Repair Cost', 'Total'];
        const rows: string[][] = [];

        orders.forEach(order => {
            order.items.forEach(item => {
                const cleaningCost = item.cleaningCost || 0;
                const repairCost = item.repairCost || 0;
                rows.push([
                    order.client?.name || 'Unknown',
                    order.id,
                    item.id,
                    item.individualClient || '',
                    item.status || 'pending',
                    (order.requiresCleaningApproval || order.requiresRepairApproval)
                        ? (order.cleaningApprovalStatus === 'approved' || order.repairApprovalStatus === 'approved' ? 'approved' :
                            order.cleaningApprovalStatus === 'pending' || order.repairApprovalStatus === 'pending' ? 'pending' : 'not_needed')
                        : 'N/A',
                    item.length && item.width ? `"${item.length}m x ${item.width}m"` : '',
                    item.material || '',
                    item.state || '',
                    cleaningCost.toFixed(2),
                    repairCost.toFixed(2),
                    (cleaningCost + repairCost).toFixed(2)
                ]);
            });
        });

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_detailed_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const copyApprovalLink = (orderId: string) => {
        const url = `${window.location.origin}/approve/${orderId}`;
        navigator.clipboard.writeText(url);
        alert('Approval link copied to clipboard!');
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
                // Reload orders to get updated client info
                window.location.reload();
            } else {
                alert('Failed to update client information');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating client information');
        }
    };

    if (loading) return <div className="p-20 text-center font-medium text-gray-400 animate-pulse">Generating insights...</div>;

    const clientGroups = filteredOrders.reduce((acc, order) => {
        const clientName = order.client?.name || 'Unknown Client';
        if (!acc[clientName]) acc[clientName] = [];
        acc[clientName].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 page-transition">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Business Insights</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Swiss Market Operations & Revenue Tracking</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all font-bold text-sm"
                >
                    <Download className="w-4 h-4 mr-2 text-blue-600" />
                    Export Data (CSV)
                </button>
            </div>

            {/* Managerial Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 premium-card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            Operations Pipeline
                        </h3>
                        <div className="bg-blue-50 px-2.5 py-1 rounded text-[10px] font-black text-blue-700 uppercase">
                            {analytics.totalItemsCount} Rugs Total
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-5">
                        {['pending', 'measured', 'ready_for_delivery', 'delivered'].map(status => {
                            const count = analytics.statusCounts[status] || 0;
                            const percentage = (count / analytics.totalItemsCount) * 100;
                            const colorClass =
                                status === 'delivered' ? 'bg-gray-200' :
                                    status === 'ready_for_delivery' ? 'bg-green-500' :
                                        status === 'measured' ? 'bg-blue-500' : 'bg-yellow-400';

                            return (
                                <div key={status} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{status.replace(/_/g, ' ')}</span>
                                        <span className="text-xs font-bold text-gray-900">{count} <span className="text-gray-300 font-medium ml-1">({percentage.toFixed(0)}%)</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colorClass} transition-all duration-1000 group-hover:brightness-110`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-gray-900 text-white p-7 rounded-2xl shadow-xl flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Top Swiss Accounts</h3>
                    <div className="flex-1 space-y-5 relative z-10">
                        {analytics.topClients.map(([name, revenue], idx) => (
                            <div key={name} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-gray-600 font-mono w-4">{idx + 1}</span>
                                    <span className="text-sm font-bold text-gray-200 group-hover/item:text-white transition-colors truncate max-w-[280px]">{name}</span>
                                </div>
                                <span className="text-sm font-black text-blue-400 group-hover/item:scale-105 transition-transform">CHF {revenue.toLocaleString()}</span>
                            </div>
                        ))}
                        {analytics.topClients.length === 0 && (
                            <div className="h-full flex items-center justify-center text-gray-600 text-xs font-bold uppercase tracking-widest">No Revenue Data</div>
                        )}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>Currency</span>
                        <span className="text-white">Swiss Franc (CHF)</span>
                    </div>
                </div>
            </div>

            {/* Standard Data View */}
            <div className="space-y-4">
                <div className="premium-card p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border-none rounded-lg focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Filter by Order ID or Client..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Waiting</option>
                            <option value="measured">Measured</option>
                            <option value="ready_for_delivery">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="pending_approval">Pending Approval</option>
                            <option value="approved">Approved</option>
                        </select>
                    </div>
                </div>

                {Object.entries(clientGroups).map(([clientName, clientOrders]) => (
                    <div key={clientName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="bg-white px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">{clientName}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {clientOrders.length} Order{clientOrders.length > 1 ? 's' : ''}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                        {clientOrders.reduce((sum, o) => sum + o.items.length, 0)} Items
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const client = clientOrders[0].client;
                                        if (client) {
                                            setEditingClient(client);
                                            setClientForm(client);
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {clientOrders.map(order => (
                                <div key={order.id} className="p-4 bg-white">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">{order.id}</span>
                                            {(order.requiresCleaningApproval || order.requiresRepairApproval) && (
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${(order.cleaningApprovalStatus === 'approved' || order.repairApprovalStatus === 'approved')
                                                        ? 'bg-green-50 text-green-700 border-green-100'
                                                        : 'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}>
                                                    {order.cleaningApprovalStatus === 'approved' ? 'Approved' : 'Pending'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Item</th>
                                                    <th className="px-4 py-3 text-left">Status</th>
                                                    <th className="px-4 py-3 text-right">Cleaning (CHF)</th>
                                                    <th className="px-4 py-3 text-right">Repair (CHF)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {order.items.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900">#{item.id}</span>
                                                                    {item.individualClient && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                                                                            <User className="w-2.5 h-2.5" />
                                                                            {item.individualClient}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 font-medium">{item.material || 'Carpet'} • {item.state}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-[10px] font-black uppercase text-gray-500">{item.status.replace('_', ' ')}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-900">{item.cleaningCost?.toFixed(2) || '0.00'}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-orange-500">{item.repairCost?.toFixed(2) || '0.00'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
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
