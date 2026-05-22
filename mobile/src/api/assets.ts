import apiClient from "./client";

export type AssetType =
  | "SAVINGS_ACCOUNT"
  | "CURRENT_ACCOUNT"
  | "FIXED_DEPOSIT"
  | "RECURRING_DEPOSIT"
  | "PPF"
  | "EPF"
  | "NPS"
  | "MUTUAL_FUND"
  | "EQUITY"
  | "GOLD"
  | "REAL_ESTATE"
  | "VEHICLE"
  | "BANK_LOCKER"
  | "OTHER";

export type HoldingMode = "SINGLE" | "JOINT" | "EITHER_OR_SURVIVOR";

export interface Asset {
  id: string;
  assetType: AssetType;
  description: string;
  institution?: string;
  accountNumber?: string;
  holdingMode: HoldingMode;
  jointHolderName?: string;
  trustedPersonId?: string;
  trustedPersonName?: string;
  approxValue?: number;
  valueAsOf?: string;
  maturityDate?: string;
  documentLocation?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetInput = Omit<Asset, "id" | "createdAt" | "updatedAt" | "trustedPersonName">;

export const assetsApi = {
  getAll: async (): Promise<Asset[]> => {
    const { data } = await apiClient.get<Asset[]>("/assets");
    return data;
  },

  getById: async (id: string): Promise<Asset> => {
    const { data } = await apiClient.get<Asset>(`/assets/${id}`);
    return data;
  },

  create: async (asset: AssetInput): Promise<Asset> => {
    const { data } = await apiClient.post<Asset>("/assets", asset);
    return data;
  },

  update: async (id: string, asset: AssetInput): Promise<Asset> => {
    const { data } = await apiClient.put<Asset>(`/assets/${id}`, asset);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SAVINGS_ACCOUNT: "Savings Account",
  CURRENT_ACCOUNT: "Current Account",
  FIXED_DEPOSIT: "Fixed Deposit",
  RECURRING_DEPOSIT: "Recurring Deposit",
  PPF: "PPF",
  EPF: "EPF",
  NPS: "NPS",
  MUTUAL_FUND: "Mutual Fund",
  EQUITY: "Equity / Stocks",
  GOLD: "Gold",
  REAL_ESTATE: "Real Estate",
  VEHICLE: "Vehicle",
  BANK_LOCKER: "Bank Locker",
  OTHER: "Other",
};

export const ASSET_CATEGORIES: { label: string; types: AssetType[] }[] = [
  {
    label: "Banking",
    types: [
      "SAVINGS_ACCOUNT",
      "CURRENT_ACCOUNT",
      "FIXED_DEPOSIT",
      "RECURRING_DEPOSIT",
      "BANK_LOCKER",
    ],
  },
  {
    label: "Investments",
    types: ["PPF", "EPF", "NPS", "MUTUAL_FUND", "EQUITY"],
  },
  { label: "Physical", types: ["GOLD", "REAL_ESTATE", "VEHICLE"] },
  { label: "Other", types: ["OTHER"] },
];

export const MATURITY_ASSET_TYPES: AssetType[] = [
  "FIXED_DEPOSIT",
  "RECURRING_DEPOSIT",
  "NPS",
];

export const HOLDING_MODE_LABELS: Record<HoldingMode, string> = {
  SINGLE: "Single",
  JOINT: "Joint",
  EITHER_OR_SURVIVOR: "Either or Survivor",
};
