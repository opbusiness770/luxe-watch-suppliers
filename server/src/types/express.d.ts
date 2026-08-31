export {};

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        username: string;
        role: "ADMIN" | "SUPPLIER";
        supplierId: string | null;
      };
    }
  }
}