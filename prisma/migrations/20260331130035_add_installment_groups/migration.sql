-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "installment_group_id" INTEGER,
ADD COLUMN     "installment_number" INTEGER;

-- CreateTable
CREATE TABLE "installment_group" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "description" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "installment_group_user_id_idx" ON "installment_group"("user_id");

-- AddForeignKey
ALTER TABLE "installment_group" ADD CONSTRAINT "installment_group_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_group" ADD CONSTRAINT "installment_group_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_installment_group_id_fkey" FOREIGN KEY ("installment_group_id") REFERENCES "installment_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
