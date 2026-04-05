-- Create enums for anonymous post-vote user data
CREATE TYPE "Province" AS ENUM (
  'CENTRAL',
  'COPPERBELT',
  'EASTERN',
  'LUAPULA',
  'LUSAKA',
  'MUCHINGA',
  'NORTHERN',
  'NORTH_WESTERN',
  'SOUTHERN',
  'WESTERN'
);

CREATE TYPE "AgeGroup" AS ENUM (
  'AGE_18_24',
  'AGE_25_34',
  'AGE_35_44',
  'AGE_45_54',
  'AGE_55_PLUS'
);

CREATE TYPE "Gender" AS ENUM (
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'PREFER_NOT_TO_SAY'
);

-- Create table for optional anonymous data collected after voting
CREATE TABLE "post_vote_insights" (
  "id" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  "voterToken" TEXT NOT NULL,
  "province" "Province",
  "ageGroup" "AgeGroup",
  "gender" "Gender",
  "questionSuggestion" VARCHAR(200),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "post_vote_insights_pkey" PRIMARY KEY ("id")
);

-- One anonymous voter token can submit one post-vote insight per poll
CREATE UNIQUE INDEX "post_vote_insights_pollId_voterToken_key"
  ON "post_vote_insights"("pollId", "voterToken");

CREATE INDEX "post_vote_insights_pollId_idx"
  ON "post_vote_insights"("pollId");

CREATE INDEX "post_vote_insights_createdAt_idx"
  ON "post_vote_insights"("createdAt");

ALTER TABLE "post_vote_insights"
  ADD CONSTRAINT "post_vote_insights_pollId_fkey"
  FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
