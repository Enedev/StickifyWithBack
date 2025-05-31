export interface User {
    id?: string;
    username: string;
    email: string;
    password: string;
    premium?: boolean;
    followers?: string[];
    following?: string[];
}
