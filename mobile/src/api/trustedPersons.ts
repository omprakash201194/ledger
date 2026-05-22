import apiClient from "./client";

export type TrustedPersonType = "FAMILY" | "ADVISOR" | "EXECUTOR";

export interface TrustedPerson {
  id: string;
  name: string;
  relationship?: string;
  type: TrustedPersonType;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TrustedPersonInput = Omit<
  TrustedPerson,
  "id" | "createdAt" | "updatedAt"
>;

export const trustedPersonsApi = {
  getAll: async (): Promise<TrustedPerson[]> => {
    const { data } = await apiClient.get<TrustedPerson[]>("/trusted-persons");
    return data;
  },

  getById: async (id: string): Promise<TrustedPerson> => {
    const { data } = await apiClient.get<TrustedPerson>(
      `/trusted-persons/${id}`
    );
    return data;
  },

  create: async (person: TrustedPersonInput): Promise<TrustedPerson> => {
    const { data } = await apiClient.post<TrustedPerson>(
      "/trusted-persons",
      person
    );
    return data;
  },

  update: async (
    id: string,
    person: TrustedPersonInput
  ): Promise<TrustedPerson> => {
    const { data } = await apiClient.put<TrustedPerson>(
      `/trusted-persons/${id}`,
      person
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/trusted-persons/${id}`);
  },
};

export const TRUSTED_PERSON_TYPE_LABELS: Record<TrustedPersonType, string> = {
  FAMILY: "Family",
  ADVISOR: "Advisor",
  EXECUTOR: "Executor",
};
