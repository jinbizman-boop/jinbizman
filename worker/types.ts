export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  APP_BASE_URL: string;
  ADMIN_ALLOWED_ORIGINS: string;
  APP_ENV: string;
  SESSION_TTL_SECONDS: string;
  MOBILE_REFRESH_TTL_SECONDS?: string;
  PUBLIC_RATE_LIMIT_PER_10_MIN: string;
  PROTECTED_RATE_LIMIT_PER_10_MIN?: string;
  HIGH_RISK_RATE_LIMIT_PER_10_MIN?: string;
  INQUIRY_NOTIFY_TO?: string;
  INQUIRY_EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
  LOGIN_RATE_LIMIT_PER_10_MIN?: string;
  ASSETS: Fetcher;
  MEDIA_BUCKET?: R2Bucket;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  status: string;
  departmentId?: number | null;
  roles?: string[];
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  iat: number;
  exp: number;
  jti?: string;
  session_id?: string;
  token_type?: "access" | "refresh";
}
