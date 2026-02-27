'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, AlertCircle, ShieldCheck, Ruler, Hammer } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface CarpetItem {
    id: string;
    status: string;
    length?: string;
    width?: string;
    material?: string;
    state?: string;
    cleaningCost?: number;
    repairCost?: number;
    repairDescription?: string;
}

interface Order {
    id: string;
    client: {
        name: string;
    };
    items: CarpetItem[];
    cleaningApprovalStatus: 'not_needed' | 'pending' | 'approved' | 'rejected';
    repairApprovalStatus: 'not_needed' | 'pending' | 'approved' | 'rejected';
}

export default function ClientApprovalPage() {
    const { t } = useLanguage();
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleApproval = async (status: 'approved' | 'rejected') => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: id,
                    cleaningApprovalStatus: status,
                    repairApprovalStatus: status,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setOrder(prev => prev ? {
                    ...prev,
                    cleaningApprovalStatus: status,
                    repairApprovalStatus: status
                } : null);
            } else {
                alert(t.approval.submission_failed);
            }
        } catch (error) {
            console.error(error);
            alert(t.approval.error_msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t.approval.loading}</p>
            </div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">{t.approval.not_found_title}</h2>
                <p className="text-gray-600 mt-2">{t.approval.not_found_desc}</p>
            </div>
        </div>
    );

    if (submitted || order.cleaningApprovalStatus === 'approved' || order.repairApprovalStatus === 'approved') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100 max-w-md w-full text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">{t.approval.approved_title}</h2>
                <p className="text-gray-600 mt-2">{t.approval.approved_desc(order.client.name)}</p>
                <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-gray-500">{t.approval.confirmation_sent}</p>
                </div>
            </div>
        </div>
    );

    const cleaningTotal = order.items.reduce((sum, item) => sum + (item.cleaningCost || 0), 0);
    const repairTotal = order.items.reduce((sum, item) => sum + (item.repairCost || 0), 0);
    const grandTotal = cleaningTotal + repairTotal;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-blue-600 text-white py-8 px-4 text-center shadow-md">
                <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h1 className="text-2xl font-bold">{t.approval.header_title}</h1>
                <p className="text-blue-100 mt-1 opacity-90">{t.approval.order_id}: {order.id}</p>
            </div>

            <div className="max-w-xl mx-auto -mt-4 px-4">
                <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{t.approval.client_details}</h2>
                    <p className="text-gray-700 font-medium">{order.client.name}</p>
                    <p className="text-sm text-gray-500">{t.approval.inspection_intro}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center px-1">
                        <Package className="w-5 h-5 mr-2 text-blue-600" />
                        {t.approval.summary_title}
                    </h2>

                    {order.items.map((item, idx) => (
                        <div key={item.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.approval.rug_number(idx + 1)}</span>
                                <span className="font-mono text-xs text-gray-400">{item.id}</span>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Ruler className="w-4 h-4 mr-2 opacity-70" />
                                        <span>{item.length} x {item.width} {t.approval.unit}</span>
                                    </div>
                                    <div className="text-gray-600 text-right">
                                        <span className="font-medium">{item.material}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">{t.approval.cleaning_service}</span>
                                        <span className="font-semibold text-gray-800">CHF {(item.cleaningCost || 0).toFixed(2)}</span>
                                    </div>

                                    {item.repairCost && item.repairCost > 0 && (
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <span className="flex items-center font-medium text-orange-800">
                                                    <Hammer className="w-3.5 h-3.5 mr-1.5" />
                                                    {t.approval.repair_service}
                                                </span>
                                                <span className="font-bold text-orange-900">CHF {item.repairCost.toFixed(2)}</span>
                                            </div>
                                            <p className="text-[11px] text-orange-700 italic leading-relaxed">
                                                {item.repairDescription}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals Section */}
                <div className="bg-white rounded-xl shadow-lg border p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{t.approval.order_total}</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>{t.approval.total_cleaning}</span>
                            <span>CHF {cleaningTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{t.approval.total_repairs}</span>
                            <span>CHF {repairTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 text-xl font-black text-blue-700">
                            <span>{t.approval.grand_total}</span>
                            <span>CHF {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => handleApproval('approved')}
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-50"
                    >
                        {submitting ? t.approval.submitting : (
                            <>
                                <CheckCircle className="w-6 h-6 mr-2" />
                                {t.approval.approve_button}
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleApproval('rejected')}
                        disabled={submitting}
                        className="w-full bg-white text-gray-500 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
                    >
                        {t.approval.reject_button}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2 px-4 italic leading-relaxed">
                        {t.approval.terms}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Dummy Icon for Package
function Package({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    );
}
