import apiClient from "./client";

export type LiabilityType =
  | "HOME_LOAN"
  | "CAR_LOAN"
  | "PERSONAL_LOAN"
  | "EDUCATION_LOAN"
  | "CREDIT_CARD"
  | "OTHER";

export interface Liability {
  id: string;
  liabilityType: LiabilityType;
  lender: string;
  accountNumber?: string;
  originalAmount?: number;
  outstandingBalance?: number;
  emiAmount?: number;
  tenureEndDate?: string;
  linkedAssetId?: string;
  linkedAssetDescription?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type LiabilityInput = Omit<
  Liability,
  "id" | "createdAt" | "updatedAt" | "linkedAssetDescription"
>;

export const liabilitiesApi = {
  getAll: async (): Promise<Liability[]> => {
    const { data } = await apiClient.get<Liability[]>("/liabilities");
    return data;
  },

  getById: async (id: string): Promise<Liability> => {
    const { data } = await apiClient.get<Liability>(`/liabilities/${id}`);
    return data;
  },

  create: async (liability: LiabilityInput): Promise<Liability> => {
    const { data } = await apiClient.post<Liability>("/liabilities", liability);
    return data;
  },

  update: async (id: string, liability: LiabilityInput): Promise<Liability> => {
    const { data } = await apiClient.put<Liability>(
      `/liabilities/${id}`,
      liability
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/liabilities/${id}`);
  },
};

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  HOME_LOAN: "Home Loan",
  CAR_LOAN: "Car Loan",
  PERSONAL_LOAN: "Personal Loan",
  EDUCATION_LOAN: "Education Loan",
  CREDIT_CARD: "Credit Card",
  OTHER: "Other",
};
