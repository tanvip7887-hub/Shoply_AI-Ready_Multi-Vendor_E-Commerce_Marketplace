import prisma from "../../config/prisma.js";

export const getAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

export const getAddressById = async (userId, addressId) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    const err = new Error("Address not found");
    err.statusCode = 404;
    throw err;
  }

  return address;
};

export const createAddress = async (userId, data) => {
  const count = await prisma.address.count({ where: { userId } });
  const isFirstAddress = count === 0;
  
  // If no addresses exist, force this one to be default
  let shouldBeDefault = isFirstAddress || data.isDefault === true;

  // Omit fields not present in the Prisma schema
  const { ...addressData } = data;

  if (shouldBeDefault && !isFirstAddress) {
    // If setting as default and others exist, reset others first
    return prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
      return tx.address.create({
        data: { ...addressData, userId, isDefault: true },
      });
    });
  }

  return prisma.address.create({
    data: { ...addressData, userId, isDefault: shouldBeDefault },
  });
};

export const updateAddress = async (userId, addressId, data) => {
  await getAddressById(userId, addressId); // Verifies ownership

  // Exclude isDefault and fields not in schema to prevent bypassing logic
  const { isDefault, ...updateData } = data;

  return prisma.address.update({
    where: { id: addressId },
    data: updateData,
  });
};

export const deleteAddress = async (userId, addressId) => {
  const address = await getAddressById(userId, addressId);

  if (address.isDefault) {
    // Need to assign a new default if other addresses remain
    return prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: addressId } });

      const remainingAddresses = await tx.address.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        take: 1,
      });

      if (remainingAddresses.length > 0) {
        await tx.address.update({
          where: { id: remainingAddresses[0].id },
          data: { isDefault: true },
        });
      }
    });
  }

  return prisma.address.delete({ where: { id: addressId } });
};

export const setDefaultAddress = async (userId, addressId) => {
  await getAddressById(userId, addressId); // Verifies ownership

  return prisma.$transaction(async (tx) => {
    // Unset current default
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set new default
    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });
};
