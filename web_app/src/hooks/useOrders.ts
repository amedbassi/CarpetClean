import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/lib/types';

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('useOrders error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const updateItemStatus = async (orderId: string, itemId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/operations/update-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, itemId, status: newStatus }),
            });

            if (response.ok) {
                await loadOrders();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Update status error:', err);
            return false;
        }
    };

    return { orders, loading, error, loadOrders, updateItemStatus };
}
