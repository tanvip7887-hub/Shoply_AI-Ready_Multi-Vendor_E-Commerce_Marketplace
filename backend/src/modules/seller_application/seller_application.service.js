import prisma from "../../config/prisma.js";
import { sendSellerApplicationSubmittedEmail } from "../notification/notification.service.js";

const getActiveApplication = async (userId) => {
    // "Active" = not yet finally rejected — a user can have historical
    // REJECTED rows, but only one DRAFT/PENDING/APPROVED at a time.
    return prisma.sellerApplication.findFirst({
        where: { userId, status: { in: ["DRAFT", "PENDING", "APPROVED"] } },
        include: { sellerAddress: true, documents: true },
        orderBy: { createdAt: "desc" },
    });
};

export const saveDraft = async (userId, data) => {
    const existing = await getActiveApplication(userId);

    if (existing && existing.status !== "DRAFT") {
        const err = new Error(`You already have an application with status ${existing.status}`);
        err.statusCode = 409;
        throw err;
    }

    const { address, ...appData } = data;

    if (existing) {
        // Update the draft in place, including its address if provided.
        if (address) {
            await prisma.sellerAddress.update({ where: { id: existing.sellerAddressId }, data: address });
        }
        return prisma.sellerApplication.update({
            where: { id: existing.id },
            data: appData,
            include: { sellerAddress: true, documents: true },
        });
    }

    // First-time draft: address is required to create the row at all,
    // since sellerAddressId is a required, unique foreign key.
    if (!address) {
        const err = new Error("Address is required to start an application");
        err.statusCode = 400;
        throw err;
    }

    const sellerAddress = await prisma.sellerAddress.create({ data: address });
    return prisma.sellerApplication.create({
        data: { ...appData, userId, sellerAddressId: sellerAddress.id, status: "DRAFT" },
        include: { sellerAddress: true, documents: true },
    });
};

export const submitApplication = async (userId, data) => {
    const existing = await getActiveApplication(userId);

    if (existing && existing.status !== "DRAFT") {
        const err = new Error(`You already have an application with status ${existing.status}`);
        err.statusCode = 409;
        throw err;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const { address, ...appData } = data;

    let app;
    if (existing) {
        if (address) {
            await prisma.sellerAddress.update({ where: { id: existing.sellerAddressId }, data: address });
        }
        app = await prisma.sellerApplication.update({
            where: { id: existing.id },
            data: { ...appData, status: "PENDING" },
            include: { sellerAddress: true, documents: true },
        });
    } else {
        const sellerAddress = await prisma.sellerAddress.create({ data: address });
        app = await prisma.sellerApplication.create({
            data: { ...appData, userId, sellerAddressId: sellerAddress.id, status: "PENDING" },
            include: { sellerAddress: true, documents: true },
        });
    }

    if (user && user.email) {
        sendSellerApplicationSubmittedEmail(user.email, appData.businessName || app.businessName).catch(() => {});
    }

    return app;
};


export const getMyApplication = async (userId) => {
    const application = await getActiveApplication(userId);
    if (!application) {
        const err = new Error("No application found");
        err.statusCode = 404;
        throw err;
    }
    return getActiveApplication(userId);
};

export const addDocument = async (userId, type, fileUrl) => {
    const application = await getActiveApplication(userId);
    if (!application) {
        const err = new Error("No application found. Save a draft first.");
        err.statusCode = 404;
        throw err;
    }
    if (application.status !== "DRAFT" && application.status !== "PENDING") {
        const err = new Error("Cannot upload documents to a finalized application");
        err.statusCode = 409;
        throw err;
    }
    return prisma.sellerDocument.create({ data: { applicationId: application.id, type, fileUrl } });
};