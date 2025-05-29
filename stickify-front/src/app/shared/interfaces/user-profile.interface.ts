export interface UserProfile {
    username?: string | null;
    email?: string | null;
    premium?: boolean | null;
    followers?: string[]| null;
    following?: string[]| null;
}