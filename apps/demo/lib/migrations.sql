-- Alter table: Users
ALTER TABLE "users"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL,
ADD COLUMN "createdAt" TIMESTAMP NOT NULL,
ADD COLUMN "updatedAt" TIMESTAMP NOT NULL,
ADD COLUMN "twoFactorEnabled" BOOLEAN,
ADD COLUMN "role" TEXT,
ADD COLUMN "banned" BOOLEAN,
ADD COLUMN "banReason" TEXT,
ADD COLUMN "banExpires" TIMESTAMP;

-- Alter table: Tenants
ALTER TABLE "tenants"
ADD COLUMN "slug" TEXT NOT NULL,
ADD COLUMN "logo" TEXT,
ADD COLUMN "metadata" TEXT;

-- Alter table: Tenant Users
ALTER TABLE "tenant_users"
ADD COLUMN "id" UUID NOT NULL;

-- Create table: Invitation
CREATE TABLE "invitation" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "roles" TEXT[],
  "status" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "inviterId" UUID NOT NULL,
  PRIMARY KEY ("tenant_id", "id"),
  FOREIGN KEY ("tenant_id", "inviterId") REFERENCES "tenant_users" ("tenant_id", "user_id"),
  FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id")
);

-- Create table: Session
CREATE TABLE "session" (
  "id" UUID NOT NULL PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" UUID NOT NULL REFERENCES "users" ("id"),
  "activeOrganizationId" UUID,
  "impersonatedBy" TEXT
);

-- Create table: Account
CREATE TABLE "account" (
  "id" UUID NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES "users" ("id"),
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Create table: Verification
CREATE TABLE "verification" (
  "id" UUID NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);

-- Create table: TwoFactor
CREATE TABLE "twoFactor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES "users" ("id")
);

-- Create table: Passkey
CREATE TABLE "passkey" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT,
  "publicKey" TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES "users" ("id"),
  "webauthnUserID" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "deviceType" TEXT NOT NULL,
  "backedUp" BOOLEAN NOT NULL,
  "transports" TEXT,
  "createdAt" TIMESTAMP
);

-- Create table: ONLY NECESSARY FOR THE DEMO

CREATE TABLE todos (
    "id" UUID DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "title" VARCHAR(256),
    "complete" BOOLEAN
);