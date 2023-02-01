import dbConnection from "$lib/server";
import * as Clause from "./clauses";
import type { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";

type QueryResult =
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket
  | OkPacket[]
  | ResultSetHeader;

export enum SqlOperators {
  EQUAL = "=",
  NOT_EQUAL = "<>",
  GREATER_THAN = ">",
  LESS_THAN = "<",
  GREATER_THAN_OR_EQUAL = ">=",
  LESS_THAN_OR_EQUAL = "<=",
  LIKE = "LIKE",
  NOT_LIKE = "NOT LIKE",
  IN = "IN",
  NOT_IN = "NOT IN",
  IS = "IS",
  IS_NOT = "IS NOT",
}

export enum JoinType {
  JOIN = "JOIN",
  LEFT_JOIN = "LEFT JOIN",
  RIGHT_JOIN = "RIGHT JOIN",
  INNER_JOIN = "INNER JOIN",
  FULL_JOIN = "FULL JOIN",
  CROSS_JOIN = "CROSS JOIN",
}

export enum UnionType {
  UNION = "UNION",
  UNION_ALL = "UNION ALL",
}

enum QueryType {
  SELECT,
  INSERT,
  UPDATE,
  DELETE,
}

export class Query<T> {
  private type: QueryType;
  private clauses = [] as (Clause.Base | Query<any>)[];
  private data: undefined | any[];
  private alias: undefined | string;

  private constructor(type: QueryType) {
    this.type = type;
  }

  public static select<T>(...fields: string[]) {
    const query = new Query<T>(QueryType.SELECT);
    if (fields.length === 0) fields.push("*");
    query.clauses.push(new Clause.Select(fields));
    return query;
  }

  static insert<T>(
    tableName: string,
    data: Record<string, any>,
    fields: string[] = Object.keys(data)
  ) {
    const query = new Query<T>(QueryType.INSERT);
    query.clauses.push(new Clause.Insert(tableName, fields));
    query.data = fields.map((field) => data[field]);
    return query;
  }

  static update<T>(tableName: string) {
    const query = new Query<T>(QueryType.UPDATE);
    query.clauses.push(new Clause.Update(tableName));
    return query;
  }

  static delete<T>() {
    const query = new Query<T>(QueryType.DELETE);
    query.clauses.push(new Clause.Delete());
    return query;
  }

  static exists<T>(innerQuery: Query<T>) {
    const query = new Query<T>(QueryType.SELECT);
    query.clauses.push(new Clause.Select(["EXISTS"]));
    query.clauses.push(innerQuery);
    return query;
  }

  from(tableName: string | Query<T>) {
    this.clauses.push(new Clause.From(tableName));
    return this;
  }

  and(column: string, operator: SqlOperators, value?: any) {
    this.clauses.push(new Clause.And(column, operator, value));
    return this;
  }

  or(column: string, operator: SqlOperators, value?: any) {
    this.clauses.push(new Clause.Or(column, operator, value));
    return this;
  }

  where(column: string, operator: SqlOperators, value?: any) {
    this.clauses.push(new Clause.Where(column, operator, value));
    return this;
  }

  join<U>(
    type: JoinType,
    table: string | Query<U>,
    left_col: string,
    operator: SqlOperators,
    right_col: string
  ): Query<T & U> {
    this.clauses.push(
      new Clause.Join(type, table.toString()!, left_col, operator, right_col)
    );

    return this as Query<T & U>;
  }

  groupBy(...fields: string[]) {
    this.clauses.push(new Clause.GroupBy(fields));
    return this;
  }

  static union(type: UnionType, ...queries: (string | Query<any>)[]) {
    const query = new Query<any>(QueryType.SELECT);
    query.clauses.push(new Clause.Union(type, queries));

    return query;
  }

  limit(limit: number) {
    if (this.type !== QueryType.SELECT)
      throw new Error("Cannot call limit() on a non-select query");

    if (!Number.isInteger(limit) || limit < 0)
      throw new Error("Limit must be a positive integer");

    this.clauses.push(new Clause.Limit(limit));
    return this;
  }

  set(data: Record<string, any>) {
    if (this.type !== QueryType.UPDATE)
      throw new Error("Cannot call set() on a non-update query");

    this.clauses.push(new Clause.Set(data));
    this.data = Object.values(data);
    return this;
  }

  as(alias: string) {
    this.alias = alias;
    return this;
  }

  execute(data?: any[]): Promise<QueryResult> {
    return new Promise((resolve, reject) =>
      dbConnection.query(this.toString()!, data ?? this.data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
    );
  }

  toArray(data?: any[]): Promise<T[]> {
    if (this.type !== QueryType.SELECT)
      throw new Error("Cannot call toArray() on a non-select query");

    return new Promise((resolve, reject) =>
      dbConnection.query(this.toString()!, data ?? this.data, (err, result) => {
        if (err) reject(err);
        else resolve(result as T[]);
      })
    );
  }

  toString() {
    if (this.type === QueryType.SELECT)
      return `(${this.clauses.join(" ")})${
        this.alias ? ` AS ${this.alias}` : ""
      }`;
    else if (this.type === QueryType.INSERT) return `${this.clauses[0]}`;
    else if (this.type === QueryType.UPDATE) return `${this.clauses.join(" ")}`;
    else if (this.type === QueryType.DELETE) return `${this.clauses.join(" ")}`;
  }
}
