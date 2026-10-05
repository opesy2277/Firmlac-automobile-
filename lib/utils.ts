export function formatPrice(
  price: number,
  currency: string = "NGN"
): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function formatMileage(
  mileage: number
): string {
  return `${mileage.toLocaleString("en-NG")} km`;
}