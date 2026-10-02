import prisma from "../../config/prisma.js";

const getSellerOrThrow = async (userId) => {
    const seller = await prisma.seller.findUnique({
        where: { userId },
        include: { user: { select: { name: true, email: true, phone: true } }, sellerAddress: true },
    });
    if (!seller) {
        const err = new Error("Seller profile not found");
        err.statusCode = 403;
        throw err;
    }
    return seller;
};

const safeSellerProfile = (seller) => ({
    avatar: seller.avatar,
    ownerName: seller.ownerName,
    email: seller.user.email,
    mobileNumber: seller.mobileNumber,
    businessName: seller.businessName,
    displayName: seller.displayName || seller.businessName,
    gstNumber: seller.gstNumber,
    panNumber: seller.panNumber,
    address: seller.sellerAddress,
    sellerId: seller.sellerCode,
    joinedDate: seller.createdAt,
    status: seller.status,
});

export const getMyProfile = async (userId) => {
    const seller = await getSellerOrThrow(userId);
    return safeSellerProfile(seller);
};

export const updateMyProfile = async (userId, data) => {
    const seller = await getSellerOrThrow(userId);
    const { address, ...sellerFields } = data;

    if (address) {
        await prisma.sellerAddress.update({ where: { id: seller.sellerAddressId }, data: address });
    }
    if (Object.keys(sellerFields).length > 0) {
        await prisma.seller.update({ where: { id: seller.id }, data: sellerFields });
    }

    return getMyProfile(userId);
};

export const updateMyAvatar = async (userId, avatarUrl) => {
    const seller = await getSellerOrThrow(userId);
    await prisma.seller.update({ where: { id: seller.id }, data: { avatar: avatarUrl } });
    return getMyProfile(userId);
};