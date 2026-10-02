import prisma from "../../config/prisma.js";
import { encrypt } from "../../utils/encryption.util.js";

const getSellerOrThrow = async (userId) => {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
        const err = new Error("Seller profile not found");
        err.statusCode = 403;
        throw err;
    }
    return seller;
};

const maskedBankAccount = (bankAccount) => {
    if (!bankAccount) return null;
    return {
        id: bankAccount.id,
        accountHolderName: bankAccount.accountHolderName,
        bankName: bankAccount.bankName,
        ifscCode: bankAccount.ifscCode,
        // Only ever expose the last four digits, never the real number.
        accountNumberMasked: `********${bankAccount.accountLastFour}`,
        isVerified: bankAccount.isVerified,
        createdAt: bankAccount.createdAt,
        updatedAt: bankAccount.updatedAt,
    };
};

export const getMyBankAccount = async (userId) => {
    const seller = await getSellerOrThrow(userId);
    const bankAccount = await prisma.sellerBankAccount.findUnique({ where: { sellerId: seller.id } });
    return maskedBankAccount(bankAccount);
};

export const saveBankAccount = async (userId, { accountHolderName, bankName, accountNumber, ifscCode }) => {
    const seller = await getSellerOrThrow(userId);

    const accountNumberEncrypted = encrypt(accountNumber);
    const accountLastFour = accountNumber.slice(-4);

    // Upsert: first-time setup creates the row, editing later updates it —
    // matches "Seller should be able to view/update/change bank details."
    // Re-editing resets isVerified since the details actually changed.
    const bankAccount = await prisma.sellerBankAccount.upsert({
        where: { sellerId: seller.id },
        create: {
            sellerId: seller.id,
            accountHolderName,
            bankName,
            accountNumberEncrypted,
            accountLastFour,
            ifscCode,
        },
        update: {
            accountHolderName,
            bankName,
            accountNumberEncrypted,
            accountLastFour,
            ifscCode,
            isVerified: false,
        },
    });

    // First successful save is what flips the seller's selling-eligibility
    // gate — matches product.service.js's existing isPayoutSetup check.
    if (!seller.isPayoutSetup) {
        await prisma.seller.update({ where: { id: seller.id }, data: { isPayoutSetup: true } });
    }

    return maskedBankAccount(bankAccount);
};

export const getSellerPaymentsSummary = async (userId, { status } = {}) => {
  const seller = await getSellerOrThrow(userId);
  const bankAccount = await prisma.sellerBankAccount.findUnique({ where: { sellerId: seller.id } });
  const maskedBank = maskedBankAccount(bankAccount);

  const orders = await prisma.order.findMany({
    where: { sellerId: seller.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { select: { id: true, productName: true, price: true, quantity: true, subtotal: true } },
      shipment: { select: { trackingNumber: true, shipmentStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let totalEarnings = 0;
  let pendingSettlement = 0;
  let paidSettlements = 0;
  let refundsAdjustments = 0;

  orders.forEach((order) => {
    const amount = Number(order.totalAmount);
    if (order.orderStatus === "CANCELLED" || order.paymentStatus === "REFUNDED") {
      refundsAdjustments += amount;
    } else {
      totalEarnings += amount;
      if (order.paymentStatus === "PAID") {
        paidSettlements += amount;
      } else {
        pendingSettlement += amount;
      }
    }
  });

  const pendingDeliveredOrders = orders.filter(
    (o) => o.orderStatus !== "CANCELLED" && o.paymentStatus === "PENDING"
  );
  const nextSettlementAmount = pendingDeliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const transactions = orders.map((order) => {
    const amount = Number(order.totalAmount);
    const isRefunded = order.orderStatus === "CANCELLED" || order.paymentStatus === "REFUNDED";
    const isPaid = order.paymentStatus === "PAID";

    let txStatus = "Pending";
    if (isRefunded) txStatus = "Refunded";
    else if (isPaid) txStatus = "Paid";

    return {
      id: order.id,
      orderRef: `#ORD${order.id}`,
      date: order.createdAt,
      orderAmount: amount,
      refund: isRefunded ? amount : 0,
      adjustment: 0,
      netAmount: isRefunded ? 0 : amount,
      status: txStatus,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customerName: order.user?.name || "Customer",
      itemsCount: order.items.length,
      items: order.items,
    };
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (!status || status === "ALL") return true;
    return tx.status.toUpperCase() === status.toUpperCase();
  });

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const settlements = [];

  if (paidOrders.length > 0) {
    const paidSum = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const latestPaidDate = paidOrders[0].paidAt || paidOrders[0].updatedAt;
    settlements.push({
      settlementId: `SET-1001`,
      settlementDate: latestPaidDate,
      amount: paidSum,
      ordersCount: paidOrders.length,
      status: "PAID",
    });
  }

  if (pendingDeliveredOrders.length > 0) {
    const pendingSum = pendingDeliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    settlements.push({
      settlementId: `SET-1002`,
      settlementDate: nextDate,
      amount: pendingSum,
      ordersCount: pendingDeliveredOrders.length,
      status: "PROCESSING",
    });
  }

  return {
    summary: {
      totalEarnings,
      pendingSettlement,
      paidSettlements,
      refundsAdjustments,
    },
    nextSettlement: {
      amount: nextSettlementAmount,
      status: nextSettlementAmount > 0 ? "Scheduled for next settlement cycle" : "No pending settlements",
      payoutAccount: maskedBank
        ? {
            configured: true,
            bankName: maskedBank.bankName,
            accountLastFour: maskedBank.accountNumberMasked.slice(-4),
            maskedText: `${maskedBank.bankName} •••• ${maskedBank.accountNumberMasked.slice(-4)}`,
          }
        : {
            configured: false,
            maskedText: "Payout account not set up",
          },
    },
    transactions: filteredTransactions,
    settlements,
  };
};