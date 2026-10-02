import prisma from "../../config/prisma.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.util.js";

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return safeUser(user);
};

export const updateProfile = async (userId, data) => {
  const payload = { ...data };
  if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth);
  const user = await prisma.user.update({ where: { id: userId }, data: payload });
  return safeUser(user);
};

export const updateAvatar = async (userId, fileBuffer) => {
  const result = await uploadBufferToCloudinary(fileBuffer, "meesho_clone/avatars");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: result.secure_url },
  });
  return safeUser(user);
};

// ---- Addresses ----

export const listAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

const assertOwnership = async (userId, addressId) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    const err = new Error("Address not found");
    err.statusCode = 404;
    throw err;
  }
  return address;
};

export const createAddress = async (userId, data) => {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.create({ data: { ...data, userId } });
};

export const updateAddress = async (userId, addressId, data) => {
  await assertOwnership(userId, addressId);
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.update({ where: { id: addressId }, data });
};

export const deleteAddress = async (userId, addressId) => {
  await assertOwnership(userId, addressId);
  await prisma.address.delete({ where: { id: addressId } });
};

export const setDefaultAddress = async (userId, addressId) => {
  await assertOwnership(userId, addressId);
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);
};