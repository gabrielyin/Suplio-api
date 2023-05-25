/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[account]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`cpf`);

-- CreateIndex
CREATE UNIQUE INDEX `User_account_key` ON `User`(`account`);
