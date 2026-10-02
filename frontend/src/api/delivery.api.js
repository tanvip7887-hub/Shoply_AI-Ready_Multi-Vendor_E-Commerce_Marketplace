import axiosClient from "./axiosClient.js";

export const deliveryApi = {
  getAvailablePickups: () => axiosClient.get("/delivery/available"),
  getMyShipments: (status) => axiosClient.get("/delivery/mine", { params: { status } }),
  getShipmentById: (id) => axiosClient.get(`/delivery/${id}`),
  acceptShipment: (id) => axiosClient.post(`/delivery/${id}/accept`),
  updateShipmentStatus: (id, shipmentStatus) =>
    axiosClient.patch(`/delivery/${id}/status`, { shipmentStatus }),
};
