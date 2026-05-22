import apiClient from "./client";

export type PolicyType =
  | "TERM_LIFE"
  | "WHOLE_LIFE"
  | "HEALTH"
  | "VEHICLE"
  | "PROPERTY"
  | "OTHER";

export interface InsurancePolicy {
  id: string;
  policyType: PolicyType;
  insurer: string;
  policyNumber?: string;
  lifeAssured?: string;
  sumAssured?: number;
  premiumAmount?: number;
  premiumDueMonth?: number;
  premiumDueDay?: number;
  trustedPersonId?: string;
  trustedPersonName?: string;
  maturityDate?: string;
  documentLocation?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type InsurancePolicyInput = Omit<
  InsurancePolicy,
  "id" | "createdAt" | "updatedAt" | "trustedPersonName"
>;

export const insuranceApi = {
  getAll: async (): Promise<InsurancePolicy[]> => {
    const { data } = await apiClient.get<InsurancePolicy[]>("/insurance");
    return data;
  },

  getById: async (id: string): Promise<InsurancePolicy> => {
    const { data } = await apiClient.get<InsurancePolicy>(`/insurance/${id}`);
    return data;
  },

  create: async (policy: InsurancePolicyInput): Promise<InsurancePolicy> => {
    const { data } = await apiClient.post<InsurancePolicy>(
      "/insurance",
      policy
    );
    return data;
  },

  update: async (
    id: string,
    policy: InsurancePolicyInput
  ): Promise<InsurancePolicy> => {
    const { data } = await apiClient.put<InsurancePolicy>(
      `/insurance/${id}`,
      policy
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/insurance/${id}`);
  },
};

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  TERM_LIFE: "Term Life",
  WHOLE_LIFE: "Whole Life",
  HEALTH: "Health",
  VEHICLE: "Vehicle",
  PROPERTY: "Property",
  OTHER: "Other",
};
