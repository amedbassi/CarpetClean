// Application Constants
// Centralized constants to avoid magic strings throughout the codebase

export const APPROVAL_STATUS = {
  NOT_NEEDED: 'not_needed',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

export const ITEM_STATUS = {
  PENDING: 'pending',
  MEASURED: 'measured',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  DELIVERED: 'delivered',
  REPAIR_NEEDED: 'repair_needed',
  REPAIR_ESTIMATED: 'repair_estimated',
} as const;

export type ItemStatus = typeof ITEM_STATUS[keyof typeof ITEM_STATUS];

export const CARPET_STATE = {
  GOOD: 'Good',
  WORN: 'Worn',
  DAMAGED: 'Damaged',
} as const;

export type CarpetState = typeof CARPET_STATE[keyof typeof CARPET_STATE];

export const MATERIAL_TYPE = {
  WOOL: 'Wool',
  SILK: 'Silk',
  COTTON: 'Cotton',
  SYNTHETIC: 'Synthetic',
  OTHER: 'Other',
} as const;

export type MaterialType = typeof MATERIAL_TYPE[keyof typeof MATERIAL_TYPE];

export const CURRENCY = {
  CHF: 'CHF',
  EUR: 'EUR',
  USD: 'USD',
} as const;

export type Currency = typeof CURRENCY[keyof typeof CURRENCY];

// Default pricing rates (CHF per m²)
export const DEFAULT_PRICING = {
  [MATERIAL_TYPE.WOOL]: 27.0,
  [MATERIAL_TYPE.SILK]: 47.0,
  [MATERIAL_TYPE.COTTON]: 24.0,
  [MATERIAL_TYPE.SYNTHETIC]: 20.0,
  [MATERIAL_TYPE.OTHER]: 30.0,
} as const;

// Default repair hourly rate
export const DEFAULT_REPAIR_RATE = 50.0;

// Default tax rate (Swiss VAT)
export const DEFAULT_TAX_RATE = 7.7;
