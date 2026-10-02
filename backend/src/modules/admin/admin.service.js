import prisma from "../../config/prisma.js";
import logger from "../../utils/logger.js";
import { sendSellerApprovedEmail, sendSellerRejectedEmail } from "../notification/notification.service.js";

// ---- Dashboard ----

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalSellers,
    verifiedSellers,
    totalProducts,
    totalOrders,
    pendingSellerRequests,
    revenueResult,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.seller.count(),
    prisma.seller.count({ where: { status: "VERIFIED" } }),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.order.count(),
    prisma.sellerApplication.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { orderStatus: "DELIVERED" },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalUsers,
    totalSellers,
    verifiedSellers,
    totalProducts,
    totalOrders,
    pendingSellerRequests,
    revenue: revenueResult._sum.totalAmount || 0,
  };
};

// ---- User management ----

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

export const getAllUsers = async ({ role, status } = {}) => {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
  return users.map(safeUser);
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return safeUser(user);
};

export const updateUserRole = async (adminId, targetUserId, role) => {
  await getUserById(targetUserId);
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { role } });
  logger.info(`Admin ${adminId} changed role of user ${targetUserId} to ${role}`);
  return safeUser(user);
};

export const updateUserStatus = async (adminId, targetUserId, status) => {
  if (adminId === targetUserId && status === "BLOCKED") {
    const err = new Error("You cannot block your own account");
    err.statusCode = 400;
    throw err;
  }
  await getUserById(targetUserId);
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { status } });
  logger.info(`Admin ${adminId} set status of user ${targetUserId} to ${status}`);
  return safeUser(user);
};

// ---- Seller verification ----

const getSellerOr404 = async (id) => {
  const seller = await prisma.seller.findUnique({ where: { id } });
  if (!seller) {
    const err = new Error("Seller not found");
    err.statusCode = 404;
    throw err;
  }
  return seller;
};

const generateSellerCode = async () => {
  const count = await prisma.seller.count();
  return `SEL${String(count + 1).padStart(6, "0")}`;
};

export const getPendingApplications = async () => {
  return prisma.sellerApplication.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true } }, sellerAddress: true, documents: true },
    orderBy: { createdAt: "asc" },
  });
};

export const getAllApplications = async ({ status } = {}) => {
  const where = {};
  if (status) where.status = status;
  return prisma.sellerApplication.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, sellerAddress: true, documents: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getApplicationById = async (id) => {
  const application = await prisma.sellerApplication.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } }, sellerAddress: true, documents: true },
  });
  if (!application) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }
  return application;
};

export const approveApplication = async (adminId, applicationId) => {
  const application = await getApplicationById(applicationId);
  if (application.status !== "PENDING") {
    const err = new Error(`Cannot approve an application with status ${application.status}`);
    err.statusCode = 400;
    throw err;
  }

  const sellerCode = await generateSellerCode();

  const [seller] = await prisma.$transaction([
    prisma.seller.create({
      data: {
        sellerCode,
        userId: application.userId,
        applicationId: application.id,
        businessName: application.businessName,
        ownerName: application.ownerName,
        mobileNumber: application.mobileNumber,
        gstNumber: application.gstNumber,
        panNumber: application.panNumber,
        sellerAddressId: application.sellerAddressId,
        businessDescription: application.businessDescription,
      },
    }),
    prisma.user.update({ where: { id: application.userId }, data: { role: "SELLER" } }),
    prisma.sellerApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED", reviewedByAdminId: adminId, reviewedAt: new Date() },
    }),
  ]);

  await sendSellerApprovedEmail(application.user.email, application.businessName);

  logger.info(`Admin ${adminId} approved seller application ${applicationId} -> seller ${seller.id} (${sellerCode})`);
  return seller;
};

export const rejectApplication = async (adminId, applicationId, reason) => {
  const application = await getApplicationById(applicationId);
  if (application.status !== "PENDING") {
    const err = new Error(`Cannot reject an application with status ${application.status}`);
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED", rejectionReason: reason, reviewedByAdminId: adminId, reviewedAt: new Date() },
  });

  await sendSellerRejectedEmail(application.user.email, application.businessName, reason);

  logger.info(`Admin ${adminId} rejected seller application ${applicationId}: ${reason}`);
  return updated;
};

