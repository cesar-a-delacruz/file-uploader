-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);
