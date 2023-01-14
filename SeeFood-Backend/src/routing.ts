import express from "express";
import Query, { Operators as SqlOperators, JoinType, UnionType } from "./query";
import { Category, Restaurant, RestaurantCategory, User, Review, Reply, Comment } from "./db entities";

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

router.get("/categories/:id/restaurants", async (req, res) => {
    const id = Number.parseInt(req.params.id);
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    return res.status(HttpStatusCodes.OK)
        .send(await restaurantQuery()
            .where("rc.id", SqlOperators.IN,
                Query.select("restaurant_id")
                    .from(RestaurantCategory)
                    .where("category_id", SqlOperators.EQUAL, id))
            .toArray()
            .then((restaurants) => (restaurants as any[]).map(r => {
                return {
                    ...r,
                    categories: r.categories.split(","),
                };
            })));
});

router.get("/restaurants", async (_, res) => {
    return res.status(HttpStatusCodes.OK)
        .send(await restaurantQuery()
            .toArray()
            .then((restaurants) => (restaurants as any[]).map(r => {
                return {
                    ...r,
                    categories: r.categories.split(",")
                };
            }))
        );
});

router.get("/restaurants/:id", async (req, res) => {
    const id = Number.parseInt(req.params.id)
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    const result = await restaurantQuery()
        .and("rc.id", SqlOperators.EQUAL, id)
        .limit(1)
        .toArray() as any[];

    // Check if restaurant exists
    if (result.length === 0)
        return res.status(HttpStatusCodes.NOT_FOUND)
            .send("Restaurant not found.");

    return res.status(HttpStatusCodes.OK)
        .send({
            ...result[0],
            categories: result[0].categories.split(",")
        });
});

router.get("/restaurants/:id/comments", async (req, res) => {
    const id = Number.parseInt(req.params.id);
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    const reviewQuery = Query.select("id", "content", "rating", "restaurant_id AS parent_id", "date", "user_id", "FALSE AS is_reply")
        .from(Review)
        .where("restaurant_id", SqlOperators.EQUAL, id);
    const replyQuery = Query.select("id", "content", "NULL", "review_id", "date", "user_id", "TRUE")
        .from(Reply)
        .where("review_id", SqlOperators.IN,
            Query.select("id")
                .from(Review)
                .where("restaurant_id", SqlOperators.EQUAL, id));
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
});

router.post("/users", async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Missing name or password.");

    // Ensure name is unique
    console.log(Query.exists(Query.select("1").from(User).where("name", SqlOperators.EQUAL, name))
        .execute());
    if (await Query.exists(
        Query.select("1")
            .from(User)
            .where("name", SqlOperators.EQUAL, name))
        .execute() === 1)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Name is already taken.");

    // Create hash and salt
    const user = new User();
    user.name = name;
    user.setPassword(password);

    return res.status(HttpStatusCodes.CREATED)
        .send(await Query.insert(User, user)
            .execute());
});

router.put("/users", async (req, res) => checkAuth(req, res, async (req, res, user) => {
    // Ensure new name or password is provided
    const { name, password } = req.body;
    if (!name && !password)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("New name or password must be provided.");

    // Update user
    if (name)
        user.name = name;
    if (password)
        user.setPassword(password);

    return res.status(HttpStatusCodes.OK)
        .send(await Query.update(User)
            .set(user)
            .where("id", SqlOperators.EQUAL, user.id)
            .execute());
}));

router.delete("/users", async (req, res) =>
    checkAuth(req, res, async (_, res, user) =>
        res.status(HttpStatusCodes.OK)
            .send(await Query.delete()
                .from(User)
                .where("id", SqlOperators.EQUAL, user.id)
                .execute()))
);

router.post("/comments", async (req, res) => {
    return checkAuth(req, res, async (_, res, user) => {
        req.body.user_id = user.id;
        const entity = Comment.parseAsDbEntity(req.body);
        return res.status(HttpStatusCodes.CREATED)
            .send(await Query.insert(entity instanceof Reply ? Reply : Review, entity)
                .execute());
    });
});

