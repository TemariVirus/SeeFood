import { createConnection } from "mysql2";

const dbConnection = createConnection({
  host: "localhost",
  port: 3306,
  user: "YOUR USERNAME",
  password: "YOUR PASSWORD",
  database: "seefooddb",
});

dbConnection.connect((err) => {
  if (err) throw err;
});

export default dbConnection;
