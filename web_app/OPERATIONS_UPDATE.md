# Operations Dashboard Update Instructions

Add these features to `src/components/OperationsDashboard.tsx`:

## 1. Add buttons after the approval status badge (around line 240):

```tsx
{(order.requiresCleaningApproval || order.requiresRepairApproval) && (
    <>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${...}`}>
            {/* existing status badge */}
        </span>
        
        {/* ADD THESE BUTTONS */}
        <button
            onClick={() => sendApprovalRequest(order)}
            className="flex items-center text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
            <Mail className="w-3 h-3 mr-1" />
            Send Approval
        </button>
        
        <button
            onClick={() => {
                if (order.client) {
                    setEditingClient(order.client);
                    setClientForm(order.client);
                }
            }}
            className="flex items-center text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
        >
            <Edit className="w-3 h-3 mr-1" />
            Edit Client
        </button>
    </>
)}
```

## 2. Add Edit Client Modal before the closing `</div>` of the component:

```tsx
{/* Edit Client Modal */}
{editingClient && clientForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setEditingClient(null)}>
        <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Client Information</h3>
            
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
```

## 3. Create API route for updating client: `src/app/api/clients/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const clientData = await request.json();

        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name: clientData.name,
                phone: clientData.phone || null,
                email: clientData.email || null,
                street: clientData.street || null,
                number: clientData.number || null,
                postalCode: clientData.postalCode || null,
                city: clientData.city || null,
                country: clientData.country || null,
            },
        });

        return NextResponse.json({ success: true, client: updatedClient });
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ success: false, message: 'Failed to update client' }, { status: 500 });
    }
}
```
