export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type TokenOut = {
  token: string;
  token_type: "bearer";
  refresh_token?: string | null;
};

export type UserIn = {
  username: string;
  password: string;
};

export type RegisterIn = {
  username: string;
  password: string;
};

export type UserRole = 
    | "admin"
    | "manager"
    | "software_engineer"
    | "cybersecurity_engineer";

export type UserPublic = {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};
