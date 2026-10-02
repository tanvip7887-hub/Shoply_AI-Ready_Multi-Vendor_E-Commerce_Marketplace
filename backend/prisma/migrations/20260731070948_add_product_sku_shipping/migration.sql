/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `height` DECIMAL(8, 2) NULL,
    ADD COLUMN `length` DECIMAL(8, 2) NULL,
    ADD COLUMN `sku` VARCHAR(191) NULL,
    ADD COLUMN `weight` DECIMAL(8, 2) NULL,
    ADD COLUMN `width` DECIMAL(8, 2) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `products_sku_key` ON `products`(`sku`);
