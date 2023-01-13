import express from "express";
import Controller from "./controllers";
import Query, { Operators, JoinType, UnionType } from "./query";
import { Category, Restaurant, RestaurantCategory, User, Review, Reply } from "./db entities";
import { hashSync } from 'bcrypt';

enum HttpStatusCodes {
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

    // 200 - OK
    // 201 - Created  # Response to successful POST or PUT
    // 302 - Found # Temporary redirect such as to /login
    // 303 - See Other # Redirect back to page after successful login
    // 304 - Not Modified
    // 400 - Bad Request
    // 401 - Unauthorized  # Not logged in
    // 403 - Forbidden  # Accessing another user's resource
    // 404 - Not Found
    // 500 - Internal Server Error
}

const router = express.Router();

const userController = new Controller(User);

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
    let id = Number.parseInt(req.params.id);
    // Ensure id is a number
    if (!Number.isSafeInteger(id))
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Invalid id.");

    return res.status(HttpStatusCodes.OK)
        .send(await Query.from(Restaurant)
            .select()
            .where("id", Operators.IN,
                Query.from(RestaurantCategory)
                    .select("restaurant_id")
                    .where("category_id", Operators.EQUAL, id))
            .toArray());
});

router.get("/restaurants", async (_, res) => {
    return res.status(HttpStatusCodes.OK)
        .send(await Query.from(Restaurant)
            .select()
            .join(JoinType.JOIN,
                Query.from(RestaurantCategory)
                    .select("restaurant_id as id", "GROUP_CONCAT(name) AS categories")
                    .join(JoinType.LEFT_JOIN, Category, "category_id", Operators.EQUAL, "id")
                    .groupBy("restaurant_id")
                    .as("rc"),
                `${Restaurant.tableName}.id`,
                Operators.EQUAL,
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
                    .join(JoinType.LEFT_JOIN, Category, "category_id", Operators.EQUAL, "id")
                    .groupBy("restaurant_id")
                    .as("rc"),
                `${Restaurant.tableName}.id`,
                Operators.EQUAL,
                "rc.id")
            .and("rc.id", Operators.EQUAL, id)
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
        .select("id", "content", "rating", "restaurant_id AS parent_id", "date", "user_id", "TRUE as is_reply")
        .where("restaurant_id", Operators.EQUAL, id);
    const replyQuery = Query.from(Reply)
        .select("id", "content", "0", "review_id as parent_id", "date", "user_id", "FALSE")
        .where("review_id", Operators.IN,
            Query.from(Review)
                .select("id")
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
});

router.post("/users", async (req, res) => {
    let user = req.query as unknown as User;
    if (!user.name || !user.password)
        return res.status(HttpStatusCodes.BAD_REQUEST)
            .send("Missing name or password.");

    // Create hash and salt
    const rounds = 10;
    let hashString = hashSync(user.password, rounds);
    user.password = hashString.slice(7, 38);
    user.salt = hashString.slice(38, 60);

    return res.status(HttpStatusCodes.CREATED)
        .send(await userController.addOne(user));
});

export default router;