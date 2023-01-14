import express from "express";
import { Query, Operators, UnionType } from "./query";
import Entity, { Category, Restaurant, RestaurantCategory, User, Review, Reply, Comment } from "./entities";

export enum HttpStatusCodes {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501
}

const router = express.Router();

router.get("/ping", (_, res) => {
    res.status(HttpStatusCodes.OK)
        .send({
            message: "pong",
        });
});

router.get("/categories", async (_, res) => {
    res.status(HttpStatusCodes.OK)
        .send(await Query.select()
            .from(Category)
            .toArray());
});

router.get("/categories/:id/restaurants", (req, res) =>
    checkId(req, res, Category, async id => res.status(HttpStatusCodes.OK)
        .send(await Restaurant
            .getQuery()
            .where("rc.id", Operators.IN, Query.select("restaurant_id")
                .from(RestaurantCategory)
                .where("category_id", Operators.EQUAL, id))
            .toRestaurantArray())));

router.get("/restaurants", async (_, res) => {
    return res.status(HttpStatusCodes.OK)
        .send(await Restaurant
            .getQuery()
            .toRestaurantArray());
});

router.get("/restaurants/:id", (req, res) =>
    checkId(req, res, Restaurant, async id =>
        res.status(HttpStatusCodes.OK)
            .send(await Restaurant
                .getQuery()
                .and("rc.id", Operators.EQUAL, id)
                .limit(1)
                .toRestaurantArray()
                .then((restaurants) => restaurants[0]))));

router.get("/restaurants/:id/comments", (req, res) =>
    checkId(req, res, Restaurant, async id => {
        const reviewQuery = Query.select("id", "content", "rating", "restaurant_id AS parent_id", "date", "user_id", "FALSE AS is_reply")
            .from(Review)
            .where("restaurant_id", Operators.EQUAL, id);
        const replyQuery = Query.select("id", "content", "NULL", "review_id", "date", "user_id", "TRUE")
            .from(Reply)
            .where("review_id", Operators.IN,
                Query.select("id")
                    .from(Review)
                    .where("restaurant_id", Operators.EQUAL, id));
        return res.status(HttpStatusCodes.OK)
            .send(await Query.union(UnionType.UNION_ALL, reviewQuery, replyQuery)
                .toArray()
                .then((comments) => (comments as any[]).map(c => {
                    return {
                        ...c,
                        date: c.date.getTime(),
                        is_reply: c.is_reply === 1
                    }
                })));
    }));

router.post("/users", async (req, res) => {
    const user = User.fromNewRequest(req.body);
    // Ensure request is formatted correctly
    if (!user)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Missing name or password.");

    // Ensure name is unique
    if (await checkExists(User, ["name"], [user.name]))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Name is already taken.");

    // Create user
    return res.status(HttpStatusCodes.CREATED)
        .send(await Query.insert(User, user)
            .execute());
});

router.put("/users", (req, res) =>
    checkAuth(req, res, async user => {
        const userUpdate = User.fromUpdateRequest(req.body);
        if (!userUpdate)
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("Must have at least new name or password.");

        // Update user
        return res.status(HttpStatusCodes.OK)
            .send(await Query.update(User)
                .set(userUpdate)
                .where("id", Operators.EQUAL, user.id)
                .execute());
    }));

router.delete("/users", (req, res) =>
    checkAuth(req, res, async user =>
        res.status(HttpStatusCodes.OK)
            .send(await Query.delete()
                .from(User)
                .where("id", Operators.EQUAL, user.id)
                .execute())));

router.post("/comments", (req, res) =>
    checkAuth(req, res, async user => {
        req.body.user_id = user.id;
        const comment = Comment.fromNewRequest(req.body);
        if (!comment)
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("Bad comment data.");

        return res.status(HttpStatusCodes.CREATED)
            .send(await Query.insert(req.body.is_reply ? Reply : Review, comment)
                .execute());
    }));

