export const APP_NAME = "Firmlac Automobile";

export const DEFAULT_PAGE_SIZE = 24;

export const MAX_PAGE_SIZE = 48;

export const MAX_CAR_IMAGES = 20;

export const MAX_IMAGE_SIZE_MB = 10;

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const SELLER_TYPES = {
  FIRMLAC: "firmlac",
  DEALER: "dealer",
  PRIVATE_SELLER: "private_seller",
} as const;

export const LISTING_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SOLD: "sold",
  REJECTED: "rejected",
  DRAFT: "draft",
} as const;