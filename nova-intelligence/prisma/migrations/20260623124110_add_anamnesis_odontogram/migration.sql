-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('HEALTHY', 'CAVITY', 'TREATED', 'TO_EXTRACT', 'EXTRACTED', 'IMPLANT');

-- CreateTable
CREATE TABLE "Anamnesis" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "smoker" BOOLEAN NOT NULL DEFAULT false,
    "alcoholic" BOOLEAN NOT NULL DEFAULT false,
    "brushDaily" BOOLEAN NOT NULL DEFAULT false,
    "flossDaily" BOOLEAN NOT NULL DEFAULT false,
    "physicalActivity" BOOLEAN NOT NULL DEFAULT false,
    "sleepProblems" BOOLEAN NOT NULL DEFAULT false,
    "allergicToMedication" BOOLEAN NOT NULL DEFAULT false,
    "allergicDetail" TEXT,
    "hadSurgery" BOOLEAN NOT NULL DEFAULT false,
    "surgeryDetail" TEXT,
    "pregnant" BOOLEAN NOT NULL DEFAULT false,
    "pregnancyWeeks" INTEGER,
    "hypertension" BOOLEAN NOT NULL DEFAULT false,
    "cardiopathy" BOOLEAN NOT NULL DEFAULT false,
    "peripheralArterial" BOOLEAN NOT NULL DEFAULT false,
    "familyCancer" BOOLEAN NOT NULL DEFAULT false,
    "familyDiabetes" BOOLEAN NOT NULL DEFAULT false,
    "familyHypertension" BOOLEAN NOT NULL DEFAULT false,
    "familyOther" BOOLEAN NOT NULL DEFAULT false,
    "familyOtherDetail" TEXT,
    "medications" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anamnesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToothRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "status" "ToothStatus" NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToothRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anamnesis_patientId_key" ON "Anamnesis"("patientId");

-- CreateIndex
CREATE INDEX "ToothRecord_patientId_idx" ON "ToothRecord"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "ToothRecord_patientId_toothNumber_key" ON "ToothRecord"("patientId", "toothNumber");

-- AddForeignKey
ALTER TABLE "Anamnesis" ADD CONSTRAINT "Anamnesis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToothRecord" ADD CONSTRAINT "ToothRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
