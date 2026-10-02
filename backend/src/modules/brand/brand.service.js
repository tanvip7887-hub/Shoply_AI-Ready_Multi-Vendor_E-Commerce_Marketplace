import prisma from "../../config/prisma.js";
import { slugify } from "../../utils/slugify.util.js";

const generateUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

export const createBrand = async (data) => {
  const existing = await prisma.brand.findUnique({ where: { name: data.name } });
  if (existing) {
    const err = new Error("A brand with this name already exists");
    err.statusCode = 409;
    throw err;
  }

  const slug = await generateUniqueSlug(data.name);
  return prisma.brand.create({ data: { ...data, slug } });
};

export const getAllBrands = async ({ isActive } = {}) => {
  const where = {};
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;

  return prisma.brand.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const getBrandById = async (id) => {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    const err = new Error("Brand not found");
    err.statusCode = 404;
    throw err;
  }
  return brand;
};

export const updateBrand = async (id, data) => {
  const existing = await getBrandById(id);

  if (data.name && data.name !== existing.name) {
    const nameTaken = await prisma.brand.findUnique({ where: { name: data.name } });
    if (nameTaken) {
      const err = new Error("A brand with this name already exists");
      err.statusCode = 409;
      throw err;
    }
  }

  const updateData = { ...data };
  if (data.name && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, id);
  }

  return prisma.brand.update({ where: { id }, data: updateData });
};

export const setBrandStatus = async (id, isActive) => {
  await getBrandById(id);
  return prisma.brand.update({ where: { id }, data: { isActive } });
};

export const deleteBrand = async (id) => {
  await getBrandById(id);

  const productCount = await prisma.product.count({ where: { brandId: id } }).catch(() => 0);
  // .catch(() => 0) is temporary: the `product` module doesn't exist yet,
  // so `prisma.product` isn't defined. Once product ships with a brandId
  // foreign key, remove the .catch and let this check work for real —
  // deleting a brand that's in use by live products should be blocked,
  // same as we did for categories with children.

  if (productCount > 0) {
    const err = new Error("Cannot delete a brand that has products. Deactivate it instead.");
    err.statusCode = 409;
    throw err;
  }

  await prisma.brand.delete({ where: { id } });
};