import type { ColumnType } from "kysely";

import type { Status, SubscriptionPlan, VerificationCodeType } from "./enums";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Account = {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type Authenticator = {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
};
export type Customer = {
  id: Generated<number>;
  authUserId: string;
  name: string | null;
  plan: SubscriptionPlan | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Timestamp | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type K8sClusterConfig = {
  id: Generated<number>;
  name: string;
  location: string;
  authUserId: string;
  plan: Generated<SubscriptionPlan | null>;
  network: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  status: Generated<Status | null>;
  delete: Generated<boolean | null>;
};
export type Session = {
  id: Generated<string>;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
};
export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Timestamp | null;
  image: string | null;
  password: string | null;
  loginAttempts: Generated<number>;
  lockedUntil: Timestamp | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: Timestamp | null;
};
export type VerificationCode = {
  id: string;
  email: string;
  code: string;
  type: VerificationCodeType;
  expiresAt: Timestamp;
  used: Generated<boolean>;
  userId: string | null;
  createdAt: Generated<Timestamp>;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Timestamp;
};
export type DB = {
  Account: Account;
  Authenticator: Authenticator;
  Customer: Customer;
  K8sClusterConfig: K8sClusterConfig;
  Session: Session;
  users: User;
  verification_codes: VerificationCode;
  VerificationToken: VerificationToken;
};
