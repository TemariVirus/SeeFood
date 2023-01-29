import Express from "express";
import { Query, SqlOperators, UnionType } from "./db-query/query";
import Entity, * as Entities from "./entities";

export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}

const router = Express.Router();

// Check connection with server
router.get("/ping", async (_, res) =>
  res.status(HttpStatusCodes.OK).send("pong")
);

// Get all categories
router.get("/categories", async (_, res) =>
  res
    .status(HttpStatusCodes.OK)
    .json(await Query.select().from(Entities.Category).toArray())
);

// Get all restaurants that have a category with the given id
router.get("/categories/:id/restaurants", (req, res) =>
  checkIdExists(
    req.params.id?.toString(),
    res,
    Entities.Category,
    async (id) => {
      const q = Entities.Restaurant.selectQueryWithCategories().where(
        "rc.restaurant_id",
        SqlOperators.IN,
        Query.select("restaurant_id")
          .from(Entities.RestaurantCategory)
          .where("category_id", SqlOperators.EQUAL, id)
      );
      return res.status(HttpStatusCodes.OK).json(await q.toRestaurantArray());
    }
  )
);

// Get all restaurants
router.get("/restaurants", async (_, res) =>
  res
    .status(HttpStatusCodes.OK)
    .json(
      await Entities.Restaurant.selectQueryWithCategories().toRestaurantArray()
    )
);

// Get a restaurant with the given id
router.get("/restaurants/:id", (req, res) =>
  checkIdExists(req.params.id?.toString(), res, Entities.Restaurant, async (id) =>
    res.status(HttpStatusCodes.OK).json(
      await Entities.Restaurant.selectQueryWithCategories()
        .where(`${Entities.Restaurant.tableName}.id`, SqlOperators.EQUAL, id)
        .limit(1)
        .toRestaurantArray()
        .then((restaurants) => restaurants[0])
    )
  )
);

// Get all comments for a restaurant with the given id
router.get("/restaurants/:id/comments", (req, res) =>
  checkIdExists(req.params.id?.toString(), res, Entities.Restaurant, async (id) => {
    const reviewQuery = Query.select(
      "id",
      "content",
      "rating",
      "restaurant_id AS parent_id",
      "date",
      "user_id",
      "FALSE AS is_reply"
    )
      .from(Entities.Review)
      .where("restaurant_id", SqlOperators.EQUAL, id);
    const replyQuery = Query.select(
      "id",
      "content",
      "NULL",
      "review_id",
      "date",
      "user_id",
      "TRUE"
    )
      .from(Entities.Reply)
      .where(
        "review_id",
        SqlOperators.IN,
        Query.select("id")
          .from(Entities.Review)
          .where("restaurant_id", SqlOperators.EQUAL, id)
      );
    // Union the two queries and return the result
    return res
      .status(HttpStatusCodes.OK)
      .json(
        await Query.union(
          UnionType.UNION_ALL,
          reviewQuery,
          replyQuery
        ).toCommentArray()
      );
  })
);

// Get all comments for a user with the given id
router.get("/users/:id/comments", (req, res) =>
  checkIdExists(req.params.id?.toString(), res, Entities.User, async (id) => {
    const reviewQuery = Query.select(
      "id",
      "content",
      "rating",
      "restaurant_id AS parent_id",
      "date",
      "user_id",
      "FALSE AS is_reply"
    )
      .from(Entities.Review)
      .where("user_id", SqlOperators.EQUAL, id);
    const replyQuery = Query.select(
      "id",
      "content",
      "NULL",
      "review_id",
      "date",
      "user_id",
      "TRUE"
    )
      .from(Entities.Reply)
      .where("user_id", SqlOperators.EQUAL, id);
    // Union the two queries and return the result
    return res
      .status(HttpStatusCodes.OK)
      .json(
        await Query.union(
          UnionType.UNION_ALL,
          reviewQuery,
          replyQuery
        ).toCommentArray()
      );
  })
);

// Create a new user
router.post("/users", async (req, res) => {
  // Ensure request is formatted correctly
  const request = Entities.User.fromNewRequest(req.body);
  if (!request.success)
    return res.status(HttpStatusCodes.BAD_REQUEST).send(request.data);
  const user = request.data as Entities.User;

  // Ensure name is unique
  if (await checkExists(Entities.User, { name: user.name }))
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .send("Name is already taken.");

  // Create user
  return res
    .status(HttpStatusCodes.CREATED)
    .json(await Query.insert(Entities.User, user).execute());
});

// Update a user
router.put("/users", (req, res) =>
  checkAuth(req, res, async (user) => {
    // Ensure request is formatted correctly
    const request = Entities.User.fromUpdateRequest(req.body);
    if (!request.success)
      return res.status(HttpStatusCodes.BAD_REQUEST).send(request.data);
    const userUpdate = request.data as Entities.User;

    // Update user
    return res
      .status(HttpStatusCodes.OK)
      .send(
        await Query.update(Entities.User)
          .set(userUpdate)
          .where("id", SqlOperators.EQUAL, user.id)
          .execute()
      );
  })
);

// Delete a user
router.delete("/users", (req, res) =>
  checkAuth(req, res, async (user) =>
    res
      .status(HttpStatusCodes.OK)
      .json(
        await Query.delete()
          .from(Entities.User)
          .where("id", SqlOperators.EQUAL, user.id)
          .execute()
      )
  )
);

