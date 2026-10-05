export type SellerType =
  | "firmlac"
  | "dealer"
  | "private_seller";

export type CarCondition =
  | "new"
  | "used";

export type ListingStatus =
  | "pending"
  | "active"
  | "sold"
  | "rejected"
  | "draft";

export interface CarImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface Car {
  id: string;

  title: string;
  make: string;
  model: string;
  year: number;

  price: number;
  currency: string;

  mileage: number;

  country: string;
  state?: string;
  city: string;

  description: string;

  condition: CarCondition;
  sellerType: SellerType;
  sellerId: string;

  images: CarImage[];

  status: ListingStatus;

  createdAt: string;
  updatedAt: string;
}