export const suspendSeller = async (adminId, sellerId) => {
  const existing = await getSellerOr404(sellerId);
  if (existing.status !== "VERIFIED") {
    const err = new Error("Only a verified seller can be suspended");
    err.statusCode = 400;
    throw err;
  }
  const seller = await prisma.seller.update({
    where: { id: sellerId },
    data: { status: "SUSPENDED" },
  });
  logger.info(`Admin ${adminId} suspended seller ${sellerId}`);
  return seller;
};

export const unsuspendSeller = async (adminId, sellerId) => {
  const existing = await getSellerOr404(sellerId);
  if (existing.status !== "SUSPENDED") {
    const err = new Error("Seller is not currently suspended");
    err.statusCode = 400;
    throw err;
  }
  const seller = await prisma.seller.update({
    where: { id: sellerId },
    data: { status: "VERIFIED" },
  });
  logger.info(`Admin ${adminId} unsuspended seller ${sellerId}`);
  return seller;
};

// ---- Product moderation ----

export const getAllProductsForAdmin = async ({ isActive, isDeleted, sellerId, search, status } = {}) => {
  const where = {};
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;
  if (isDeleted === "true") where.isDeleted = true;
  if (isDeleted === "false") where.isDeleted = false;
  if (sellerId) where.sellerId = Number(sellerId);
  if (status) where.approvalStatus = status.toUpperCase();
  if (search) where.name = { contains: search };

  return prisma.product.findMany({
    where,
    include: {
      seller: { select: { businessName: true } },
      category: { select: { name: true } },
      brand: { select: { name: true } },
      images: { take: 1 },
      inventory: { select: { stock: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateProductStatusByAdmin = async (adminId, productId, isActive) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  const updated = await prisma.product.update({ where: { id: productId }, data: { isActive } });
  logger.info(`Admin ${adminId} set product ${productId} isActive=${isActive}`);
  return updated;
};

export const softDeleteProduct = async (adminId, productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isDeleted: true, isActive: false },
  });
  logger.info(`Admin ${adminId} soft-deleted product ${productId}`);
  return updated;
};

export const approveProduct = async (adminId, productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { seller: true } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  
  if (product.approvalStatus === "APPROVED") {
    const err = new Error("Product is already approved");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      approvalStatus: "APPROVED",
      approvedAt: new Date(),
      approvedBy: adminId,
    },
  });

  await prisma.notification.create({
    data: {
      userId: product.seller.userId,
      title: "Product Approved",
      message: `Your product "${product.name}" has been approved and is now visible to customers.`,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId,
      action: "APPROVE_PRODUCT",
      entityId: product.id,
      entityType: "PRODUCT",
      details: { productName: product.name },
    },
  });

  logger.info(`Admin ${adminId} approved product ${productId}`);
  return updated;
};

