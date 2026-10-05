"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CarUploadForm() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [mileage, setMileage] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState("used");
  const [sellerType, setSellerType] = useState("dealer");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    setImages((current) => [...current, ...files]);
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      if (!title || !make || !model || !year || !price) {
        throw new Error("Please fill in all required fields.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in as an admin.");
      }

      const { data: listing, error: listingError } = await supabase
        .from("car_listings")
        .insert({
          title,
          make,
          model,
          year: Number(year),
          price: Number(price),
          currency,
          mileage: mileage ? Number(mileage) : 0,
          country,
          state,
          city,
          description,
          condition,
          seller_type: sellerType,
          seller_id: user.id,
          status: "active",
        })
        .select("id")
        .single();

      if (listingError) {
        throw new Error(listingError.message);
      }

      if (images.length > 0) {
        for (let index = 0; index < images.length; index++) {
          const file = images[index];

          const extension =
            file.name.split(".").pop()?.toLowerCase() || "jpg";

          const filePath = `${listing.id}/${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from("car-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("car-images")
            .getPublicUrl(filePath);

          const { error: imageError } = await supabase
            .from("car_images")
            .insert({
              car_id: listing.id,
              url: publicUrl,
              alt: `${title} image ${index + 1}`,
              sort_order: index,
            });

          if (imageError) {
            throw new Error(imageError.message);
          }
        }
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm"
    >
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-[#344054]">
            Listing title *
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="2022 Toyota Camry XSE"
            className="w-full rounded-lg border border-[#d0d5dd] px-4 py-3 outline-none focus:border-[#1557c0]"
          />
        </div>

        <Field
          label="Make *"
          value={make}
          onChange={setMake}
          placeholder="Toyota"
        />

        <Field
          label="Model *"
          value={model}
          onChange={setModel}
          placeholder="Camry"
        />

        <Field
          label="Year *"
          value={year}
          onChange={setYear}
          placeholder="2022"
          type="number"
        />

        <Field
          label="Price *"
          value={price}
          onChange={setPrice}
          placeholder="25000000"
          type="number"
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#344054]">
            Currency
          </label>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-[#d0d5dd] bg-white px-4 py-3"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <Field
          label="Mileage"
          value={mileage}
          onChange={setMileage}
          placeholder="45000"
          type="number"
        />

        <Field
          label="Country"
          value={country}
          onChange={setCountry}
          placeholder="Nigeria"
        />

        <Field
          label="State"
          value={state}
          onChange={setState}
          placeholder="Lagos"
        />

        <Field
          label="City"
          value={city}
          onChange={setCity}
          placeholder="Lagos"
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#344054]">
            Condition
          </label>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-[#d0d5dd] bg-white px-4 py-3"
          >
            <option value="used">Used</option>
            <option value="new">New</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#344054]">
            Seller type
          </label>

          <select
            value={sellerType}
            onChange={(e) => setSellerType(e.target.value)}
            className="w-full rounded-lg border border-[#d0d5dd] bg-white px-4 py-3"
          >
            <option value="dealer">Dealer</option>
            <option value="private_seller">Private Seller</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-[#344054]">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the vehicle..."
            className="w-full resize-none rounded-lg border border-[#d0d5dd] px-4 py-3 outline-none focus:border-[#1557c0]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-[#344054]">
            Car photos
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d0d5dd] px-6 py-10 text-center hover:border-[#1557c0]">
            <ImagePlus className="mb-3 h-8 w-8 text-[#1557c0]" />

            <span className="font-semibold text-[#344054]">
              Upload car photos
            </span>

            <span className="mt-1 text-sm text-[#667085]">
              Select one or multiple images
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-[#e4e7ec]"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="h-32 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1557c0] px-6 py-3 font-semibold text-white hover:bg-[#0d2d63] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Uploading..." : "Publish Car"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#344054]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#d0d5dd] px-4 py-3 outline-none focus:border-[#1557c0]"
      />
    </div>
  );
}




