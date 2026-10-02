import prisma from "../../config/prisma.js";

const getSellerProfileOrThrow = async (userId) => {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) {
    const err = new Error("Seller profile not found");
    err.statusCode = 403;
    throw err;
  }
  return seller;
};

/**
 * Get customers who have purchased products from the logged-in seller.
 */
export const getSellerCustomers = async (userId, { search } = {}) => {
  const seller = await getSellerProfileOrThrow(userId);

  const orders = await prisma.order.findMany({
    where: { sellerId: seller.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const customerMap = new Map();

  for (const order of orders) {
    if (!order.user) continue;

    let cust = customerMap.get(order.userId);
    if (!cust) {
      const phone =
        order.user.phone ||
        (typeof order.shippingAddress === "object" && order.shippingAddress?.phone) ||
        "N/A";

      cust = {
        id: order.user.id,
        name: order.user.name || "Customer",
        email: order.user.email || "",
        phone,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt,
      };
      customerMap.set(order.userId, cust);
    }

    cust.totalOrders += 1;
    cust.totalSpent += Number(order.totalAmount || 0);

    if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
      cust.lastOrderDate = order.createdAt;
    }
  }

  let customersList = Array.from(customerMap.values()).map((c) => ({
    ...c,
    status: c.totalOrders > 1 ? "Repeat" : "New",
  }));

  const totalCustomers = customersList.length;
  const newCustomers = customersList.filter((c) => c.totalOrders === 1).length;
  const repeatCustomers = customersList.filter((c) => c.totalOrders > 1).length;

  if (search && search.trim() !== "") {
    const query = search.trim().toLowerCase();
    customersList = customersList.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );
  }

  return {
    summary: {
      totalCustomers,
      newCustomers,
      repeatCustomers,
    },
    customers: customersList,
  };
};

/**
 * Get detailed customer profile and their order history with THIS seller only.
 */
export const getSellerCustomerById = async (userId, customerId) => {
  const seller = await getSellerProfileOrThrow(userId);

  const orders = await prisma.order.findMany({
    where: {
      sellerId: seller.id,
      userId: Number(customerId),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!orders || orders.length === 0) {
    const err = new Error("Customer not found or has no orders with your store");
    err.statusCode = 404;
    throw err;
  }

  const user = orders[0].user;
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const lastOrderDate = orders[0].createdAt;
  const phone =
    user?.phone ||
    (typeof orders[0].shippingAddress === "object" && orders[0].shippingAddress?.phone) ||
    "N/A";

  const orderHistory = orders.map((o) => ({
    id: o.id,
    orderNumber: `ORD-${o.id}`,
    createdAt: o.createdAt,
    itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: Number(o.totalAmount),
    orderStatus: o.orderStatus,
  }));

  return {
    customer: {
      id: user?.id || Number(customerId),
      name: user?.name || "Customer",
      email: user?.email || "",
      phone,
      totalOrders,
      totalSpent,
      lastOrderDate,
      status: totalOrders > 1 ? "Repeat" : "New",
    },
    orders: orderHistory,
  };
};
