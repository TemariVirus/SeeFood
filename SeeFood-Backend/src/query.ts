import Entity from "./entities";
import dbConnection from ".";
import { OkPacket, QueryError, ResultSetHeader, RowDataPacket } from "mysql2";

type QueryResult = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;

export enum Operators {
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
    IS_NOT = "IS NOT"
}

export enum JoinType {
    JOIN = "JOIN",
    LEFT_JOIN = "LEFT JOIN",
    RIGHT_JOIN = "RIGHT JOIN",
    INNER_JOIN = "INNER JOIN",
    FULL_JOIN = "FULL JOIN",
    CROSS_JOIN = "CROSS JOIN"
}

export enum UnionType {
    UNION = "UNION",
    UNION_ALL = "UNION ALL"
}

//#region Clauses
abstract class Clause {
    constructor() {
        Clause.prototype.toString = this.toString;
    }

    public abstract toString(): string;
}

class SelectClause extends Clause {
    private fields: string[];

    constructor(fields: string[]) {
        super();
        this.fields = fields;
    }

    toString() {
        return `SELECT ${this.fields.join(",")}`;
    }
}

class InsertClause extends Clause {
    private table: string;
    private fields: string[];

    constructor(table: typeof Entity, fields: string[]) {
        super();
        this.table = table.tableName;
        this.fields = fields;
    }

    toString() {
        return `INSERT INTO ${this.table} (${this.fields.join(",")}) VALUES (${this.fields.map(_ => "?").join(",")})`;
    }
}

class UpdateClause extends Clause {
    private table: string;

    constructor(table: typeof Entity) {
        super();
        this.table = table.tableName;
    }

    toString() {
        return `UPDATE ${this.table}`;
    }
}

class DeleteClause extends Clause {
    constructor() {
        super();
    }

    toString() {
        return "DELETE";
    }
}

class FromClause extends Clause {
    private table: string;

    constructor(table: typeof Entity) {
        super();
        this.table = table.tableName;
    }

    toString() {
        return `FROM ${this.table}`;
    }
}

class SetClause extends Clause {
    private fields: string[];

    constructor(obj: object) {
        super();
        this.fields = Object.keys(obj);
    }

    toString() {
        return `SET ${this.fields.map(field => `${field} = ?`).join(",")}`;
    }
}

class AndClause extends Clause {
    private column: string;
    private operator: Operators;
    private value: any;

    constructor(column: string, operator: Operators, value?: any) {
        super();
        this.column = column;
        this.operator = operator;
        if (value)
            this.value = value;
    }

    public toString(): string {
        return `AND ${this.column} ${this.operator} ${this.value ?? "?"}`;
    }
}

class OrClause extends Clause {
    private column: string;
    private operator: Operators;
    private value: any;

    constructor(column: string, operator: Operators, value: any) {
        super();
        this.column = column;
        this.operator = operator;
        this.value = value;
    }

    public toString(): string {
        return `OR ${this.column} ${this.operator} ${this.value}`;
    }
}

class WhereClause extends Clause {
    private column: string;
    private operator: Operators;
    private value: any;

    constructor(column: string, operator: Operators, value: any) {
        super();
        this.column = column;
        this.operator = operator;
        this.value = value;
    }

    toString() {
        return `WHERE ${this.column} ${this.operator} ${this.value}`;
    }
}

class JoinClause extends Clause {
    private joinType: JoinType;
    private table: string;
    private condition: string;

    constructor(joinType: JoinType, table: string, left_col: string, operator: Operators, right_col: string) {
        super();
        this.joinType = joinType;
        this.table = table;
        this.condition = `${left_col} ${operator} ${right_col}`;
    }

    public toString(): string {
        return `${this.joinType} ${this.table} ON ${this.condition}`;
    }
}

class GroupByClause extends Clause {
    private fields: string[];

    constructor(fields: string[]) {
        super();
        this.fields = fields;
    }

    public toString(): string {
        return `GROUP BY ${this.fields.join(",")}`;
    }
}

class UnionClause extends Clause {
    private unionType: UnionType;
    private tables: Query<any>[];

    constructor(unionType: UnionType, tables: Query<any>[]) {
        super();
        this.unionType = unionType;
        this.tables = tables;
    }

    public toString(): string {
        return this.tables.join(` ${this.unionType} `);
    }
}

class LimitClause extends Clause {
    private limit: number;

    constructor(limit: number) {
        super();
        this.limit = limit;
    }

