import prisma from "../../config/prisma.js";
import { slugify } from "../../utils/slugify.util.js";

/**
 * Ensures slug uniqueness by appending -1, -2, etc. if the base slug
 * is already taken. Runs on create, and on update only if name changed.
 */
const generateUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

const assertParentExists = async (parentId) => {
  if (!parentId) return;
  const parent = await prisma.category.findUnique({ where: { id: parentId } });
  if (!parent) {
    const err = new Error("Parent category not found");
    err.statusCode = 404;
    throw err;
  }
};

export const createCategory = async (data) => {
  await assertParentExists(data.parentId);
  const slug = await generateUniqueSlug(data.name);
  return prisma.category.create({ data: { ...data, slug } });
};

export const getAllCategories = async ({ parentId } = {}) => {
  const where = {};
  if (parentId === "null") where.parentId = null; // top-level only
  else if (parentId) where.parentId = Number(parentId);

  return prisma.category.findMany({
    where,
    include: { children: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }
  return category;
};

export const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }
  return category;
};

export const updateCategory = async (id, data) => {
  const existing = await getCategoryById(id);

  if (data.parentId) {
    if (data.parentId === id) {
      const err = new Error("A category cannot be its own parent");
      err.statusCode = 400;
      throw err;
    }
    await assertParentExists(data.parentId);
  }

  const updateData = { ...data };
  if (data.name && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, id);
  }

  return prisma.category.update({ where: { id }, data: updateData });
};

export const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  // Block deletion if subcategories still exist — silently reassigning
  // or orphaning a whole subtree on delete is surprising and destructive.
  // Admin must explicitly reassign/delete children first.
  if (category.children.length > 0) {
    const err = new Error("Cannot delete a category that has subcategories. Remove or reassign them first.");
    err.statusCode = 409;
    throw err;
  }

  await prisma.category.delete({ where: { id } });
};