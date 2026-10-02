/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the column `ifscCode` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the column `shopDescription` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the column `shopName` on the `sellers` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `sellers` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `Enum(EnumId(9))`.
  - A unique constraint covering the columns `[sellerCode]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicationId]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sellerAddressId]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationId` to the `sellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `sellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileNumber` to the `sellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `sellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerAddressId` to the `sellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerCode` to the `sellers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sellers` DROP COLUMN `bankAccount`,
    DROP COLUMN `ifscCode`,
    DROP COLUMN `isVerified`,
    DROP COLUMN `shopDescription`,
    DROP COLUMN `shopName`,
    ADD COLUMN `applicationId` INTEGER NOT NULL,
    ADD COLUMN `businessDescription` VARCHAR(191) NULL,
    ADD COLUMN `businessName` VARCHAR(191) NOT NULL,
    ADD COLUMN `isPayoutSetup` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mobileNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `ownerName` VARCHAR(191) NOT NULL,
    ADD COLUMN `sellerAddressId` INTEGER NOT NULL,
    ADD COLUMN `sellerCode` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('VERIFIED', 'SUSPENDED') NOT NULL DEFAULT 'VERIFIED';

-- CreateTable
CREATE TABLE `seller_addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller_applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `businessType` ENUM('INDIVIDUAL', 'SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'LLP', 'OTHER') NOT NULL,
    `gstNumber` VARCHAR(191) NULL,
    `panNumber` VARCHAR(191) NULL,
    `sellerAddressId` INTEGER NOT NULL,
    `businessDescription` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `rejectionReason` VARCHAR(191) NULL,
    `reviewedByAdminId` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seller_applications_sellerAddressId_key`(`sellerAddressId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` INTEGER NOT NULL,
    `type` ENUM('GST_CERTIFICATE', 'PAN_CARD', 'ADDRESS_PROOF', 'CANCELLED_CHEQUE', 'OTHER') NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller_bank_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sellerId` INTEGER NOT NULL,
    `accountHolderName` VARCHAR(191) NOT NULL,
    `accountNumberEncrypted` VARCHAR(191) NOT NULL,
    `accountLastFour` VARCHAR(191) NOT NULL,
    `ifscCode` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seller_bank_accounts_sellerId_key`(`sellerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `sellers_sellerCode_key` ON `sellers`(`sellerCode`);

-- CreateIndex
CREATE UNIQUE INDEX `sellers_applicationId_key` ON `sellers`(`applicationId`);

-- CreateIndex
CREATE UNIQUE INDEX `sellers_sellerAddressId_key` ON `sellers`(`sellerAddressId`);

-- AddForeignKey
ALTER TABLE `seller_applications` ADD CONSTRAINT `seller_applications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_applications` ADD CONSTRAINT `seller_applications_sellerAddressId_fkey` FOREIGN KEY (`sellerAddressId`) REFERENCES `seller_addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_applications` ADD CONSTRAINT `seller_applications_reviewedByAdminId_fkey` FOREIGN KEY (`reviewedByAdminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_documents` ADD CONSTRAINT `seller_documents_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `seller_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sellers` ADD CONSTRAINT `sellers_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `seller_applications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sellers` ADD CONSTRAINT `sellers_sellerAddressId_fkey` FOREIGN KEY (`sellerAddressId`) REFERENCES `seller_addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_bank_accounts` ADD CONSTRAINT `seller_bank_accounts_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `sellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
