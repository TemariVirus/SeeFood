import { OkPacket as IOkPacket, QueryError as IQeuryError, ResultSetHeader as IResultSetHeader, RowDataPacket as IRowDataPacket } from "mysql2";
import Entity from "./db entities";
import dbConnection from "./index";

export type QueryResult = IRowDataPacket[] | IRowDataPacket[][] | IOkPacket | IOkPacket[] | IResultSetHeader;

export class QueryError implements IQeuryError {
    code: string;
    sqlStateMarker?: string;
    sqlState?: string;
    fieldCount?: number;
    fatal: boolean;
    errno?: number;
    path?: string;
    syscall?: string;
    name: string;
    message: string;
    stack?: string;
}

export default class Controller<T extends Entity> {
    private readonly tableName: string;
    private readonly autoIncColumns: string[];
    private readonly requiredColumns: string[];

    constructor(entity: typeof Entity) {
        this.tableName = entity.tableName;
        this.autoIncColumns = entity.autoIncColumns;
        this.requiredColumns = entity.requiredColumns;
    }

    private static formatValuesAsSql<T>(obj: T): T {
        if (typeof obj !== "object") {
            if (typeof obj === "string")
                return `'${obj}'` as T;
            else
                return obj;
        }

        let formatted = {} as T;
        for (let key in obj) {
            if (typeof obj[key] === "string")
                formatted[key] = `'${obj[key]}'` as any;
            else
                formatted[key] = obj[key];
        }
        return formatted;
    }

    public getAll(match: Partial<T> = {}, columns: string[] = [], limit: number = -1): Promise<T[] | QueryError> {
        match = Controller.formatValuesAsSql(match);

        // Ensure limit is an integer
        if (!Number.isInteger(limit)) {
            throw new Error("Limit must be an integer.");
        }

        // Construct query
        const keys = Object.keys(match);
        let query = "SELECT "
            + (columns.length === 0 ? '*' : columns.join(","))
            + " FROM " + this.tableName
            + (keys.length === 0 ? "" : " WHERE ")
            + keys.map(key => `${key} = ${match[key]}`).join(" AND ")
            + (limit < 0 ? "" : ` LIMIT ${limit}`);

        return Controller.promiseQuery(query, result => Object.values(result) as T[]) as Promise<T[]>;
    }

    public getFirst(match: Partial<T> = {}, columns: string[] = []): Promise<T | string | QueryError> {
        match = Controller.formatValuesAsSql(match);

        // Construct query
        const keys = Object.keys(match);
        let query = "SELECT "
            + (columns.length === 0 ? '*' : columns.join(","))
            + " FROM " + this.tableName
            + (keys.length === 0 ? "" : " WHERE ")
            + keys.map(key => `${key} = ${match[key]}`).join(" AND ")
            + " LIMIT 1";

        // Get row
        return Controller.promiseQuery(query, result => (result as any[]).length === 0 ? "No item has that id!" : result[0] as T);
    }

    public any(match: Partial<T> = {}): Promise<boolean | QueryError> {
        match = Controller.formatValuesAsSql(match);

        // Construct query
        const keys = Object.keys(match);
        let query = "SELECT COUNT(*) FROM "
            + this.tableName
            + (keys.length === 0 ? "" : " WHERE ")
            + keys.map(key => `${key} = ${match[key]}`).join(" AND ");

        // Get count
        return Controller.promiseQuery(query, result => result[0]["COUNT(*)"] > 0);
    }

    // Gets all rows that match any of the given matches
    public getMany(matches: Partial<T>[], columns: string[] = [], limit: number = -1): Promise<T[] | QueryError> {
        matches = matches.map(match => Controller.formatValuesAsSql(match));

        // Ensure limit is an integer
        if (!Number.isInteger(limit)) {
            throw new Error("Limit must be an integer.");
        }

        // Construct query
        let query = "SELECT "
            + (columns.length === 0 ? '*' : columns.join(","))
            + " FROM " + this.tableName
            + " WHERE "
            + matches.map(match => {
                const keys = Object.keys(match);
                return keys.map(key => `${key} = ${match[key]}`).join(" AND ");
            }).join(" OR ")
            + (limit < 0 ? "" : ` LIMIT ${limit}`);

        // Get rows
        return Controller.promiseQuery(query, result => Object.values(result) as T[]);
    }

    // Gets all rows that have one of the given values for any of the given keys
    public getByKeyValues(keys: keyof T | (keyof T)[], values: T[keyof T] | T[keyof T][], columns: string[] = [], limit: number = -1): Promise<T[] | QueryError> {
        // Ensure columns and matches are arrays
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        if (!Array.isArray(values)) {
            values = [values];
        }

        if (keys.length !== values.length) {
            throw new Error("Must have same number of columns and matches.");
        }

        // Group matches by columns
        let groupedMatches = {} as Record<keyof T, T[keyof T][]>;
        values = values.map(match => Controller.formatValuesAsSql(match));
        for (let i = 0; i < keys.length; i++) {
            const column = keys[i];
            groupedMatches[column] = groupedMatches[column] ?? [];
            groupedMatches[column].push(values[i]);
        }

        // Ensure limit is an integer
        if (!Number.isInteger(limit)) {
            throw new Error("Limit must be an integer.");
        }

        // Contruct query
        let query = "SELECT "
            + (columns.length === 0 ? '*' : columns.join(","))
            + " FROM " + this.tableName
            + " WHERE "
            + Object.keys(groupedMatches)
                .map(key => `${key} IN (${groupedMatches[key].join(",")})`)
                .join(" OR ")
            + (limit < 0 ? "" : ` LIMIT ${limit}`);

        // Get rows
        return Controller.promiseQuery<T[]>(query, result => Object.values(result) as T[]);
    }

    public addOne(item: T): Promise<QueryResult | QueryError> {
        // Remove auto incremented columns as they are handled by the database
        for (const key in this.autoIncColumns.values) {
            if (item[key]) {
                delete item[key];
            }
        }

        // Ensure all required columns are present
        for (const key in this.requiredColumns.values) {
            if (!item[key]) {
                throw new Error(`Missing required column ${key}.`);
            }
        }

        item = Controller.formatValuesAsSql(item);

        // Construct query
        const keys = Object.keys(item);
        let query = "INSERT INTO "
            + this.tableName
            + " ("
            + keys.join(", ")
            + ") VALUES ("
            + keys.map(key => item[key]).join(", ")
            + ")";

        // Add row
        return Controller.promiseQuery(query, result => result);
    }

    private static promiseQuery<T>(query: string, resultCallback: (result: QueryResult) => T): Promise<T | QueryError> {
        console.log(query);
        return new Promise((resolve, _) => dbConnection.query(query, (err, result) => resolve(err ?? resultCallback(result))));
    }
}
