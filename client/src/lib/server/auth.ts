import { error } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const SECRET = randomUUID();

export function generateLoginToken(userId: number): string {
  const token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });
  return token;
}

export function verifyLoginToken(token: string): number {
  try {
    const user = jwt.verify(token, SECRET) as { id: number };
    return user.id!;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw error(HttpStatusCodes.UNAUTHORIZED, "Token expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw error(HttpStatusCodes.UNAUTHORIZED, "Invalid token");
    }
    
    console.log("Error while verifying login token: ", err);
    throw error(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Unable to verify token");
  }
}

export function checkAuth(request: any): number {
  const auth = request?.headers?.get("authorization")?.split(" ");
  if (!auth) {
    throw error(HttpStatusCodes.UNAUTHORIZED, "No authorization header found.");
  }
  if (auth.length !== 2 || auth[0] !== "Bearer") {
    throw error(
      HttpStatusCodes.UNAUTHORIZED,
      "Invalid authorization header (requires bearer token)."
    );
  }

  return verifyLoginToken(auth[1]);
}
