-- Make construction standards verifiable: track WHICH article inside the source
-- and whether `content` is a literal quote or an UltraCem-authored paraphrase.

ALTER TABLE "construction_standards"
ADD COLUMN "articleRef" VARCHAR(255),
ADD COLUMN "verbatim" BOOLEAN NOT NULL DEFAULT FALSE;
