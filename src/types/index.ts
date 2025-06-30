export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  purchaseUrl: string;
  category: string;
  impressions: number;
  stock: number;
  details?: {
    material?: string;
    fit?: string;
    care?: string;
  };
}

export interface CartItem {
  id: string;
  name:string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface StoryPage {
  imageUrl: string;
  productId?: string;
}

export interface Story {
  id: string;
  title: string;
  coverImageUrl: string;
  pages: StoryPage[];
}
