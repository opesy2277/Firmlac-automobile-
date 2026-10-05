import { Car, CarImage } from "@/types/car";

type DatabaseCarImage = {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
};

type DatabaseCar = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number | string;
  currency: string;
  mileage: number;
  country: string;
  state: string | null;
  city: string;
  description: string;
  condition: "new" | "used";
  seller_type: "firmlac" | "dealer" | "private_seller";
  seller_id: string;
  status: "pending" | "active" | "sold" | "rejected" | "draft";
  created_at: string;
  updated_at: string;
  car_images?: DatabaseCarImage[] | null;
};

export function mapDatabaseCarToCar(
  databaseCar: DatabaseCar
): Car {
  const images: CarImage[] = (
    databaseCar.car_images ?? []
  )
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order
    )
    .map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sort_order,
    }));

  return {
    id: databaseCar.id,

    title: databaseCar.title,
    make: databaseCar.make,
    model: databaseCar.model,
    year: databaseCar.year,

    price: Number(databaseCar.price),
    currency: databaseCar.currency,

    mileage: databaseCar.mileage,

    country: databaseCar.country,
    state: databaseCar.state ?? undefined,
    city: databaseCar.city,

    description: databaseCar.description,

    condition: databaseCar.condition,
    sellerType: databaseCar.seller_type,
    sellerId: databaseCar.seller_id,

    images,

    status: databaseCar.status,

    createdAt: databaseCar.created_at,
    updatedAt: databaseCar.updated_at,
  };
}

export function mapDatabaseCarsToCars(
  databaseCars: DatabaseCar[]
): Car[] {
  return databaseCars.map(
    mapDatabaseCarToCar
  );
}