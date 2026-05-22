import apiClient from "./client";

export type DigitalAccountCategory =
  | "PASSWORD_MANAGER"
  | "EMAIL"
  | "BANKING"
  | "INVESTMENT"
  | "SOCIAL_MEDIA"
  | "GOVERNMENT"
  | "SUBSCRIPTION"
  | "OTHER";

export type ActionOnDeath = "TRANSFER" | "ARCHIVE" | "CLOSE" | "MEMORIALIZE";

export interface DigitalAccount {
  id: string;
  category: DigitalAccountCategory;
  serviceName: string;
  username?: string;
  credentialLocation?: string;
  twoFaMethod?: string;
  recoveryContact?: string;
  actionOnDeath?: ActionOnDeath;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type DigitalAccountInput = Omit<
  DigitalAccount,
  "id" | "createdAt" | "updatedAt"
>;

export const digitalAccountsApi = {
  getAll: async (): Promise<DigitalAccount[]> => {
    const { data } = await apiClient.get<DigitalAccount[]>("/digital-accounts");
    return data;
  },

  getById: async (id: string): Promise<DigitalAccount> => {
    const { data } = await apiClient.get<DigitalAccount>(
      `/digital-accounts/${id}`
    );
    return data;
  },

  create: async (account: DigitalAccountInput): Promise<DigitalAccount> => {
    const { data } = await apiClient.post<DigitalAccount>(
      "/digital-accounts",
      account
    );
    return data;
  },

  update: async (
    id: string,
    account: DigitalAccountInput
  ): Promise<DigitalAccount> => {
    const { data } = await apiClient.put<DigitalAccount>(
      `/digital-accounts/${id}`,
      account
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/digital-accounts/${id}`);
  },
};

export const DIGITAL_ACCOUNT_CATEGORY_LABELS: Record<
  DigitalAccountCategory,
  string
> = {
  PASSWORD_MANAGER: "Password Manager",
  EMAIL: "Email",
  BANKING: "Banking",
  INVESTMENT: "Investment",
  SOCIAL_MEDIA: "Social Media",
  GOVERNMENT: "Government",
  SUBSCRIPTION: "Subscription",
  OTHER: "Other",
};

export const ACTION_ON_DEATH_LABELS: Record<ActionOnDeath, string> = {
  TRANSFER: "Transfer",
  ARCHIVE: "Archive",
  CLOSE: "Close",
  MEMORIALIZE: "Memorialize",
};
