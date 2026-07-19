import { createRemoteJWKSet, jwtVerify } from "jose";
import { getSql } from "./db";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyFirebaseIdToken(token) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured");
  }
  if (!token) {
    throw new Error("Missing auth token");
  }

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  return {
    uid: payload.sub,
    email: payload.email || null,
  };
}

/** Requires a valid Firebase token belonging to a users.role = 'admin' row. */
export async function requireAdmin(idToken) {
  const claims = await verifyFirebaseIdToken(idToken);
  const sql = getSql();
  const rows = await sql`
    SELECT id, role
    FROM users
    WHERE firebase_uid = ${claims.uid}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }

  return { ...claims, userId: user.id };
}