// Create a new comment
router.post("/comments", (req, res) =>
  checkAuth(req, res, (user) =>
    checkBoolean(req, res, "isReply", async (isReply) => {
      // Ensure comment is formatted correctly
      req.body.is_reply = isReply;
      req.body.user_id = user.id;
      const request = Entities.Comment.fromNewRequest(req.body);
      if (!request.success)
        return res.status(HttpStatusCodes.BAD_REQUEST).send(request.data);
      const comment = request.data as Entities.Review | Entities.Reply;

      // Ensure user has not already reviewed restaurant
      if (comment instanceof Entities.Review) {
        if (
          await checkExists(Entities.Review, {
            user_id: user.id,
            restaurant_id: comment.restaurant_id,
          })
        )
          return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .send("You have already rated or reviewed this restaurant.");
      }

      // Ensure parent exists
      if (comment instanceof Entities.Reply) {
        // Get parent review
        const review = await Query.select("id", "content")
          .from(Entities.Review)
          .where("id", SqlOperators.EQUAL, comment.review_id)
          .limit(1)
          .toArray()
          .then((reviews) => reviews[0]);
        if (!review)
          return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .send("Parent review does not exist.");

        // Ensure parent review has content
        if (!review.content)
          return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .send("Cannot reply to a review with no content.");
      } else {
        if (
          !(await checkExists(Entities.Restaurant, {
            id: comment.restaurant_id,
          }))
        )
          return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .send("Parent restaurant does not exist.");
      }

      // Create comment
      return res
        .status(HttpStatusCodes.CREATED)
        .json(
          await Query.insert(
            comment instanceof Entities.Reply
              ? Entities.Reply
              : Entities.Review,
            comment
          ).execute()
        );
    })
  )
);

// Update a comment
router.put("/comments", async (req, res) =>
  checkAuth(req, res, async (user) =>
    checkBoolean(req, res, "isReply", (isReply) => {
      // Ensure comment is formatted correctly
      req.body.is_reply = isReply;
      const request = Entities.Comment.fromUpdateRequest(req.body);
      if (!request.success)
        return res.status(HttpStatusCodes.BAD_REQUEST).send(request.data);
      const comment = request.data as Entities.Review | Entities.Reply;

      // Ensure comment exists
      return checkIdExists(
        req.query.id?.toString(),
        res,
        comment instanceof Entities.Reply ? Entities.Reply : Entities.Review,
        async (id) => {
          const original = await Query.select("user_id")
            .from(isReply ? Entities.Reply : Entities.Review)
            .where("id", SqlOperators.EQUAL, id)
            .limit(1)
            .toArray()
            .then((comments) => (comments as Entities.Comment[])[0]);

          // Ensure user is the author
          if (original.user_id !== user.id)
            return res
              .status(HttpStatusCodes.FORBIDDEN)
              .send("You are not the author of this comment.");

          // Update comment
          return res.status(HttpStatusCodes.OK).json(
            await Query.update(isReply ? Entities.Reply : Entities.Review)
              .set(comment)
              .where("id", SqlOperators.EQUAL, id)
              .execute()
          );
        }
      );
    })
  )
);

// Delete a comment
router.delete("/comments", async (req, res) =>
  checkAuth(req, res, async (user) =>
    checkBoolean(req, res, "isReply", (isReply) =>
      checkIdExists(
        req.query.id?.toString(),
        res,
        isReply ? Entities.Reply : Entities.Review,
        async (id) => {
          // Ensure user is the author
          if (
            !(await checkExists(isReply ? Entities.Reply : Entities.Review, {
              id: id,
              user_id: user.id,
            }))
          ) {
            return res
              .status(HttpStatusCodes.FORBIDDEN)
              .send("You are not the author of this comment.");
          }

          // Delete comment
          return res.status(HttpStatusCodes.OK).json(
            await Query.delete()
              .from(isReply ? Entities.Reply : Entities.Review)
              .where("id", SqlOperators.EQUAL, id)
              .execute()
          );
        }
      )
    )
  )
);

function checkBoolean(req, res, key: string, then: (bool: boolean) => any) {
  const boolString = req.query[key]?.toString().toLowerCase();
  if (boolString !== "true" && boolString !== "false") {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .send("isReply must be specified as a boolean. (true/false)");
  }

  return then(boolString === "true");
}

// Check if an id is valid and exists in the specified table
async function checkIdExists(
  idString: string,
  res,
  table: typeof Entity,
  then: (id: number) => any
) {
  // Ensure id is a number
  const id = Number.parseInt(idString);
  if (!Number.isSafeInteger(id))
    return res.status(HttpStatusCodes.BAD_REQUEST).send("Invalid id.");

  // Ensure entity exists
  if (!(await checkExists(table, { id: id })))
    return res
      .status(HttpStatusCodes.NOT_FOUND)
      .send(table.prototype.constructor.name + " not found.");

  return then(id);
}

// Check if an entity with the specified properties exists in the table
async function checkExists(
  table: typeof Entity,
  properties: Record<string, any>
) {
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

// Check authorization header and return user
async function checkAuth(req, res, then: (user: Entities.User) => any) {
  // Ensure authorization header is present and valid
  const authHeader = req.headers.authorization.split(" ");
  if (authHeader.length !== 2 || authHeader[0] !== "Basic")
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .send("Ensure that you are using basic authentication.");
  const credentials = Buffer.from(authHeader[1], "base64")
    .toString()
    .split(":");
  if (credentials.length !== 2)
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .send("Credentials were formmatted incorrectly.");

  // Get user in database
  const user = new Entities.User();
  Object.assign(
    user,
    await Query.select()
      .from(Entities.User)
      .where("name", SqlOperators.EQUAL, credentials[0])
      .limit(1)
      .toArray()
      .then((users) => (users as Entities.User[])[0])
  );

  // Check if user exists and password is correct
  if (!user.name || !user.checkPassword(credentials[1]))
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .send("Incorrect username or password.");

  return then(user);
}

export default router;
