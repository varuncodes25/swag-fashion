import apiClient from "@/api/axiosConfig";

const orderService = {
  getAllOrders: async (page = 1, limit = 10) => {
    const response = await apiClient.get("/get-all-orders", {
      params: { page, limit },
    });
    return response.data;
  },

  updateOrderStatus: async (orderId, data) => {
    const response = await apiClient.put(
      `/update-order-status/${orderId}`,
      data,
    );
    return response.data;
  },
};

export default orderService;
