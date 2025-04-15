export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string[];
    imgUrl: string;
    sales: boolean;
    featured: boolean;
    slug: string;
}