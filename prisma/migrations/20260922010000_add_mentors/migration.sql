-- CreateTable
CREATE TABLE IF NOT EXISTS "mentors" (
    "id" SERIAL NOT NULL,
    "prefix" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "trainingGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "training_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