    public toString(): string {
        return `LIMIT ${this.limit}`;
    }
}
//#endregion

enum QueryType {
    SELECT,
    INSERT,
    UPDATE,
    DELETE
}

export class Query<T> {
    private type: QueryType;
    private clauses = [] as (Clause | Query<any>)[];
    private data: any[];
    private alias: string;

    constructor(type: QueryType) {
        this.type = type;
    }

    static select<T extends Entity>(...fields: string[]) {
        const query = new Query<T>(QueryType.SELECT);
        if (fields.length === 0) fields.push("*");
        query.clauses.push(new SelectClause(fields));
        return query;
    }

    static insert<T extends Entity>(table: T & typeof Entity, data: object, fields: string[] = Object.keys(data)) {
        const query = new Query<T>(QueryType.INSERT);
        query.clauses.push(new InsertClause(table, fields));
        query.data = Object.values(data);
        return query;
    }

    static update<T extends Entity>(table: T & typeof Entity) {
        const query = new Query<T>(QueryType.UPDATE);
        query.clauses.push(new UpdateClause(table));
        return query;
    }

    static delete<T extends Entity>() {
        const query = new Query<T>(QueryType.DELETE);
        query.clauses.push(new DeleteClause());
        return query;
    }

    static exists<T extends Entity>(innerQuery: Query<T>) {
        const query = new Query<T>(QueryType.SELECT);
        query.clauses.push(new SelectClause(["EXISTS"]));
        query.clauses.push(innerQuery);
        return query;
    }

    from(table: typeof Entity) {
        this.clauses.push(new FromClause(table));
        return this;
    }

    and(column: string, operator: Operators, value?: any) {
        this.clauses.push(new AndClause(column, operator, value));
        return this;
    }

    or(column: string, operator: Operators, value: any) {
        this.clauses.push(new OrClause(column, operator, value));
        return this;
    }

    where(column: string, operator: Operators, value?: any) {
        // Escape strings with quotes
        if (typeof value === "string")
            value = `"${value}"`;

        if (Array.isArray(value)) {
            // Escape strings with quotes
            value = value.map(v => typeof v === "string" ? `"${v}"` : v);
            value = `(${value.join(",")})`;
        }

        // If value is undefined, use a placeholder
        value ??= column.split(",").map(_ => "?").join(",");

        this.clauses.push(new WhereClause(column, operator, value));
        return this;
    }

    join<U extends Entity>(type: JoinType,
        table: (U & typeof Entity) | Query<U>,
        left_col: string,
        operator: Operators,
        right_col: string): Query<T & U> {
        if (table instanceof Query)
            this.clauses.push(new JoinClause(type, table.toString(), left_col, operator, right_col));
        else
            this.clauses.push(new JoinClause(type, table.tableName, left_col, operator, right_col));

        return this as Query<T & U>;
    }

    groupBy(...fields: string[]) {
        this.clauses.push(new GroupByClause(fields));
        return this;
    }

    static union(type: UnionType, ...queries: Query<any>[]) {
        const query = new Query<any>(QueryType.SELECT);
        query.clauses.push(new UnionClause(type, queries));

        return query;
    }

    limit(limit: number) {
        this.clauses.push(new LimitClause(limit));
        return this;
    }

    set(data: object) {
        if (this.type !== QueryType.UPDATE)
            throw new Error("Cannot call set() on a non-update query");

        this.clauses.push(new SetClause(data));
        this.data = Object.values(data);
        return this;
    }

    as(alias: string) {
        this.alias = alias;
        return this;
    }

    execute(data?: any[]): Promise<QueryError | QueryResult> {
        return new Promise((resolve, _) => dbConnection.query(this.toString(), data ?? this.data, (err, result) => resolve(err ?? result)));
    }

    toArray(data?: any[]): Promise<QueryError | T[]> {
        if (this.type !== QueryType.SELECT)
            throw new Error("Cannot call toArray() on a non-select query");

        return new Promise((resolve, _) => dbConnection.query(this.toString(), data ?? this.data, (err, result) => resolve(err ?? result as T[])));
    }

    toString() {
        if (this.type === QueryType.SELECT)
            return `(${this.clauses.join(" ")})${this.alias ? ` AS ${this.alias}` : ""}`;
        else if (this.type === QueryType.INSERT)
            return `${this.clauses[0]}`;
        else if (this.type === QueryType.UPDATE)
            return `${this.clauses.join(" ")}`;
        else if (this.type === QueryType.DELETE)
            return `${this.clauses.join(" ")}`;
    }
}
