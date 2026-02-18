'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, Filter, Link as LinkIcon, CheckCircle, Clock } from 'lucide-react';

interface CarpetItem {
    id: string;
    status: string;
    state?: string;
    length?: string;
    width?: string;
    material?: string;
    cleaningCost?: number;
    repairCost?: number;
    repairDescription?: string;
}

interface Order {
    id: string;
    createdAt: string;
    clientName: string;
    phone?: string;
    email?: string;
    address?: string;
    requiresApproval: boolean;
    approvalStatus: 'not_needed' | 'pending' | 'approved' | 'rejected';
    items: CarpetItem[];
}

export default function DataReviewDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;

        // If filtering by approval status
        if (['pending_approval', 'approved'].includes(statusFilter)) {
            const approvalStatus = statusFilter === 'pending_approval' ? 'pending' : 'approved';
            return matchesSearch && order.approvalStatus === approvalStatus;
        }

        const hasStatus = order.items.some(item => item.status === statusFilter);
        return matchesSearch && hasStatus;
    });

    const exportToCSV = () => {
        const headers = ['Client', 'Order ID', 'Rug #', 'Item Status', 'Approval', 'Dimensions', 'Material', 'State', 'Cleaning Cost', 'Repair Cost', 'Total'];
        const rows: string[][] = [];

        orders.forEach(order => {
            order.items.forEach(item => {
                const cleaningCost = item.cleaningCost || 0;
                const repairCost = item.repairCost || 0;
                rows.push([
                    order.clientName,
                    order.id,
                    item.id,
                    item.status || 'pending',
                    order.requiresApproval ? order.approvalStatus : 'N/A',
                    item.length && item.width ? `${item.length}m × ${item.width}m` : '',
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

    if (loading) return <div className="p-8 text-center">Loading data...</div>;

    const clientGroups = filteredOrders.reduce((acc, order) => {
        const clientName = order.clientName;
        if (!acc[clientName]) {
            acc[clientName] = [];
        }
        acc[clientName].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Data Review Dashboard</h2>
                <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-600">Total Orders</h3>
                    <p className="text-3xl font-bold text-blue-800">{orders.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h3 className="text-sm font-medium text-orange-600">Waiting Approval</h3>
                    <p className="text-3xl font-bold text-orange-800">
                        {orders.filter(o => o.requiresApproval && o.approvalStatus === 'pending').length}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-sm font-medium text-green-600">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-800">
                        ${orders.flatMap(o => o.items).reduce((sum, i) => sum + (i.cleaningCost || 0) + (i.repairCost || 0), 0).toFixed(0)}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="text-sm font-medium text-purple-600">Items Delivered</h3>
                    <p className="text-3xl font-bold text-purple-800">
                        {orders.flatMap(o => o.items).filter(i => i.status === 'delivered').length}
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Client Name, Phone, or Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="all">All Items</option>
                            <option value="pending_approval">Waiting Approval</option>
                            <option value="approved">Approval Received</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Hierarchical Data View */}
            <div className="space-y-4">
                {Object.entries(clientGroups).map(([clientName, clientOrders]) => (
                    <div key={clientName} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="bg-gray-800 px-6 py-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">{clientName}</h3>
                                    <p className="text-sm opacity-70">
                                        {clientOrders.length} order{clientOrders.length > 1 ? 's' : ''} • {' '}
                                        {clientOrders.reduce((sum, o) => sum + o.items.length, 0)} rug{clientOrders.reduce((sum, o) => sum + o.items.length, 0) > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="text-right text-sm opacity-70">
                                    {clientOrders[0].phone && <div>{clientOrders[0].phone}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="divide-y">
                            {clientOrders.map(order => (
                                <div key={order.id} className="bg-gray-50">
                                    <div className="px-6 py-3 bg-gray-100 border-b flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="font-mono font-bold text-gray-900">{order.id}</span>
                                            {order.requiresApproval && (
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                            order.approvalStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.approvalStatus}
                                                    </span>
                                                    {order.approvalStatus === 'pending' && (
                                                        <button
                                                            onClick={() => copyApprovalLink(order.id)}
                                                            className="text-blue-600 hover:text-blue-800 flex items-center text-[10px] font-bold"
                                                        >
                                                            <LinkIcon className="w-3 h-3 mr-1" />
                                                            COPY APPROVAL LINK
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Order Details
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-200 text-xs">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Rug #</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Size</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Material</th>
                                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Cleaning</th>
                                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Repair</th>
                                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {order.items.map(item => {
                                                    const cleaningCost = item.cleaningCost || 0;
                                                    const repairCost = item.repairCost || 0;
                                                    const total = cleaningCost + repairCost;

                                                    return (
                                                        <tr key={item.id} className="hover:bg-gray-100 transition">
                                                            <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900 leading-none">#{item.id}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition ${item.status === 'delivered' ? 'bg-gray-100 text-gray-700' :
                                                                        item.status === 'ready_for_delivery' ? 'bg-green-100 text-green-700 font-bold' :
                                                                            item.status === 'measured' ? 'bg-blue-100 text-blue-700' :
                                                                                'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {item.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                                {item.length && item.width ? `${item.length}x${item.width}` : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-gray-600">{item.material || '-'}</td>
                                                            <td className="px-4 py-3 text-xs text-right font-medium text-green-600">
                                                                {cleaningCost > 0 ? `$${cleaningCost.toFixed(2)}` : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-right font-medium text-orange-600">
                                                                {repairCost > 0 ? `$${repairCost.toFixed(2)}` : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-right font-bold text-gray-900">
                                                                {total > 0 ? `$${total.toFixed(2)}` : '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-white font-bold border-t">
                                                    <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-gray-500 uppercase tracking-wider">Order Total:</td>
                                                    <td className="px-4 py-2 text-xs text-right text-green-700">
                                                        ${order.items.reduce((sum, item) => sum + (item.cleaningCost || 0), 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-xs text-right text-orange-700">
                                                        ${order.items.reduce((sum, item) => sum + (item.repairCost || 0), 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                                                        ${order.items.reduce((sum, item) => sum + (item.cleaningCost || 0) + (item.repairCost || 0), 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal remains largely same but updated with direct repair fields */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Order Details - {selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500">Client:</span> {selectedOrder.clientName}</div>
                                <div className="text-right"><span className="text-gray-500">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                <div className="col-span-2 border-t pt-2 mt-2">
                                    <span className="text-gray-500">Approval:</span> {selectedOrder.approvalStatus}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} className="border p-4 rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">Rug #{item.id}</span>
                                            <span className="text-[10px] uppercase font-bold">{item.status}</span>
                                        </div>
                                        <div className="text-xs space-y-1">
                                            <p><span className="text-gray-500">Type:</span> {item.material} - {item.state}</p>
                                            <p><span className="text-gray-500">Size:</span> {item.length}x{item.width}</p>
                                            <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                                <span>Cleaning: ${item.cleaningCost?.toFixed(2)}</span>
                                                <span className="text-orange-600">Repair: ${item.repairCost?.toFixed(2)}</span>
                                            </div>
                                            {item.repairDescription && <p className="text-[10px] italic text-gray-500">{item.repairDescription}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
