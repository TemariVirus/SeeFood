import { type IApiResult, HttpStatusCodes } from "$lib/server";
import { Query, SqlOperators, JoinType, UnionType } from "./query";

export default Query;

declare global {
    interface Promise<T> {
        ensureExists(toThrow?: string | Record<string, any>): Promise<T | string>;
    }
}

Promise.prototype.ensureExists = function <T>(
    this: Promise<T | undefined | null>,
    toThrow: string | Record<string, any> = { error: "Entity not found."}
): Promise<T | Record<string, any>> {
    if (typeof toThrow === "string") toThrow = { error: toThrow };
    return this.then((value) => value ?? toThrow as Record<string, any>);
};

// Check if an entity with the specified properties exists in the table
export async function checkExists(table: string, properties: Record<string, any>) {
    // Spilt properties into fields and values
    const fields = Object.keys(properties);
    const values = fields.map((field) => properties[field]);
    if (fields.length === 0)
        throw new Error("Must have at least one property to check.");

    // Create and execute query
    let innerQuery = Query.select()
        .from(table)
        .where(fields[0], SqlOperators.EQUAL);
    for (let i = 1; i < fields.length; i++)
        innerQuery = innerQuery.and(fields[i], SqlOperators.EQUAL);

    return await Query.exists(innerQuery)
        .execute(values)
        .then((result) => Object.values((result as any[])[0])[0] === 1);
}

// // Check authorization header and return user
// export async function checkAuth(req, res, then: (user: Entities.User) => any) {
//     // Ensure authorization header is present and valid
//     const authHeader = req.headers.authorization.split(" ");
//     if (authHeader.length !== 2 || authHeader[0] !== "Basic")
//       return res
//         .status(HttpStatusCodes.UNAUTHORIZED)
//         .json("Ensure that you are using basic authentication.");
//     const credentials = Buffer.from(authHeader[1], "base64")
//       .toString()
//       .split(":");
//     if (credentials.length !== 2)
//       return res
//         .status(HttpStatusCodes.BAD_REQUEST)
//         .json("Credentials were formmatted incorrectly.");

//     // Get user in database
//     const user = new Entities.User();
//     Object.assign(
//       user,
//       await Query.select()
//         .from(Entities.User)
//         .where("name", SqlOperators.EQUAL, credentials[0])
//         .limit(1)
//         .toArray()
//         .then((users) => (users as Entities.User[])[0])
//     );

//     // Check if user exists and password is correct
//     if (!user.name || !user.checkPassword(credentials[1]))
//       return res
//         .status(HttpStatusCodes.UNAUTHORIZED)
//         .json("Incorrect username or password.");

//     return then(user);
//   }

export { SqlOperators, JoinType, UnionType };