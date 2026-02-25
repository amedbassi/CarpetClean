export type ApprovalStatus = 'not_needed' | 'pending' | 'approved' | 'rejected';

export interface Client {
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

export interface CarpetItem {
    id: string;
    orderId: string;
    status: string;
    length: string;
    width: string;
    material: string;
    state: string; // e.g., 'Good', 'Worn', 'Damaged'
    cleaningCost: number;
    repairCost: number;
    repairDescription: string | null;
    individualClient: string | null;
}

export interface Order {
    id: string;
    clientId: string;
    createdAt: string;
    requiresCleaningApproval: boolean;
    cleaningApprovalStatus: ApprovalStatus;
    requiresRepairApproval: boolean;
    repairApprovalStatus: ApprovalStatus;
    deliverySignature: string | null;
    client?: Client;
    items: CarpetItem[];
}
