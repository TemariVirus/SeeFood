import dbConnection from "..";
import Entity from "../entities";
import * as Clause from "./clauses";
import { OkPacket, QueryError, ResultSetHeader, RowDataPacket } from "mysql2";

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
  private clauses = [] as (Clause.Clause | Query<any>)[];
  private data: any[];
  private alias: string;

  constructor(type: QueryType) {
    this.type = type;
  }

  static select<T extends Entity>(...fields: string[]) {
    const query = new Query<T>(QueryType.SELECT);
    if (fields.length === 0) fields.push("*");
    query.clauses.push(new Clause.SelectClause(fields));
    return query;
  }

  static insert<T extends Entity>(
    table: T & typeof Entity,
    data: object,
    fields: string[] = Object.keys(data)
  ) {
    const query = new Query<T>(QueryType.INSERT);
    query.clauses.push(new Clause.InsertClause(table, fields));
    query.data = fields.map((field) => data[field]);
    return query;
  }

  static update<T extends Entity>(table: T & typeof Entity) {
    const query = new Query<T>(QueryType.UPDATE);
    query.clauses.push(new Clause.UpdateClause(table));
    return query;
  }

  static delete<T extends Entity>() {
    const query = new Query<T>(QueryType.DELETE);
    query.clauses.push(new Clause.DeleteClause());
    return query;
  }

  static exists<T extends Entity>(innerQuery: Query<T>) {
    const query = new Query<T>(QueryType.SELECT);
    query.clauses.push(new Clause.SelectClause(["EXISTS"]));
    query.clauses.push(innerQuery);
    return query;
  }

  from(table: typeof Entity | Query<T>) {
    this.clauses.push(new Clause.FromClause(table));
    return this;
  }

  and(column: string, operator: SqlOperators, value?: any) {
    this.clauses.push(new Clause.AndClause(column, operator, value));
    return this;
  }

  or(column: string, operator: SqlOperators, value?: any) {
    this.clauses.push(new Clause.OrClause(column, operator, value));
    return this;
  }

  where(column: string, operator: SqlOperators, value?: any) {
    this.clauses.push(new Clause.WhereClause(column, operator, value));
    return this;
  }

  join<U extends Entity>(
    type: JoinType,
    table: (U & typeof Entity) | Query<U>,
    left_col: string,
    operator: SqlOperators,
    right_col: string
  ): Query<T & U> {
    if (table instanceof Query)
      this.clauses.push(
        new Clause.JoinClause(
          type,
          table.toString(),
          left_col,
          operator,
          right_col
        )
      );
    else
      this.clauses.push(
        new Clause.JoinClause(
          type,
          table.tableName,
          left_col,
          operator,
          right_col
        )
      );

    return this as Query<T & U>;
  }

  groupBy(...fields: string[]) {
    this.clauses.push(new Clause.GroupByClause(fields));
    return this;
  }

  static union(type: UnionType, ...queries: Query<any>[]) {
    const query = new Query<any>(QueryType.SELECT);
    query.clauses.push(new Clause.UnionClause(type, queries));

    return query;
  }

  limit(limit: number) {
    if (this.type !== QueryType.SELECT)
      throw new Error("Cannot call limit() on a non-select query");

    this.clauses.push(new Clause.LimitClause(limit));
    return this;
  }

  set(data: object) {
    if (this.type !== QueryType.UPDATE)
      throw new Error("Cannot call set() on a non-update query");

    this.clauses.push(new Clause.SetClause(data));
    this.data = Object.values(data);
    return this;
  }

  as(alias: string) {
    this.alias = alias;
    return this;
  }

  execute(data?: any[]): Promise<QueryError | QueryResult> {
    return new Promise((resolve, _) =>
      dbConnection.query(this.toString(), data ?? this.data, (err, result) =>
        resolve(err ?? result)
      )
    );
  }

  toArray(data?: any[]): Promise<QueryError | T[]> {
    if (this.type !== QueryType.SELECT)
      throw new Error("Cannot call toArray() on a non-select query");

    return new Promise((resolve, _) =>
      dbConnection.query(this.toString(), data ?? this.data, (err, result) =>
        resolve(err ?? (result as T[]))
      )
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
