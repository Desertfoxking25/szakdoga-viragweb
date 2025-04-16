export interface CartItem {
    productId: string;
    name: string;
    price: number;
    imgUrl: string;
    quantity: number;
  }
  
  export interface Cart {
    userId: string;
    items: CartItem[];
  }