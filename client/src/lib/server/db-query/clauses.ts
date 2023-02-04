import type Query from ".";
import type { JoinType, SqlOperators, UnionType } from ".";

export abstract class Base {
  protected constructor() {
    Base.prototype.toString = this.toString;
  }

  public abstract toString(): string;
}

export abstract class Compare extends Base {
  protected column: string;
  protected operator: SqlOperators;
  protected value: any;

  constructor(column: string, operator: SqlOperators, value?: any) {
    super();
    this.column = column;
    this.operator = operator;

    // Escape strings
    if (typeof value === "string") value = `"${value.replaceAll('"', '\\"')}"`;
    if (Array.isArray(value)) {
      // Escape strings
      value = value.map((v) =>
        typeof v === "string" ? `"${v.replaceAll('"', '\\"')}"` : v
      );
      value = `(${value.join(",")})`;
    }
    // If value is undefined, use a placeholder
    this.value =
      value ??
      column
        .split(",")
        .map((_) => "?")
        .join(",");
  }
}

export class Select extends Base {
  private fields: string[];

  constructor(fields: string[]) {
    super();
    this.fields = fields;
  }

  toString() {
    return `SELECT ${this.fields.join(",")}`;
  }
}

export class Insert extends Base {
  private table: string;
  private fields: string[];

  constructor(table: string, fields: string[]) {
    super();
    this.table = table;
    this.fields = fields;
  }

  toString() {
    return `INSERT INTO ${this.table} (${this.fields.join(
      ","
    )}) VALUES (${this.fields.map((_) => "?").join(",")})`;
  }
}

export class Update extends Base {
  private table: string;

  constructor(table: string) {
    super();
    this.table = table;
  }

  toString() {
    return `UPDATE ${this.table}`;
  }
}

export class Delete extends Base {
  constructor() {
    super();
  }

  toString() {
    return "DELETE";
  }
}

export class From extends Base {
  private table: string;

  constructor(table: string | Query) {
    super();
    this.table = table.toString()!;
  }

  toString() {
    return `FROM ${this.table}`;
  }
}

export class Set extends Base {
  private fields: string[];

  constructor(obj: object) {
    super();
    this.fields = Object.keys(obj);
  }

  toString() {
    return `SET ${this.fields.map((field) => `${field} = ?`).join(",")}`;
  }
}

export class And extends Compare {
  constructor(column: string, operator: SqlOperators, value?: any) {
    super(column, operator, value);
  }

  public toString(): string {
    return `AND ${this.column} ${this.operator} ${this.value}`;
  }
}

export class Or extends Compare {
  constructor(column: string, operator: SqlOperators, value?: any) {
    super(column, operator, value);
  }

  public toString(): string {
    return `OR ${this.column} ${this.operator} ${this.value}`;
  }
}

export class Where extends Compare {
  constructor(column: string, operator: SqlOperators, value?: any) {
    super(column, operator, value);
  }

  toString() {
    return `WHERE ${this.column} ${this.operator} ${this.value}`;
  }
}

export class Join extends Base {
  private joinType: JoinType;
  private table: string;
  private condition: string;

  constructor(
    joinType: JoinType,
    table: string,
    left_col: string,
    operator: SqlOperators,
    right_col: string
  ) {
    super();
    this.joinType = joinType;
    this.table = table;
    this.condition = `${left_col} ${operator} ${right_col}`;
  }

  public toString(): string {
    return `${this.joinType} ${this.table} ON ${this.condition}`;
  }
}

export class GroupBy extends Base {
  private fields: string[];

  constructor(fields: string[]) {
    super();
    this.fields = fields;
  }

  public toString(): string {
    return `GROUP BY ${this.fields.join(",")}`;
  }
}

export class Union extends Base {
  private unionType: UnionType;
  private tables: (string | Query)[];

  constructor(unionType: UnionType, tables: (string | Query)[]) {
    super();
    this.unionType = unionType;
    this.tables = [...tables];
  }

  public toString(): string {
    return this.tables.map((t) => t.toString()!).join(` ${this.unionType} `);
  }
}

export class Limit extends Base {
  private limit: number;

  constructor(limit: number) {
    super();
    this.limit = limit;
  }

  public toString(): string {
    return `LIMIT ${this.limit}`;
  }
}
