export interface IRestaurant {
  id: number;
  description: string;
  logo_url: string;
  name: string;
  main_img_url: string;
  opening_hours?: string;
  telephone_no?: string;
  website?: string;
  categories: string[];
  rating: number;
  reviewCount: number;
}
