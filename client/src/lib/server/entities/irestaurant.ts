export interface IRestaurant {
  id: number;
  description: string;
  logoUrl: string;
  name: string;
  mainImgUrl: string;
  openingHours?: string;
  telephoneNo?: string;
  website?: string;
  categories: string[];
  rating: number;
  reviewCount: number;
}
