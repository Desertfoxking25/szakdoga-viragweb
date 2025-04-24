export interface UserProfile {
    uid: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
}