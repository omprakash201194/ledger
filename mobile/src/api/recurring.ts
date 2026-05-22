import apiClient from "./client";

export type ObligationType =
  | "LOAN_EMI"
  | "SIP"
  | "INSURANCE_PREMIUM"
  | "SUBSCRIPTION"
  | "UTILITY"
  | "OTHER";

export type Frequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "HALF_YEARLY"
  | "YEARLY";

export type RecurringActionOnDeath = "CONTINUE" | "CANCEL" | "REVIEW";

export interface RecurringObligation {
  id: string;
  obligationType: ObligationType;
  payee: string;
  amount: number;
  frequency: Frequency;
  dueDay?: number;
  paymentSource?: string;
  actionOnDeath?: RecurringActionOnDeath;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecurringObligationInput = Omit<
  RecurringObligation,
  "id" | "createdAt" | "updatedAt"
>;

export const recurringApi = {
  getAll: async (): Promise<RecurringObligation[]> => {
    const { data } = await apiClient.get<RecurringObligation[]>("/recurring");
    return data;
  },

  getById: async (id: string): Promise<RecurringObligation> => {
    const { data } = await apiClient.get<RecurringObligation>(
      `/recurring/${id}`
    );
    return data;
  },

  create: async (
    obligation: RecurringObligationInput
  ): Promise<RecurringObligation> => {
    const { data } = await apiClient.post<RecurringObligation>(
      "/recurring",
      obligation
    );
    return data;
  },

  update: async (
    id: string,
    obligation: RecurringObligationInput
  ): Promise<RecurringObligation> => {
    const { data } = await apiClient.put<RecurringObligation>(
      `/recurring/${id}`,
      obligation
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/recurring/${id}`);
  },
};

export const OBLIGATION_TYPE_LABELS: Record<ObligationType, string> = {
  LOAN_EMI: "Loan EMI",
  SIP: "SIP",
  INSURANCE_PREMIUM: "Insurance Premium",
  SUBSCRIPTION: "Subscription",
  UTILITY: "Utility",
  OTHER: "Other",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half-Yearly",
  YEARLY: "Yearly",
};

export const RECURRING_ACTION_LABELS: Record<RecurringActionOnDeath, string> = {
  CONTINUE: "Continue",
  CANCEL: "Cancel",
  REVIEW: "Review",
};
