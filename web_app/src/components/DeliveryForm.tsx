'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, Minus, CheckCircle, Receipt, Trash2 } from 'lucide-react';
import SignaturePad from './SignaturePad';

interface CarpetItem {
    id: string;
}

export default function DeliveryForm() {
    const [formData, setFormData] = useState({
        id: '',
        clientName: '',
        phone: '',
        email: '',
        address: '',
        items: [{ id: '1' }] as CarpetItem[], // Initialize with one item
        receipt: null as File | null,
        signature: null as string | null,
    });
    const [error, setError] = useState<string | null>(null);

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Fetch next sequential order ID
        fetch('/api/orders/next-id')
            .then(res => res.json())
            .then(data => {
                if (data.nextId) {
                    setFormData(prev => ({ ...prev, id: data.nextId }));
                } else {
                    setError('Failed to generate Order ID');
                }
            })
            .catch(err => {
                console.error('Error fetching next order ID:', err);
                setError('Failed to load Order ID. Please refresh.');
            });
    }, []); // Empty dependency array - only run on mount

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addItem = () => {
        const newItem: CarpetItem = {
            id: `${formData.items.length + 1}`,
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (id: string) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, receipt: e.target.files![0] }));
        }
    };

    const handleSignature = (signatureData: string | null) => {
        setFormData((prev) => ({ ...prev, signature: signatureData }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to local storage API
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    // Mocking file upload for now, just sending name
                    receipt: formData.receipt ? formData.receipt.name : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to save order');

            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('Error saving order');
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-800">Order Received!</h2>
                <p className="text-xl font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded">{formData.id}</p>
                <div className="text-left w-full max-w-xs bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Items to Label:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {formData.items.map(item => (
                            <li key={item.id} className="font-mono text-sm">{item.id}</li>
                        ))}
                    </ul>
                </div>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setFormData({
                            id: '',
                            clientName: '',
                            phone: '',
                            email: '',
                            address: '',
                            items: [{ id: '1' }],
                            receipt: null,
                            signature: null,
                        });
                    }}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Add New Order
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">New Order</h2>
                <span className="font-mono text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {formData.id || 'Loading...'}
                </span>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Client Details</h3>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Client Name</label>
                    <input
                        type="text"
                        id="clientName"
                        name="clientName"
                        required
                        value={formData.clientName}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1 234 567 890 (Optional)"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john@example.com (Optional)"
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main St, Apt 4B (Optional)"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-700">Items Received</h3>
                    <button type="button" onClick={addItem} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <Plus className="h-4 w-4 mr-1" /> Add Rug
                    </button>
                </div>

                <div className="space-y-2">
                    {formData.items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span className="font-mono font-medium text-gray-700">{item.id}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={formData.items.length === 1}
                                className="text-red-500 hover:text-red-700 disabled:opacity-30"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receipt (Optional)</label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="receipt-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Receipt className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> receipt</p>
                                <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 5MB)</p>
                            </div>
                            <input id="receipt-upload" type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                        </label>
                    </div>
                    {formData.receipt && (
                        <p className="mt-2 text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {formData.receipt.name} attached
                        </p>
                    )}
                </div>

                <SignaturePad onEnd={handleSignature} />
            </div>

            <button
                type="submit"
                disabled={!formData.signature || !formData.id}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Submit Order
            </button>
            {error && <p className="text-red-500 text-center text-sm mt-2 font-bold">{error}</p>}
        </form>
    );
}
