import { Timestamp } from "firebase/firestore";
import { CartItem } from "./CartItem.model";

export interface Order {
    id?: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
    createdAt: Timestamp;
    status?: 'új' | 'feldolgozás alatt' | 'teljesítve';
}