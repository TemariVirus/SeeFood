import Entity from '.';

export class Restaurant implements Entity {
    static readonly tableName = "restaurants";
    static readonly autoIncColumns: (keyof Restaurant)[] = ["id"];
    static readonly requiredColumns: (keyof Restaurant)[] = ["description", "logo_url", "name", "main_img_url"];

    id: number;
    description: string;
    logo_url: string;
    name: string;
    main_img_url: string;
    opening_hours?: string;
    telephone_no?: string;
    website?: string;
}
