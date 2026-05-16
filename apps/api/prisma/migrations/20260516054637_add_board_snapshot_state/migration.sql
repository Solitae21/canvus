/*
  Warnings:

  - Added the required column `state` to the `BoardSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BoardSnapshot" ADD COLUMN     "state" BYTEA NOT NULL;
