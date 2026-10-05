export type UserType =
  | "buyer"
  | "dealer"
  | "private_seller"
  | "admin";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: UserType;
  country: string;
  city: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}