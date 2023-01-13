import Entity from "./db entities";
import dbConnection from ".";
import { QueryError, QueryResult } from "./controllers";

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

class AndClause extends Clause {
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
        return `AND ${this.column} ${this.operator} ${this.value}`;
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
//#endregion

export default class Query<T> {
    private selectClause = undefined as SelectClause;
    private clauses = [] as Clause[];
    private data = {} as object;
    private alias: string;

    select(...fields: string[]) {
        this.selectClause = new SelectClause(fields.length === 0 ? ["*"] : fields);
        return this;
    }

    static from<U extends Entity>(table: U & typeof Entity) {
        const query = new Query<U>();
        query.clauses.push(new FromClause(table));
        return query;
    }

    and(column: string, operator: Operators, value: any) {
        this.clauses.push(new AndClause(column, operator, value));
        return this;
    }

    or(column: string, operator: Operators, value: any) {
        this.clauses.push(new OrClause(column, operator, value));
        return this;
    }

    where(column: string, operator: Operators, value: any) {
        if (Array.isArray(value))
            value = `(${value.join(",")})`;
        
        this.clauses.push(new WhereClause(column, operator, value));
        return this;
    }

    join<U extends Entity>(type: JoinType,
        table: (typeof Entity) | Query<U>,
        left_col: string,
        operator: Operators,
        right_col: string): Query<T & U> {
        if (table instanceof Query) {
            const queryTable = table.toString() + (table.alias ? ` AS ${table.alias}` : "");
            this.clauses.push(new JoinClause(type, queryTable, left_col, operator, right_col));
        }
        else
            this.clauses.push(new JoinClause(type, table.tableName, left_col, operator, right_col));

        return this as Query<T & U>;
    }
    
    groupBy(...fields: string[]) {
        this.clauses.push(new GroupByClause(fields));
        return this;
    }

    static union(type: UnionType, ...queries: Query<any>[]) {
        const query = new Query<any>();
        query.clauses.push(new UnionClause(type, queries));

        return query;
    }

    setData(data: object) {
        this.data = data;
        return this;
    }
    
    as(alias: string) {
        this.alias = alias;
        return this;
    }

    toArray(): Promise<QueryError | T[]> {
        console.log(this.toString());
        return new Promise((resolve, _) => dbConnection.query(this.toString(), this.data, (err, result) => resolve(err ?? result as T[])));
    }

    toString() {
        return `(${this.selectClause ? this.selectClause + " " : ""}${this.clauses.map(clause => clause.toString()).join(" ")})`;
    }
}
