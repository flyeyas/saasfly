export const SubscriptionPlan = {
  FREE: "FREE",
  PRO: "PRO",
  BUSINESS: "BUSINESS",
} as const;
export type SubscriptionPlan =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];
export const Status = {
  PENDING: "PENDING",
  CREATING: "CREATING",
  INITING: "INITING",
  RUNNING: "RUNNING",
  STOPPED: "STOPPED",
  DELETED: "DELETED",
} as const;
export type Status = (typeof Status)[keyof typeof Status];
export const VerificationCodeType = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  LOGIN_VERIFICATION: "LOGIN_VERIFICATION",
} as const;
export type VerificationCodeType =
  (typeof VerificationCodeType)[keyof typeof VerificationCodeType];
export const AdType = {
  ADSENSE: "ADSENSE",
  BANNER: "BANNER",
  TEXT: "TEXT",
  VIDEO: "VIDEO",
} as const;
export type AdType = (typeof AdType)[keyof typeof AdType];
export const AdPosition = {
  HEADER: "HEADER",
  SIDEBAR: "SIDEBAR",
  FOOTER: "FOOTER",
  IN_CONTENT: "IN_CONTENT",
  MOBILE_BANNER: "MOBILE_BANNER",
} as const;
export type AdPosition = (typeof AdPosition)[keyof typeof AdPosition];
export const ConfigCategory = {
  SMTP: "SMTP",
  WEBSITE: "WEBSITE",
  SEO: "SEO",
  SECURITY: "SECURITY",
  NOTIFICATION: "NOTIFICATION",
  GENERAL: "GENERAL",
} as const;
export type ConfigCategory =
  (typeof ConfigCategory)[keyof typeof ConfigCategory];
export const EmailType = {
  WELCOME: "WELCOME",
  PASSWORD_RESET: "PASSWORD_RESET",
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  NOTIFICATION: "NOTIFICATION",
  NEWSLETTER: "NEWSLETTER",
  SYSTEM_ALERT: "SYSTEM_ALERT",
} as const;
export type EmailType = (typeof EmailType)[keyof typeof EmailType];
