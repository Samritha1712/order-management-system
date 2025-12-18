import api from "./axios";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};
