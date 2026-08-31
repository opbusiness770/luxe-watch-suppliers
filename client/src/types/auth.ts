export type UserRole =
  | "ADMIN"
  | "SUPPLIER";

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
  supplierId: string | null;
};