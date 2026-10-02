export const RETURN_STATUS_LABELS = {
  RETURN_REQUESTED: "Return Requested",
  RETURN_APPROVED: "Return Approved",
  RETURN_REJECTED: "Return Rejected",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PICKED_UP: "Picked Up",
  RECEIVED: "Received by Seller",
  INSPECTION: "Under Inspection",
  REFUND_INITIATED: "Refund Initiated",
  REFUNDED: "Refund Completed",
  CANCELLED: "Return Cancelled",
};

export const RETURN_STATUS_BADGE = {
  RETURN_REQUESTED: "bg-amber-100 text-amber-800 border-amber-200",
  RETURN_APPROVED: "bg-blue-100 text-blue-800 border-blue-200",
  RETURN_REJECTED: "bg-red-100 text-red-800 border-red-200",
  PICKUP_SCHEDULED: "bg-purple-100 text-purple-800 border-purple-200",
  PICKED_UP: "bg-indigo-100 text-indigo-800 border-indigo-200",
  RECEIVED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  INSPECTION: "bg-teal-100 text-teal-800 border-teal-200",
  REFUND_INITIATED: "bg-sky-100 text-sky-800 border-sky-200",
  REFUNDED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
};

export const getReturnStatusText = (status) => {
  return RETURN_STATUS_LABELS[status] || status?.replace(/_/g, " ") || "Return";
};
