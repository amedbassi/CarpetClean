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
    length: string | null;
    width: string | null;
    material: string | null;
    state: string | null;
    photo: string | null;
    cleaningCost: number | null;
    repairCost: number | null;
    repairDescription: string | null;
}

export interface Order {
    id: string;
    clientId: string;
    createdAt: string;
    requiresCleaningApproval: boolean;
    cleaningApprovalStatus: ApprovalStatus;
    requiresRepairApproval: boolean;
    repairApprovalStatus: ApprovalStatus;
    signature: string | null;
    receipt: string | null;
    client?: Client;
    items: CarpetItem[];
}
