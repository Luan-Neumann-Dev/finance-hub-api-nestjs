-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "paid_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "expenses_paid_at_idx" ON "expenses"("paid_at");

-- CreateIndex
CREATE INDEX "expenses_installment_group_id_idx" ON "expenses"("installment_group_id");
