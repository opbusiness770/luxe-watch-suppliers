import { jwtVerify, SignJWT } from "jose";

const TOKEN_ISSUER = "luxe-watch-api";
const TOKEN_AUDIENCE = "luxe-watch-users";

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(AUTH_SECRET);

export type AuthTokenPayload = {
  userId: string;
};

export async function createAuthToken(
  userId: string,
): Promise<string> {
  return new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setExpirationTime("8h")
    .sign(secretKey);
}

export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    if (typeof payload.userId !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch {
    return null;
  }
}