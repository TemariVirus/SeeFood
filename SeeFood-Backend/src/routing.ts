import express from "express";
import Query, { Operators as SqlOperators, JoinType, UnionType } from "./query";
import { Category, Restaurant, RestaurantCategory, User, Review, Reply } from "./db entities";

export enum HttpStatusCodes {
    OK = 200,
    CREATED = 201,
    PERMANENT_REDIRECT = 301,
    TEMPORARY_REDIRECT = 302,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501

    // 200 - OK  # GET, PUT, DELETE
    // 201 - Created  # Response to successful POST or PUT
    // 302 - Found # Temporary redirect such as to /login
    // 303 - See Other # Redirect back to page after successful login
    // 401 - Unauthorized  # Not logged in
    // 403 - Forbidden  # Accessing another user's resource
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
        .send(await Query.from(Category)
            .select()
            .toArray());
});

router.get("/categories/:id/restaurants", async (req, res) => {
    const id = Number.parseInt(req.params.id);
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    return res.status(HttpStatusCodes.OK)
        .send(await Query.from(Restaurant)
            .select()
            .where("id", SqlOperators.IN,
                Query.from(RestaurantCategory)
                    .select("restaurant_id")
                    .where("category_id", SqlOperators.EQUAL, id))
            .toArray());
});

router.get("/restaurants", async (_, res) => {
    return res.status(HttpStatusCodes.OK)
        .send(await Query.from(Restaurant)
            .select()
            .join(JoinType.JOIN,
                Query.from(RestaurantCategory)
                    .select("restaurant_id as id", "GROUP_CONCAT(name) AS categories")
                    .join(JoinType.LEFT_JOIN, Category, "category_id", SqlOperators.EQUAL, "id")
                    .groupBy("restaurant_id")
                    .as("rc"),
                `${Restaurant.tableName}.id`,
                SqlOperators.EQUAL,
                "rc.id")
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

    return res.status(HttpStatusCodes.OK)
        .send(await Query.from(Restaurant)
            .select()
            .join(JoinType.JOIN,
                Query.from(RestaurantCategory)
                    .select("restaurant_id as id", "GROUP_CONCAT(name) AS categories")
                    .join(JoinType.LEFT_JOIN, Category, "category_id", SqlOperators.EQUAL, "id")
                    .groupBy("restaurant_id")
                    .as("rc"),
                `${Restaurant.tableName}.id`,
                SqlOperators.EQUAL,
                "rc.id")
            .and("rc.id", SqlOperators.EQUAL, id)
            .limit(1)
            .toArray()
            .then((restaurants) => {
                const r = restaurants[0];
                return {
                    ...r,
                    categories: r.categories.split(",")
                };
            })
        );
});

router.get("/restaurants/:id/comments", async (req, res) => {
    const id = Number.parseInt(req.params.id);
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    const reviewQuery = Query.from(Review)
        .select("id", "content", "rating", "restaurant_id AS parent_id", "date", "user_id", "FALSE AS is_reply")
        .where("restaurant_id", SqlOperators.EQUAL, id);
    const replyQuery = Query.from(Reply)
        .select("id", "content", "NULL", "review_id", "date", "user_id", "TRUE")
        .where("review_id", SqlOperators.IN,
            Query.from(Review)
                .select("id")
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

async function checkAuth(req, res, next) {
    // Ensure authorization header is present and valid
    const authHeader = req.headers.authorization.split(" ");
    if (authHeader.length !== 2 || authHeader[0] !== "Basic")
        return res.status(HttpStatusCodes.UNAUTHORIZED)
            .send("Ensure that you use basic authentication.");
    const credentials = Buffer.from(authHeader[1], 'base64').toString().split(":");
    if (credentials.length !== 2)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Credentials were formmatted incorrectly.");

    // Get password hash
    const user = new User();
    Object.assign(user, await Query.from(User)
        .select()
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