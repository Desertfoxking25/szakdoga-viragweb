import { Timestamp } from "firebase/firestore";

export interface Tip {
    id?: string;
    title: string;
    content: string;
    authorId: string;
    createdAt?: Timestamp;
}