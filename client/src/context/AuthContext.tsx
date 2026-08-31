import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  apiFetch,
  HttpError,
} from "../api/http";

import type {
  AuthUser,
} from "../types/auth";

type LoginResponse = {
  user: {
    id: string;
    username: string;
    role:
      | "ADMIN"
      | "SUPPLIER";

    supplier: {
      id: string;
      companyName: string;
    } | null;
  };
};

type MeResponse = {
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;

  login: (
    username: string,
    password: string,
  ) => Promise<AuthUser>;

  logout: () => Promise<void>;

  refreshUser:
    () => Promise<void>;
};

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const refreshUser =
    useCallback(async () => {
      try {
        const response =
          await apiFetch<MeResponse>(
            "/api/auth/me",
          );

        setUser(response.user);
      } catch (error) {
        if (
          error instanceof HttpError &&
          (
            error.status === 401 ||
            error.status === 403
          )
        ) {
          setUser(null);
          return;
        }

        setUser(null);
      }
    }, []);

  useEffect(() => {
    async function initializeAuth() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }

    void initializeAuth();
  }, [refreshUser]);

  async function login(
    username: string,
    password: string,
  ): Promise<AuthUser> {
    const response =
      await apiFetch<LoginResponse>(
        "/api/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

    const authenticatedUser:
      AuthUser = {
        id: response.user.id,

        username:
          response.user.username,

        role:
          response.user.role,

        supplierId:
          response.user.supplier
            ?.id ?? null,
      };

    setUser(authenticatedUser);

    return authenticatedUser;
  }

  async function logout():
    Promise<void> {
    try {
      await apiFetch(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth():
  AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}