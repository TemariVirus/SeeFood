import { error } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import type { IUser } from "$lib/server/entities";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const SECRET = randomUUID();

export function generateLoginToken(user: IUser): string {
  const token = jwt.sign(user, SECRET, { expiresIn: "1h" });
  return token;
}

export function verifyLoginToken(token: string): IUser {
  try {
    const user = jwt.verify(token, SECRET) as IUser;
    return user;
  } catch (err) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      throw error(HttpStatusCodes.UNAUTHORIZED, "Token expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw error(HttpStatusCodes.UNAUTHORIZED, "Invalid token");
    }

    throw error(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Unknown error");
  }
}

export function checkAuth(request: any) {
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
