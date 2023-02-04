import { error } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export type TokenPayload = {
  userId: number;
  issueTime: Date;
};

const SECRET = randomUUID();

export const lastTokenResets = new Map<number, Date>();

export function generateLoginToken(userId: number): string {
  return jwt.sign(
    {
      userId: userId,
      issueTime: new Date(),
    } satisfies TokenPayload,
    SECRET,
    {
      expiresIn: 60 * 60 * 24 * 7,
    }
  );
}

export function verifyToken(token: string): TokenPayload {
  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, SECRET) as TokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw error(HttpStatusCodes.UNAUTHORIZED, "Token expired.");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw error(HttpStatusCodes.UNAUTHORIZED, "Invalid token.");
    }

    // Log unknown error
    console.log("Error while verifying login token: ", err);
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Unable to verify token."
    );
  }

  const lastReset = lastTokenResets.get(payload.userId);
  if (lastReset && lastReset > payload.issueTime) {
    throw error(HttpStatusCodes.UNAUTHORIZED, "Token expired.");
  }

  return payload;
}

export function getLoginToken(request: any): TokenPayload {
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

  return verifyToken(auth[1]);
}
