-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 14,
    "firstPartSessions" INTEGER NOT NULL DEFAULT 7,
    "attendanceThreshold" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