export const rejectProduct = async (adminId, productId, reason) => {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { seller: true } });
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      approvalStatus: "REJECTED",
      rejectionReason: reason,
      rejectedAt: new Date(),
      rejectedBy: adminId,
    },
  });

  await prisma.notification.create({
    data: {
      userId: product.seller.userId,
      title: "Product Rejected",
      message: `Your product "${product.name}" has been rejected.\nReason: ${reason}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId,
      action: "REJECT_PRODUCT",
      entityId: product.id,
      entityType: "PRODUCT",
      details: { productName: product.name, reason },
    },
  });

  logger.info(`Admin ${adminId} rejected product ${productId}: ${reason}`);
  return updated;
};

// ---- Order oversight ----

const resolveDateRange = ({ datePreset, dateFrom, dateTo }) => {
  if (dateFrom || dateTo) {
    return {
      gte: dateFrom ? new Date(dateFrom) : undefined,
      lte: dateTo ? new Date(dateTo) : undefined,
    };
  }
  if (!datePreset) return undefined;

  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (datePreset === "today") return { gte: startOfDay(now) };
  if (datePreset === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { gte: startOfDay(y), lt: startOfDay(now) };
  }
  if (datePreset === "last7days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { gte: d };
  }
  if (datePreset === "last30days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { gte: d };
  }
  return undefined;
};

export const getAllOrdersForAdmin = async (query = {}) => {
  const {
    search,
    orderStatus,
    paymentStatus,
    paymentMethod,
    sellerId,
    customerId,
    categoryId,
    brandId,
    sortBy,
    page = 1,
    limit = 20,
  } = query;

  const where = {};
  if (orderStatus) where.orderStatus = orderStatus;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (sellerId) where.sellerId = sellerId;
  if (customerId) where.userId = customerId;

  const dateRange = resolveDateRange(query);
  if (dateRange) where.createdAt = dateRange;

  if (categoryId || brandId) {
    where.items = {
      some: {
        product: {
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
        },
      },
    };
  }

  if (search) {
    const orConditions = [
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
      { seller: { businessName: { contains: search } } },
      { items: { some: { productName: { contains: search } } } },
    ];
    if (!isNaN(Number(search))) {
      orConditions.push({ id: Number(search) });
    }
    where.OR = orConditions;
  }

  const orderBy =
    sortBy === "oldest"
      ? { createdAt: "asc" }
      : sortBy === "amount_high"
        ? { totalAmount: "desc" }
        : sortBy === "amount_low"
          ? { totalAmount: "asc" }
          : { createdAt: "desc" };

  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        seller: { select: { businessName: true } },
        items: { select: { productName: true }, take: 1 },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getOrderStatsForAdmin = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, today, pending, delivered, cancelled] = await prisma.$transaction([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
  ]);

  return {
    totalOrders: total,
    todaysOrders: today,
    pendingOrders: pending,
    deliveredOrders: delivered,
    cancelledOrders: cancelled,
  };
};

export const getOrderByIdForAdmin = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
      seller: { select: { businessName: true } },
    },
  });
  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }
  return order;
};

// ---- Sellers list ----

export const getAllSellersForAdmin = async ({ status, search } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (search) where.businessName = { contains: search };

  const sellers = await prisma.seller.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return sellers;
};

export const getSellerByIdForAdmin = async (id) => {
  const seller = await prisma.seller.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      sellerAddress: true,
      bankAccount: { select: { accountHolderName: true, accountLastFour: true, bankName: true, ifscCode: true } },
      _count: { select: { products: true, orders: true } },
    },
  });
  if (!seller) {
    const err = new Error("Seller not found");
    err.statusCode = 404;
    throw err;
  }
  return seller;
};

// ---- Customers ----

const safeCustomerList = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  status: user.status,
  createdAt: user.createdAt,
  orderCount: user._count.orders,
});

export const getAllCustomers = async ({ search, status } = {}) => {
  const where = { role: "CUSTOMER" };
  if (status) where.status = status;
  if (search) {
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
  }

  const users = await prisma.user.findMany({
    where,
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return users.map(safeCustomerList);
};

export const getCustomerByIdForAdmin = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id, role: "CUSTOMER" },
    include: {
      addresses: true,
      _count: { select: { orders: true, wishlists: true } },
      cart: { include: { _count: { select: { items: true } } } },
    },
  });
  if (!user) {
    const err = new Error("Customer not found");
    err.statusCode = 404;
    throw err;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    createdAt: user.createdAt,
    addresses: user.addresses,
    orderCount: user._count.orders,
    wishlistCount: user._count.wishlists,
    cartItemCount: user.cart?._count.items ?? 0,
  };
};

// ---- Analytics ----

export const getAnalyticsForAdmin = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);
  const startOfLast7Days = new Date(startOfToday);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);

  const [
    totalRevenueResult,
    todayRevenueResult,
    monthRevenueResult,
    orderStatusCounts,
    totalCustomers,
    newCustomersToday,
    blockedCustomers,
    sellerStatusCounts,
    pendingApplications,
    newSellersThisMonth,
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalCategories,
    totalBrands,
    codOrders,
    onlineOrders,
    failedPayments,
    refundedPayments,
    recentOrders,
    recentOrderItems,
  ] = await prisma.$transaction([
    prisma.order.aggregate({ where: { orderStatus: "DELIVERED" }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { orderStatus: "DELIVERED", createdAt: { gte: startOfToday } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { orderStatus: "DELIVERED", createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.order.groupBy({ by: ["orderStatus"], _count: true }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { role: "CUSTOMER", status: "BLOCKED" } }),
    prisma.seller.groupBy({ by: ["status"], _count: true }),
    prisma.sellerApplication.count({ where: { status: "PENDING" } }),
    prisma.seller.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.product.count({ where: { isDeleted: false, isActive: true } }),
    prisma.product.count({ where: { isDeleted: false, inventory: { stock: 0 } } }),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.order.count({ where: { paymentMethod: "COD" } }),
    prisma.order.count({ where: { paymentMethod: "ONLINE" } }),
    prisma.order.count({ where: { paymentStatus: "FAILED" } }),
    prisma.order.count({ where: { paymentStatus: "REFUNDED" } }),
    // For trend charts and top-sellers, fetched raw and reduced in JS below —
    // simpler and portable than DB-specific date-truncation SQL for this scale.
    prisma.order.findMany({
      where: { createdAt: { gte: startOfLast30Days } },
      select: { createdAt: true, totalAmount: true, orderStatus: true, sellerId: true, seller: { select: { businessName: true } } },
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: startOfLast30Days } } },
      select: { productId: true, productName: true, quantity: true, subtotal: true, product: { select: { category: { select: { name: true } } } } },
    }),
  ]);

  const orderStatusMap = Object.fromEntries(orderStatusCounts.map((r) => [r.orderStatus, r._count]));
  const sellerStatusMap = Object.fromEntries(sellerStatusCounts.map((r) => [r.status, r._count]));

  const avgOrderValue =
    orderStatusMap.DELIVERED > 0 ? Math.round((totalRevenueResult._sum.totalAmount || 0) / orderStatusMap.DELIVERED) : 0;

  // Revenue trend: last 30 days, revenue only counted from delivered orders
  const revenueByDay = {};
  const ordersByDay = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(startOfLast30Days);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = 0;
    ordersByDay[key] = 0;
  }
  recentOrders.forEach((o) => {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (key in ordersByDay) ordersByDay[key] += 1;
    if (o.orderStatus === "DELIVERED" && key in revenueByDay) revenueByDay[key] += Number(o.totalAmount);
  });
  const revenueTrend = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));
  const ordersTrend = Object.entries(ordersByDay)
    .filter(([date]) => date >= startOfLast7Days.toISOString().slice(0, 10))
    .map(([date, count]) => ({ date, count }));

  // Top sellers by revenue (last 30 days), aggregated in JS
  const sellerRevenue = {};
  recentOrders.forEach((o) => {
    if (!o.sellerId) return;
    if (!sellerRevenue[o.sellerId]) sellerRevenue[o.sellerId] = { name: o.seller?.businessName, orders: 0, revenue: 0 };
    sellerRevenue[o.sellerId].orders += 1;
    sellerRevenue[o.sellerId].revenue += Number(o.totalAmount);
  });
  const topSellers = Object.values(sellerRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Top products by revenue (last 30 days)
  const productRevenue = {};
  const categoryRevenue = {};
  recentOrderItems.forEach((item) => {
    const key = item.productId;
    if (!productRevenue[key]) productRevenue[key] = { name: item.productName, orders: 0, revenue: 0 };
    productRevenue[key].orders += item.quantity;
    productRevenue[key].revenue += Number(item.subtotal);

    const catName = item.product?.category?.name || "Uncategorized";
    if (!categoryRevenue[catName]) categoryRevenue[catName] = { name: catName, orders: 0, revenue: 0 };
    categoryRevenue[catName].orders += item.quantity;
    categoryRevenue[catName].revenue += Number(item.subtotal);
  });
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const topCategories = Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return {
    revenue: {
      total: totalRevenueResult._sum.totalAmount || 0,
      today: todayRevenueResult._sum.totalAmount || 0,
      thisMonth: monthRevenueResult._sum.totalAmount || 0,
      avgOrderValue,
    },
    orders: {
      total: Object.values(orderStatusMap).reduce((a, b) => a + b, 0),
      pending: orderStatusMap.PENDING || 0,
      confirmed: orderStatusMap.CONFIRMED || 0,
      shipped: orderStatusMap.SHIPPED || 0,
      delivered: orderStatusMap.DELIVERED || 0,
      cancelled: orderStatusMap.CANCELLED || 0,
    },
    customers: {
      total: totalCustomers,
      newToday: newCustomersToday,
      blocked: blockedCustomers,
    },
    sellers: {
      total: (sellerStatusMap.VERIFIED || 0) + (sellerStatusMap.SUSPENDED || 0),
      pendingApplications,
      verified: sellerStatusMap.VERIFIED || 0,
      suspended: sellerStatusMap.SUSPENDED || 0,
      newThisMonth: newSellersThisMonth,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts,
      outOfStock: outOfStockProducts,
      categories: totalCategories,
      brands: totalBrands,
    },
    payments: {
      cod: codOrders,
      online: onlineOrders,
      failed: failedPayments,
      refunded: refundedPayments,
    },
    revenueTrend,
    ordersTrend,
    topProducts,
    topSellers,
    topCategories,
  };
};