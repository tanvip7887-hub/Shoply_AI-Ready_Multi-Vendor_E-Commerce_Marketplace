import axiosClient from "./axiosClient.js";

export const createReturn = async (data) => {
  return axiosClient.post("/returns", data);
};

export const getMyReturns = async () => {
  return axiosClient.get("/returns/my");
};

export const getMyReturnById = async (id) => {
  return axiosClient.get(`/returns/my/${id}`);
};

export const cancelMyReturn = async (id) => {
  return axiosClient.patch(`/returns/my/${id}/cancel`);
};

// Seller APIs
export const getSellerReturns = async () => {
  return axiosClient.get("/returns/seller");
};

export const getSellerReturnById = async (id) => {
  return axiosClient.get(`/returns/seller/${id}`);
};

export const approveSellerReturn = async (id) => {
  return axiosClient.patch(`/returns/seller/${id}/approve`);
};

export const rejectSellerReturn = async (id, rejectionReason) => {
  return axiosClient.patch(`/returns/seller/${id}/reject`, { rejectionReason });
};

export const inspectSellerReturn = async (id, notes) => {
  return axiosClient.patch(`/returns/seller/${id}/inspect`, { notes });
};

export const processSellerRefund = async (id) => {
  return axiosClient.patch(`/returns/seller/${id}/process-refund`);
};

// Delivery Agent APIs
export const getAvailableReturnPickups = async () => {
  return axiosClient.get("/returns/delivery/pickups");
};

export const getMyReturnShipments = async () => {
  return axiosClient.get("/returns/delivery/mine");
};

export const acceptReturnPickup = async (shipmentId) => {
  return axiosClient.post(`/returns/delivery/pickups/${shipmentId}/accept`);
};

export const updateReturnPickupStatus = async (shipmentId, status) => {
  return axiosClient.patch(`/returns/delivery/pickups/${shipmentId}/status`, { status });
};

