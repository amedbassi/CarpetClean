'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle, Receipt, Trash2, Search, ScanLine, User, X, Loader2 } from 'lucide-react';
import SignaturePad from './SignaturePad';

interface CarpetItem {
    id: string;
    individualClient?: string;
}

interface Client {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    street: string | null;
    number: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
}

interface OcrEntry {
    name: string;
    rugCount: number;
}

interface ScannedReceipt {
    file: File;
    scanning: boolean;
    error: string | null;
    rawText: string;
    entries: OcrEntry[];
}

/** Build auto-assigned individualClient per item index from all scanned receipts */
function buildAssignments(receipts: ScannedReceipt[]): string[] {
    const assignments: string[] = [];
    for (const receipt of receipts) {
        for (const entry of receipt.entries) {
            for (let i = 0; i < entry.rugCount; i++) {
                assignments.push(entry.name);
            }
        }
    }
    return assignments;
}

export default function DeliveryForm() {
    const [formData, setFormData] = useState({
        id: '',
        clientId: '',
        clientName: '',
        phone: '',
        email: '',
        street: '',
        number: '',
        postalCode: '',
        city: '',
        country: '',
        items: [{ id: '1' }] as CarpetItem[],
        signature: null as string | null,
    });
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isNewClient, setIsNewClient] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Multi-receipt state
    const [scannedReceipts, setScannedReceipts] = useState<ScannedReceipt[]>([]);

    const fetchNextOrderId = () => {
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
    };

    useEffect(() => {
        fetchNextOrderId();
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setClients(data); })
            .catch(err => console.error('Error fetching clients:', err));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Re-apply auto-assign whenever scanned receipts change
    useEffect(() => {
        const assignments = buildAssignments(scannedReceipts);
        // Auto-expand items list if total rug count from OCR > current count
        const totalFromOcr = assignments.length;
        setFormData(prev => {
            const currentCount = prev.items.length;
            const targetCount = Math.max(currentCount, totalFromOcr);
            const newItems: CarpetItem[] = Array.from({ length: targetCount }, (_, i) => ({
                id: `${i + 1}`,
                individualClient: assignments[i] || prev.items[i]?.individualClient,
            }));
            return { ...prev, items: newItems };
        });
    }, [scannedReceipts]);

    const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, clientName: value, clientId: '' }));
        setIsNewClient(true);
        if (value.trim().length > 0) {
            const filtered = clients.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredClients(filtered);
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }
    };

    const selectClient = (client: Client) => {
        setFormData(prev => ({
            ...prev,
            clientId: client.id,
            clientName: client.name,
            phone: client.phone || '',
            email: client.email || '',
            street: client.street || '',
            number: client.number || '',
            postalCode: client.postalCode || '',
            city: client.city || '',
            country: client.country || '',
        }));
        setIsNewClient(false);
        setShowDropdown(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: `${prev.items.length + 1}` }],
        }));
    };

    const removeItem = (id: string) => {
        if (formData.items.length > 1) {
            setFormData(prev => {
                const filtered = prev.items.filter(item => item.id !== id);
                // Re-number
                const renumbered = filtered.map((item, i) => ({ ...item, id: `${i + 1}` }));
                return { ...prev, items: renumbered };
            });
        }
    };

    const handleSignature = (signatureData: string | null) => {
        setFormData(prev => ({ ...prev, signature: signatureData }));
    };

    /** Scan a new receipt image via OCR */
    const handleReceiptAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so same file can be re-added
        e.target.value = '';

        const idx = scannedReceipts.length;
        const newEntry: ScannedReceipt = { file, scanning: true, error: null, rawText: '', entries: [] };
        setScannedReceipts(prev => [...prev, newEntry]);

        try {
            const fd = new FormData();
            fd.append('receipt', file);
            const res = await fetch('/api/ocr-receipt', { method: 'POST', body: fd });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'OCR failed');

            setScannedReceipts(prev => {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], scanning: false, rawText: data.rawText, entries: data.entries };
                return updated;
            });
        } catch (err) {
            setScannedReceipts(prev => {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], scanning: false, error: (err as Error).message };
                return updated;
            });
        }
    };

    const removeReceipt = (idx: number) => {
        setScannedReceipts(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let clientId = formData.clientId;
            if (isNewClient || !clientId) {
                const clientResponse = await fetch('/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.clientName,
                        phone: formData.phone || null,
                        email: formData.email || null,
                        street: formData.street || null,
                        number: formData.number || null,
                        postalCode: formData.postalCode || null,
                        city: formData.city || null,
                        country: formData.country || null,
                    }),
                });
                if (!clientResponse.ok) {
                    const errorData = await clientResponse.json();
                    throw new Error(errorData.message || 'Failed to create client');
                }
                const clientData = await clientResponse.json();
                clientId = clientData.client.id;
            }

            // Build comma-separated receipt filenames
            const receiptFilenames = scannedReceipts.map(r => r.file.name).join(',') || null;

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: formData.id,
                    clientId,
                    signature: formData.signature,
                    receipt: receiptFilenames,
                    items: formData.items,
                }),
            });

            if (!response.ok) throw new Error('Failed to save order');
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert(`Error saving order: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
                    <ul className="space-y-1">
                        {formData.items.map(item => (
                            <li key={item.id} className="flex items-center gap-2 text-sm">
                                <span className="font-mono bg-white border rounded px-1">{formData.id}-{item.id}</span>
                                {item.individualClient && (
                                    <span className="text-blue-700 font-medium">← {item.individualClient}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setScannedReceipts([]);
                        setFormData({
                            id: '',
                            clientId: '',
                            clientName: '',
                            phone: '',
                            email: '',
                            street: '',
                            number: '',
                            postalCode: '',
                            city: '',
                            country: '',
                            items: [{ id: '1' }],
                            signature: null,
                        });
                        setIsNewClient(true);
                        fetchNextOrderId();
                    }}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Add New Order
                </button>
            </div>
        );
    }

    const totalOcrRugs = buildAssignments(scannedReceipts).length;
    const isPartnerOrder = scannedReceipts.length > 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">New Order</h2>
                <span className="font-mono text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {formData.id || 'Loading...'}
                </span>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                    Client Details
                    {isPartnerOrder && (
                        <span className="ml-2 text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Partner / Pressing
                        </span>
                    )}
                </h3>

                <div className="relative" ref={dropdownRef}>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                        Client Name {!isNewClient && <span className="text-green-600 text-xs">(Existing)</span>}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="clientName"
                            name="clientName"
                            required
                            value={formData.clientName}
                            onChange={handleClientNameChange}
                            onFocus={() => {
                                if (formData.clientName && filteredClients.length > 0) setShowDropdown(true);
                            }}
                            className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Partner number or name (e.g. 721)"
                            autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 mt-0.5" />
                    </div>

                    {showDropdown && filteredClients.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => selectClient(client)}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900">{client.name}</div>
                                    {(client.phone || client.email) && (
                                        <div className="text-sm text-gray-500">
                                            {client.phone && <span>{client.phone}</span>}
                                            {client.phone && client.email && <span> • </span>}
                                            {client.email && <span>{client.email}</span>}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+41 79 123 4567 (Optional)" />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="client@example.com (Optional)" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                        <input type="text" id="street" name="street" value={formData.street} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Main Street" />
                    </div>
                    <div>
                        <label htmlFor="number" className="block text-sm font-medium text-gray-700">Number</label>
                        <input type="text" id="number" name="number" value={formData.number} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="123" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="8000" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Zürich" />
                    </div>
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" id="country" name="country" value={formData.country} onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Switzerland" />
                </div>
            </div>

            {/* Receipt Scanner Section */}
            <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                        <ScanLine className="w-5 h-5 text-blue-500" />
                        Receipts
                        <span className="text-xs font-normal text-gray-400">(optional – for partner orders)</span>
                    </h3>
                    <label
                        htmlFor="receipt-add"
                        className="cursor-pointer flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <Plus className="h-4 w-4" /> Scan Receipt
                        <input
                            id="receipt-add"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={handleReceiptAdd}
                        />
                    </label>
                </div>

                {scannedReceipts.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No receipts scanned — tap &quot;+ Scan Receipt&quot; if this is a partner order.</p>
                )}

                {scannedReceipts.map((r, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{r.file.name}</span>
                            </div>
                            <button type="button" onClick={() => removeReceipt(idx)} className="text-gray-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {r.scanning && (
                            <div className="flex items-center gap-2 text-blue-600 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Scanning receipt...
                            </div>
                        )}

                        {r.error && (
                            <p className="text-sm text-red-500">⚠ OCR failed: {r.error}</p>
                        )}

                        {!r.scanning && !r.error && r.entries.length > 0 && (
                            <div className="space-y-1">
                                {r.entries.map((entry, ei) => (
                                    <div key={ei} className="flex items-center justify-between bg-white border rounded px-2 py-1 text-sm">
                                        <span className="flex items-center gap-1.5 text-gray-800">
                                            <User className="w-3.5 h-3.5 text-blue-400" />
                                            {entry.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">{entry.rugCount} rug{entry.rugCount !== 1 ? 's' : ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!r.scanning && !r.error && r.entries.length === 0 && r.rawText && (
                            <p className="text-xs text-amber-600">⚠ Scanned but no client names detected. Raw text: <span className="italic">{r.rawText.slice(0, 120)}…</span></p>
                        )}
                    </div>
                ))}

                {totalOcrRugs > 0 && (
                    <p className="text-xs text-blue-600">
                        ✓ {totalOcrRugs} rug{totalOcrRugs !== 1 ? 's' : ''} assigned from receipt{scannedReceipts.length > 1 ? 's' : ''}.
                        {formData.items.length > totalOcrRugs && ` ${formData.items.length - totalOcrRugs} additional rug(s) without individual client.`}
                    </p>
                )}
            </div>

            {/* Items Received */}
            <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700">Items Received</h3>
                    <button type="button" onClick={addItem} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <Plus className="h-4 w-4 mr-1" /> Add Rug
                    </button>
                </div>

                <div className="space-y-2">
                    {formData.items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex-shrink-0">
                                    {index + 1}
                                </span>
                                <span className="font-mono font-medium text-gray-700">{item.id}</span>
                                {item.individualClient && (
                                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                                        <User className="w-3 h-3 flex-shrink-0" />
                                        {item.individualClient}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={formData.items.length === 1}
                                className="text-red-500 hover:text-red-700 disabled:opacity-30 flex-shrink-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Signature */}
            <div className="border-t pt-4">
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
