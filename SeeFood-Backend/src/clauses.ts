import Entity from "./entities";
import { Query, JoinType, SqlOperators, UnionType } from "./query";

export abstract class Clause {
    protected constructor() {
        Clause.prototype.toString = this.toString;
    }

    public abstract toString(): string;
}

export abstract class CompareClause extends Clause {
    protected column: string;
    protected operator: SqlOperators;
    protected value: any;

    constructor(column: string, operator: SqlOperators, value?: any) {
        super();
        this.column = column;
        this.operator = operator;

        // Escape strings with quotes
        if (typeof value === "string")
            value = `"${value}"`;
        if (Array.isArray(value)) {
            // Escape strings with quotes
            value = value.map(v => typeof v === "string" ? `"${v}"` : v);
            value = `(${value.join(",")})`;
        }
        // If value is undefined, use a placeholder
        this.value = value ?? column.split(",").map(_ => "?").join(",");
    }
}

export class SelectClause extends Clause {
    private fields: string[];

    constructor(fields: string[]) {
        super();
        this.fields = fields;
    }

    toString() {
        return `SELECT ${this.fields.join(",")}`;
    }
}

export class InsertClause extends Clause {
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

export class UpdateClause extends Clause {
    private table: string;

    constructor(table: typeof Entity) {
        super();
        this.table = table.tableName;
    }

    toString() {
        return `UPDATE ${this.table}`;
    }
}

export class DeleteClause extends Clause {
    constructor() {
        super();
    }

    toString() {
        return "DELETE";
    }
}

export class FromClause extends Clause {
    private table: string;

    constructor(table: typeof Entity) {
        super();
        this.table = table.tableName;
    }

    toString() {
        return `FROM ${this.table}`;
    }
}

export class SetClause extends Clause {
    private fields: string[];

    constructor(obj: object) {
        super();
        this.fields = Object.keys(obj);
    }

    toString() {
        return `SET ${this.fields.map(field => `${field} = ?`).join(",")}`;
    }
}

export class AndClause extends CompareClause {
    constructor(column: string, operator: SqlOperators, value?: any) {
        super(column, operator, value);
    }

    public toString(): string {
        return `AND ${this.column} ${this.operator} ${this.value}`;
    }
}

export class OrClause extends CompareClause {
    constructor(column: string, operator: SqlOperators, value?: any) {
        super(column, operator, value);
    }

    public toString(): string {
        return `OR ${this.column} ${this.operator} ${this.value}`;
    }
}

export class WhereClause extends CompareClause {
    constructor(column: string, operator: SqlOperators, value?: any) {
        super(column, operator, value);
    }

    toString() {
        return `WHERE ${this.column} ${this.operator} ${this.value}`;
    }
}

export class JoinClause extends Clause {
    private joinType: JoinType;
    private table: string;
    private condition: string;

    constructor(joinType: JoinType, table: string, left_col: string, operator: SqlOperators, right_col: string) {
        super();
        this.joinType = joinType;
        this.table = table;
        this.condition = `${left_col} ${operator} ${right_col}`;
    }

    public toString(): string {
        return `${this.joinType} ${this.table} ON ${this.condition}`;
    }
}

export class GroupByClause extends Clause {
    private fields: string[];

    constructor(fields: string[]) {
        super();
        this.fields = fields;
    }

    public toString(): string {
        return `GROUP BY ${this.fields.join(",")}`;
    }
}

export class UnionClause extends Clause {
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

export class LimitClause extends Clause {
    private limit: number;

    constructor(limit: number) {
        super();
        this.limit = limit;
    }

    public toString(): string {
        return `LIMIT ${this.limit}`;
    }
}
