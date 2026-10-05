"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  CarFront,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type SellerType = "dealer" | "private_seller";
type Condition = "new" | "used";

type ImagePreview = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_FILE_SIZE = 6 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function VehicleForm() {
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
  const [condition, setCondition] =
    useState<Condition>("used");
  const [sellerType, setSellerType] =
    useState<SellerType>("dealer");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [images]);

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setErrorMessage("");

    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const validImages: ImagePreview[] = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrorMessage(
          "Only JPG, PNG, and WebP images are allowed."
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          `${file.name} is larger than 6MB.`
        );
        continue;
      }

      validImages.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setImages((current) => [
      ...current,
      ...validImages,
    ]);

    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const imageToRemove = current.find(
        (image) => image.id === id
      );

      if (imageToRemove) {
        URL.revokeObjectURL(
          imageToRemove.previewUrl
        );
      }

      return current.filter(
        (image) => image.id !== id
      );
    });
  }

  function validateForm(): string | null {
    if (!title.trim()) {
      return "Vehicle title is required.";
    }

    if (!make.trim()) {
      return "Vehicle make is required.";
    }

    if (!model.trim()) {
      return "Vehicle model is required.";
    }

    const yearNumber = Number(year);

    if (
      !year ||
      !Number.isInteger(yearNumber) ||
      yearNumber < 1900 ||
      yearNumber > new Date().getFullYear() + 1
    ) {
      return "Please enter a valid vehicle year.";
    }

    const priceNumber = Number(price);

    if (
      !price ||
      !Number.isFinite(priceNumber) ||
      priceNumber <= 0
    ) {
      return "Please enter a valid vehicle price.";
    }

    const mileageNumber = Number(mileage);

    if (
      !mileage ||
      !Number.isFinite(mileageNumber) ||
      mileageNumber < 0
    ) {
      return "Please enter valid mileage.";
    }

    if (!country.trim()) {
      return "Country is required.";
    }

    if (!city.trim()) {
      return "City is required.";
    }

    if (!description.trim()) {
      return "Vehicle description is required.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    console.log(
      "CREATE VEHICLE BUTTON CLICKED"
    );

    if (submitting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    console.log(
      "VALIDATION RESULT:",
      validationError
    );

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);

    let listingId: string | null = null;
    const uploadedPaths: string[] = [];

    try {
     console.log("Checking authenticated user...");

console.log(
  "SUPABASE URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

console.log(
  "SUPABASE PUBLISHABLE KEY EXISTS:",
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
);

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

console.log("AUTH USER:", user);
console.log("AUTH ERROR:", userError);

      console.log("AUTH USER:", user);

      if (userError) {
        throw new Error(
          `Authentication error: ${userError.message}`
        );
      }

      if (!user) {
        throw new Error(
          "You must be logged in to create a vehicle."
        );
      }

      console.log(
        "Creating vehicle listing..."
      );

      const {
        data: listing,
        error: listingError,
      } = await supabase
        .from("car_listings")
        .insert({
          title: title.trim(),
          make: make.trim(),
          model: model.trim(),
          year: Number(year),
          price: Number(price),
          currency,
          mileage: Number(mileage),
          country: country.trim(),
          state: state.trim() || null,
          city: city.trim(),
          description: description.trim(),
          condition,
          seller_type: sellerType,
          seller_id: user.id,
          status: "active",
        })
        .select("id")
        .single();

      console.log("LISTING RESULT:", {
        listing,
        listingError,
      });

      if (listingError) {
        throw new Error(
          `Could not create vehicle: ${listingError.message}`
        );
      }

      if (!listing?.id) {
        throw new Error(
          "Vehicle was created but no vehicle ID was returned."
        );
      }

      listingId = listing.id;

      console.log(
        "VEHICLE CREATED:",
        listing.id
      );

      /*
       * Verify that the browser client can see
       * the required Storage bucket.
       */
      console.log(
  "Starting vehicle image uploads..."
);

console.log(
  "Storage bucket:",
  "car-images"
);

      for (
        let index = 0;
        index < images.length;
        index++
      ) {
        const image = images[index];

        console.log(
          `Uploading image ${index + 1}...`
        );

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const storagePath =
          `${listing.id}/${crypto.randomUUID()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("car-images")
          .upload(
            storagePath,
            image.file,
            {
              cacheControl: "3600",
              contentType: image.file.type,
              upsert: false,
            }
          );

        console.log(
          "UPLOAD RESULT:",
          {
            storagePath,
            uploadError,
          }
        );

        if (uploadError) {
          throw new Error(
            `Could not upload image ${index + 1}: ${uploadError.message}`
          );
        }

        uploadedPaths.push(storagePath);

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("car-images")
          .getPublicUrl(storagePath);

        const publicUrl =
          publicUrlData.publicUrl;

        console.log(
          "PUBLIC IMAGE URL:",
          publicUrl
        );

        const {
          error: imageRecordError,
        } = await supabase
          .from("car_images")
          .insert({
            car_id: listing.id,
            url: publicUrl,
            alt:
              `${year} ${make} ${model}`.trim(),
            sort_order: index + 1,
          });

        console.log(
          "IMAGE DATABASE RESULT:",
          imageRecordError
        );

        if (imageRecordError) {
          throw new Error(
            `Could not save image ${index + 1}: ${imageRecordError.message}`
          );
        }
      }

      console.log(
        "VEHICLE CREATION COMPLETED SUCCESSFULLY"
      );

      setSuccessMessage(
        "Vehicle created successfully."
      );

      images.forEach((image) => {
        URL.revokeObjectURL(
          image.previewUrl
        );
      });

      router.push("/admin/vehicles");
      router.refresh();
    } catch (error) {
      console.error(
        "ADMIN VEHICLE CREATION ERROR:",
        error
      );

      if (uploadedPaths.length > 0) {
        const {
          error: cleanupStorageError,
        } = await supabase.storage
          .from("car-images")
          .remove(uploadedPaths);

        if (cleanupStorageError) {
          console.error(
            "Storage cleanup error:",
            cleanupStorageError
          );
        }
      }

      if (listingId) {
        const {
          error: cleanupListingError,
        } = await supabase
          .from("car_listings")
          .delete()
          .eq("id", listingId);

        if (cleanupListingError) {
          console.error(
            "Listing cleanup error:",
            cleanupListingError
          );
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the vehicle."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
            <CarFront size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--fa-text)]">
              Vehicle Information
            </h2>

            <p className="text-sm text-[var(--fa-text-secondary)]">
              Enter the basic details of the vehicle.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Vehicle Title"
            required
            value={title}
            onChange={setTitle}
            placeholder="2022 Toyota Camry"
          />

          <Field
            label="Make"
            required
            value={make}
            onChange={setMake}
            placeholder="Toyota"
          />

          <Field
            label="Model"
            required
            value={model}
            onChange={setModel}
            placeholder="Camry"
          />

          <Field
            label="Year"
            required
            type="number"
            value={year}
            onChange={setYear}
            placeholder="2022"
          />

          <Field
            label="Price"
            required
            type="number"
            value={price}
            onChange={setPrice}
            placeholder="25000000"
          />

          <SelectField
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={[
              {
                value: "NGN",
                label: "NGN — Nigerian Naira",
              },
              {
                value: "USD",
                label: "USD — US Dollar",
              },
              {
                value: "GBP",
                label: "GBP — British Pound",
              },
              {
                value: "EUR",
                label: "EUR — Euro",
              },
            ]}
          />

          <Field
            label="Mileage"
            required
            type="number"
            value={mileage}
            onChange={setMileage}
            placeholder="45000"
          />

          <SelectField
            label="Condition"
            value={condition}
            onChange={(value) =>
              setCondition(
                value as Condition
              )
            }
            options={[
              {
                value: "used",
                label: "Used",
              },
              {
                value: "new",
                label: "New",
              },
            ]}
          />

          <SelectField
            label="Seller Type"
            value={sellerType}
            onChange={(value) =>
              setSellerType(
                value as SellerType
              )
            }
            options={[
              {
                value: "dealer",
                label: "Dealer",
              },
              {
                value: "private_seller",
                label: "Private Seller",
              },
            ]}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--fa-text)]">
            Vehicle Location
          </h2>

          <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
            Tell buyers where the vehicle is located.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Field
            label="Country"
            required
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
            required
            value={city}
            onChange={setCity}
            placeholder="Ikeja"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--fa-text)]">
            Description
          </h2>

          <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
            Give buyers useful information about the vehicle.
          </p>
        </div>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder="Describe the vehicle, its condition, features, service history, and other important information..."
          rows={7}
          className="w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 py-3 text-sm text-[var(--fa-text)] outline-none transition placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
        />
      </section>

      <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fa-blue)] text-white">
            <ImagePlus size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--fa-text)]">
              Vehicle Images
            </h2>

            <p className="text-sm text-[var(--fa-text-secondary)]">
              JPG, PNG or WebP. Maximum 6MB per image.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--fa-border)] px-6 py-10 text-center transition hover:border-[var(--fa-blue)] hover:bg-slate-50">
          <Upload
            size={28}
            className="text-[var(--fa-blue)]"
          />

          <span className="mt-3 text-sm font-bold text-[var(--fa-text)]">
            Upload vehicle images
          </span>

          <span className="mt-1 text-xs text-[var(--fa-text-secondary)]">
            Click here to select one or more images
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {images.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-[var(--fa-border)] bg-slate-100"
              >
                <img
                  src={image.previewUrl}
                  alt={`Vehicle image ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-3 top-3 rounded-lg bg-[var(--fa-navy)] px-2.5 py-1 text-xs font-bold text-white">
                    Main Image
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    removeImage(image.id)
                  }
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-red-700"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[var(--fa-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Creating...
            </>
          ) : (
            <>
              <CarFront size={18} />
              Create Vehicle
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--fa-text)]">
        {label}

        {required && (
          <span className="ml-1 text-[var(--fa-red)]">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm text-[var(--fa-text)] outline-none transition placeholder:text-[var(--fa-text-secondary)] focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--fa-text)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 text-sm text-[var(--fa-text)] outline-none transition focus:border-[var(--fa-blue)] focus:ring-2 focus:ring-[var(--fa-blue)]/10"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}