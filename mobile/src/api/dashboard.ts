import apiClient from "./client";

export interface DashboardSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  unreadAlertCount: number;
}

export const dashboardApi = {
  getNetWorth: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>(
      "/dashboard/net-worth"
    );
    return data;
  },
};
