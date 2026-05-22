import apiClient from "./client";

export type WillType = "SINGLE" | "JOINT" | "NONE";

export interface WillRecord {
  id: string;
  hasWill: boolean;
  willType?: WillType;
  location?: string;
  executorId?: string;
  executorName?: string;
  registeredWith?: string;
  reviewReminderDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type WillRecordInput = Omit<
  WillRecord,
  "id" | "createdAt" | "updatedAt" | "executorName"
>;

export const willApi = {
  get: async (): Promise<WillRecord> => {
    const { data } = await apiClient.get<WillRecord>("/will");
    return data;
  },

  upsert: async (will: WillRecordInput): Promise<WillRecord> => {
    const { data } = await apiClient.put<WillRecord>("/will", will);
    return data;
  },
};

export const WILL_TYPE_LABELS: Record<WillType, string> = {
  SINGLE: "Single",
  JOINT: "Joint",
  NONE: "None",
};
