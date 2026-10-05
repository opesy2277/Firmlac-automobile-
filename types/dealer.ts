export interface Dealer {
  id: string;

  profileId: string;

  businessName: string;
  description: string;

  logoUrl?: string;

  country: string;
  state?: string;
  city: string;
  address?: string;

  phone?: string;
  website?: string;

  verified: boolean;

  createdAt: string;
  updatedAt: string;
}