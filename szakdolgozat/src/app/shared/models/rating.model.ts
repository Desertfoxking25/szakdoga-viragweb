import { Timestamp } from "firebase/firestore";

export interface Rating {
    id?: string;
    productId: string;
    userId: string;
    stars: number;
    reviewText?: string;
    createdAt: Timestamp;
}