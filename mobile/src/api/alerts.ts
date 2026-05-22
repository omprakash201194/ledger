import apiClient from "./client";

export type AlertType =
  | "INSURANCE_PREMIUM_DUE"
  | "EMI_DUE"
  | "WILL_REVIEW_DUE"
  | "WILL_NO_REVIEW"
  | "OBLIGATION_REVIEW"
  | "ASSET_VALUE_STALE"
  | "NOMINEE_MISSING"
  | "FD_MATURITY_DUE"
  | "EMI_ENDING_SOON";

export interface Alert {
  id: string;
  alertType: AlertType;
  title: string;
  message: string;
  sourceEntity?: string;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
}

export const alertsApi = {
  getAll: async (): Promise<Alert[]> => {
    const { data } = await apiClient.get<Alert[]>("/alerts");
    return data;
  },

  markRead: async (id: string): Promise<Alert> => {
    const { data } = await apiClient.patch<Alert>(`/alerts/${id}/read`, {});
    return data;
  },
};

export const ALERT_COLORS: Record<
  AlertType,
  { bg: string; text: string; badge: string }
> = {
  INSURANCE_PREMIUM_DUE: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100",
  },
  EMI_DUE: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-100",
  },
  WILL_REVIEW_DUE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100",
  },
  WILL_NO_REVIEW: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    badge: "bg-purple-100",
  },
  OBLIGATION_REVIEW: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    badge: "bg-gray-100",
  },
  ASSET_VALUE_STALE: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "bg-yellow-100",
  },
  NOMINEE_MISSING: {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100",
  },
  FD_MATURITY_DUE: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    badge: "bg-teal-100",
  },
  EMI_ENDING_SOON: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-100",
  },
};