router.put("/comments/:id", async (req, res) => {
    return checkAuth(req, res, async (_, res, user) => {
        const id = Number.parseInt(req.params.id);
        // Ensure id is a number
        if (!Number.isSafeInteger(id))
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("Invalid id.");

        const comment = Comment.parseAsDbEntity(req.body);
        // Ensure comment exists
        const original = await Query.select()
            .from(comment instanceof Reply ? Reply : Review)
            .where("id", SqlOperators.EQUAL, id)
            .limit(1)
            .execute()
            .then((result) => result[0]);
        if (!original)
            return res.status(HttpStatusCodes.NOT_FOUND)
                .send("Comment not found.");

        // Ensure user is the author
        if (original.user_id !== user.id)
            return res.status(HttpStatusCodes.FORBIDDEN)
                .send("You are not the author of this comment.");

        // Update comment
        Object.assign(original, comment);
        return res.status(HttpStatusCodes.OK)
            .send(await Query.update(comment instanceof Reply ? Reply : Review)
                .set(original)
                .where("id", SqlOperators.EQUAL, id)
                .execute());
    });
});

router.delete("/comments/:id", async (req, res) => {
    return checkAuth(req, res, async (_, res, user) => {
        const id = Number.parseInt(req.params.id);
        // Ensure id is a number
        if (!Number.isSafeInteger(id))
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("Invalid id.");

        // Ensure isReply is a boolean
        const isReply = req.query.isRepl;
        if (typeof isReply !== "boolean")
            return res.status(HttpStatusCodes.BAD_REQUEST)
                .send("isReply must be specified as a boolean.");

        // Ensure comment exists
        const original = await Query.select("user_id")
            .from(isReply ? Reply : Review)
            .where("id", SqlOperators.EQUAL, id)
            .limit(1)
            .toArray()
            .then((result) => result[0]);
        if (!original)
            return res.status(HttpStatusCodes.NOT_FOUND)
                .send("Comment not found.");

        // Ensure user is the author
        if (original.user_id !== user.id)
            return res.status(HttpStatusCodes.FORBIDDEN)
                .send("You are not the author of this comment.");

        // Delete comment
        return res.status(HttpStatusCodes.OK)
            .send(await Query.delete()
                .from(isReply ? Reply : Review)
                .where("id", SqlOperators.EQUAL, id)
                .execute());
    });
});

function restaurantQuery() {
    return Query.select()
        .from(Restaurant)
        .join(JoinType.JOIN,
            Query.select("restaurant_id AS id", "GROUP_CONCAT(name) AS categories")
                .from(RestaurantCategory)
                .join(JoinType.LEFT_JOIN, Category, "category_id", SqlOperators.EQUAL, "id")
                .groupBy("restaurant_id")
                .as("rc"),
            `${Restaurant.tableName}.id`,
            SqlOperators.EQUAL,
            "rc.id");
}

async function checkAuth(req, res, next) {
    // Ensure authorization header is present and valid
    const authHeader = req.headers.authorization.split(" ");
    if (authHeader.length !== 2 || authHeader[0] !== "Basic")
        return res.status(HttpStatusCodes.UNAUTHORIZED)
            .send("Ensure that you are using basic authentication.");
    const credentials = Buffer.from(authHeader[1], 'base64').toString().split(":");
    if (credentials.length !== 2)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Credentials were formmatted incorrectly.");

    // Get password hash
    const user = new User();
    Object.assign(user, await Query.select()
        .from(User)
        .where("name", SqlOperators.EQUAL, credentials[0])
        .limit(1)
        .toArray()
        .then((users) => users[0]));

    // Check if user exists
    if (!user.id)
        return res.status(HttpStatusCodes.UNAUTHORIZED)
            .send("Incorrect username or password.");

    // Check if password is correct
    if (!user.checkPassword(credentials[1]))
        return res.status(HttpStatusCodes.UNAUTHORIZED)
            .send("Incorrect username or password.");

    // Call next
    return next(req, res, user);
}

export default router;