export interface User {
    username: string;
    email: string;
    password: string;
    premium?: boolean;
    followers?: string[];
    following?: string[];
}