router.put("/comments/:id", async (req, res) =>
    checkAuth(req, res, async user => {
        // Ensure isReply is a boolean
        const isReplyString = (req.query.isReply.toString()).toLowerCase();
        if (isReplyString !== "true" && isReplyString !== "false")
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("isReply must be specified as a boolean.");
        const isReply = isReplyString === "true";

        // Ensure comment is formatted correctly
        req.body.is_reply = isReply;
        const comment = Comment.fromUpdateRequest(req.body);
        if (!comment)
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("Bad comment update data.");

        return checkId(req, res, comment instanceof Reply ? Reply : Review, async id => {
            const original = await Query.select("user_id")
                .from(comment instanceof Reply ? Reply : Review)
                .where("id", Operators.EQUAL, id)
                .limit(1)
                .toArray()
                .then(comments => comments[0]);

            // Ensure user is the author
            if (original.user_id !== user.id)
                return res.status(HttpStatusCodes.FORBIDDEN)
                    .send("You are not the author of this comment.");

            // Update comment
            return res.status(HttpStatusCodes.OK)
                .send(await Query.update(comment instanceof Reply ? Reply : Review)
                    .set(comment)
                    .where("id", Operators.EQUAL, id)
                    .execute());
        });
    }));

router.delete("/comments/:id", async (req, res) =>
    checkAuth(req, res, async user => {
        // Ensure isReply is a boolean
        const isReplyString = (req.query.isReply.toString()).toLowerCase();
        if (isReplyString !== "true" && isReplyString !== "false")
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("isReply must be specified as a boolean.");
        const isReply = isReplyString === "true";

        checkId(req, res, isReply ? Reply : Review, async id => {
            // Ensure user is the author
            if (!await checkExists(isReply ? Reply : Review, ["id", "user_id"], [id, user.id]))
                return res.status(HttpStatusCodes.FORBIDDEN)
                    .send("You are not the author of this comment.");

            // Delete comment
            return res.status(HttpStatusCodes.OK)
                .send(await Query.delete()
                    .from(isReply ? Reply : Review)
                    .where("id", Operators.EQUAL, id)
                    .execute());
        });
    }));

async function checkId(req, res, table: typeof Entity, next: (id: number) => any) {
    const id = Number.parseInt(req.params.id);
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    // Ensure entity exists
    if (!await checkExists(table, ["id"], [id]))
        return res.status(HttpStatusCodes.NOT_FOUND)
            .send("Entity not found.");

    return next(id);
}

async function checkExists(table: typeof Entity, fields: string[], values: any[]) {
    if (fields.length !== values.length)
        throw new Error("Fields and values must be the same length.");
    if (fields.length === 0)
        throw new Error("Must have at least one field.");

    let innerQuery = Query.select()
        .from(table)
        .where(fields[0], Operators.EQUAL);
    for (let i = 1; i < fields.length; i++)
        innerQuery = innerQuery.and(fields[i], Operators.EQUAL);

    return await Query.exists(innerQuery)
        .execute(values)
        .then((result) => Object.values(result[0])[0] === 1);
}

async function checkAuth(req, res, next: (user: User) => any) {
    // Ensure authorization header is present and valid
    const authHeader = req.headers.authorization.split(" ");
    if (authHeader.length !== 2 || authHeader[0] !== "Basic")
        return res.status(HttpStatusCodes.UNAUTHORIZED)
            .send("Ensure that you are using basic authentication.");
    const credentials = Buffer.from(authHeader[1], 'base64').toString().split(":");
    if (credentials.length !== 2)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Credentials were formmatted incorrectly.");

    // Get user in database
    const user = new User();
    Object.assign(user, await Query.select()
        .from(User)
        .where("name", Operators.EQUAL, credentials[0])
        .limit(1)
        .toArray()
        .then((users) => users[0]));

    // Check if user exists and password is correct
    if (!user.name || !user.checkPassword(credentials[1]))
        return res.status(HttpStatusCodes.UNAUTHORIZED)
            .send("Incorrect username or password.");

    // Call next
    return next(user);
}

export default router;