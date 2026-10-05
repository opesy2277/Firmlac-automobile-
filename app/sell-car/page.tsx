"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  CarFront,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface Profile {
  user_type:
    | "buyer"
    | "dealer"
    | "private_seller"
    | "admin";
  country: string;
  city: string;
}

interface SelectedImage {
  file: File;
  preview: string;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 6 * 1024 * 1024;

export default function SellCarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState("");
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [title, setTitle] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] =
    useState("");

  const [condition, setCondition] =
    useState<"new" | "used">("used");

  const [images, setImages] =
    useState<SelectedImage[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("user_type, country, city")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (profileError || !profileData) {
        setError(
          "Could not load your seller profile."
        );
        setLoadingUser(false);
        return;
      }

      if (
        profileData.user_type !== "dealer" &&
        profileData.user_type !==
          "private_seller"
      ) {
        setError(
          "Only dealers and private sellers can create vehicle listings."
        );
        setLoadingUser(false);
        return;
      }

      setUserId(user.id);

      setProfile({
        user_type: profileData.user_type,
        country: profileData.country ?? "",
        city: profileData.city ?? "",
      });

      setCountry(profileData.country ?? "");
      setCity(profileData.city ?? "");

      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) return;

    if (
      images.length + files.length >
      MAX_IMAGES
    ) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );
      event.target.value = "";
      return;
    }

    const validImages: SelectedImage[] = [];

    for (const file of files) {
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
      ) {
        setError(
          "Only JPG, PNG, and WebP images are allowed."
        );
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name} is larger than 6MB.`
        );
        event.target.value = "";
        return;
      }

      validImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((current) => [
      ...current,
      ...validImages,
    ]);

    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => {
      const image = current[index];

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  }

  async function uploadImages(carId: string) {
    const uploadedImages: {
      path: string;
      url: string;
    }[] = [];

    try {
      for (
        let index = 0;
        index < images.length;
        index++
      ) {
        const image = images[index];

        if (!image) continue;

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const path =
          `${carId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("car-images")
            .upload(path, image.file, {
              cacheControl: "3600",
              upsert: false,
              contentType: image.file.type,
            });

        if (uploadError) {
          throw new Error(
            `Image upload failed: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("car-images")
          .getPublicUrl(path);

        const publicUrl =
          publicUrlData.publicUrl;

        uploadedImages.push({
          path,
          url: publicUrl,
        });

        const imageTitle =
          title.trim() ||
          `${make.trim()} ${model.trim()}`.trim();

        const {
          error: imageInsertError,
        } = await supabase
          .from("car_images")
          .insert({
            car_id: carId,
            url: publicUrl,
            alt: `${imageTitle} vehicle image ${
              index + 1
            }`,
            sort_order: index + 1,
          });

        if (imageInsertError) {
          throw new Error(
            `Could not save image information: ${imageInsertError.message}`
          );
        }
      }

      return uploadedImages;
    } catch (uploadError) {
      if (uploadedImages.length > 0) {
        await supabase.storage
          .from("car-images")
          .remove(
            uploadedImages.map(
              (image) => image.path
            )
          );
      }

      throw uploadError;
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    /*
     * IMPORTANT:
     * Get the authenticated user again at the exact
     * moment the listing is submitted.
     */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError(
        "Your login session has expired. Please sign in again."
      );
      router.push("/login");
      return;
    }

    /*
     * Get the profile again so the RLS values are
     * based on the same authenticated user.
     */
    const {
      data: currentProfile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("user_type, country, city")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !currentProfile
    ) {
      setError(
        "Could not verify your seller profile."
      );
      return;
    }

    if (
      currentProfile.user_type !== "dealer" &&
      currentProfile.user_type !==
        "private_seller"
    ) {
      setError(
        "Only dealers and private sellers can create vehicle listings."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a listing title."
      );
      return;
    }

    if (!make.trim()) {
      setError(
        "Please enter the vehicle make."
      );
      return;
    }

    if (!model.trim()) {
      setError(
        "Please enter the vehicle model."
      );
      return;
    }

    const numericYear = Number(year);
    const numericPrice = Number(price);
    const numericMileage = Number(mileage);

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 1900 ||
      numericYear >
        new Date().getFullYear() + 1
    ) {
      setError(
        "Please enter a valid vehicle year."
      );
      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError(
        "Please enter a valid vehicle price."
      );
      return;
    }

    if (
      !Number.isFinite(numericMileage) ||
      numericMileage < 0
    ) {
      setError(
        "Please enter valid mileage."
      );
      return;
    }

    if (!country.trim()) {
      setError(
        "Please enter the country."
      );
      return;
    }

    if (!city.trim()) {
      setError(
        "Please enter the city."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Please add a vehicle description."
      );
      return;
    }

    if (images.length === 0) {
      setError(
        "Please upload at least one vehicle image."
      );
      return;
    }

    setSubmitting(true);

    let createdCarId: string | null = null;
    let uploadedStoragePaths: string[] = [];

    try {
      /*
       * Generate the listing ID ourselves.
       *
       * This means we do NOT need:
       * .select("id").single()
       *
       * after inserting a pending listing.
       */
      const carId = crypto.randomUUID();

      createdCarId = carId;

      /*
       * These values now come directly from the
       * currently authenticated Supabase user.
       */
      const sellerId = user.id;
      const sellerType =
        currentProfile.user_type;

      const { error: insertError } =
        await supabase
          .from("car_listings")
          .insert({
            id: carId,
            title: title.trim(),
            make: make.trim(),
            model: model.trim(),
            year: numericYear,
            price: numericPrice,
            currency: "NGN",
            mileage: numericMileage,
            country: country.trim(),
            state: state.trim() || null,
            city: city.trim(),
            description: description.trim(),
            condition,
            seller_type: sellerType,
            seller_id: sellerId,
            status: "pending",
          });

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      const uploadedImages =
        await uploadImages(carId);

      uploadedStoragePaths =
        uploadedImages.map(
          (image) => image.path
        );

      setSuccess(
        "Your vehicle has been submitted successfully. It is now waiting for admin approval."
      );

      for (const image of images) {
        URL.revokeObjectURL(image.preview);
      }

      setImages([]);

      setTimeout(() => {
        router.push("/my-listings");
        router.refresh();
      }, 1200);
    } catch (submitError) {
      console.error(
        "SELL CAR ERROR:",
        submitError
      );

      /*
       * Clean up uploaded Storage files.
       */
      if (
        uploadedStoragePaths.length > 0
      ) {
        await supabase.storage
          .from("car-images")
          .remove(
            uploadedStoragePaths
          );
      }

      /*
       * Clean up image database rows.
       */
      if (createdCarId) {
        await supabase
          .from("car_images")
          .delete()
          .eq(
            "car_id",
            createdCarId
          );

        /*
         * Clean up the vehicle listing.
         */
        await supabase
          .from("car_listings")
          .delete()
          .eq(
            "id",
            createdCarId
          )
          .eq(
            "seller_id",
            user.id
          );
      }

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting your listing."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-[var(--fa-background)]">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <Loader2
            size={30}
            className="animate-spin text-[var(--fa-blue)]"
          />
        </div>
      </main>
    );
  }

  if (
    profile &&
    profile.user_type !== "dealer" &&
    profile.user_type !== "private_seller"
  ) {
    return (
      <main className="min-h-screen bg-[var(--fa-background)] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <CarFront
            size={42}
            className="mx-auto mb-4 text-[var(--fa-red)]"
          />

          <h1 className="text-2xl font-bold text-[var(--fa-text)]">
            Selling is unavailable
          </h1>

          <p className="mt-2 text-gray-600">
            Only dealers and private sellers
            can create vehicle listings.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--fa-background)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--fa-blue)] hover:underline"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fa-navy)] text-white">
              <CarFront size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[var(--fa-text)]">
                Sell a Car
              </h1>

              <p className="mt-1 text-gray-600">
                Add your vehicle and submit it
                for admin review.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[var(--fa-text)]">
              Vehicle Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Listing Title"
                value={title}
                onChange={setTitle}
                placeholder="2022 Toyota Camry SE"
              />

              <Field
                label="Make"
                value={make}
                onChange={setMake}
                placeholder="Toyota"
              />

              <Field
                label="Model"
                value={model}
                onChange={setModel}
                placeholder="Camry"
              />

              <Field
                label="Year"
                value={year}
                onChange={setYear}
                placeholder="2022"
                type="number"
              />

              <Field
                label="Price"
                value={price}
                onChange={setPrice}
                placeholder="25000000"
                type="number"
              />

              <Field
                label="Mileage"
                value={mileage}
                onChange={setMileage}
                placeholder="45000"
                type="number"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--fa-text)]">
                  Condition
                </label>

                <select
                  value={condition}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    if (
                      value === "new" ||
                      value === "used"
                    ) {
                      setCondition(value);
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 outline-none focus:border-[var(--fa-blue)]"
                >
                  <option value="used">
                    Used
                  </option>

                  <option value="new">
                    New
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[var(--fa-text)]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={6}
                placeholder="Describe the vehicle, condition, features, service history and anything buyers should know."
                className="w-full resize-none rounded-xl border border-[var(--fa-border)] bg-white p-4 outline-none focus:border-[var(--fa-blue)]"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[var(--fa-text)]">
              Location
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
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
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--fa-border)] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--fa-text)]">
                  Vehicle Photos
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload up to {MAX_IMAGES} JPG,
                  PNG or WebP images.
                </p>
              </div>

              <span className="text-sm font-semibold text-gray-500">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>

            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--fa-border)] bg-gray-50 px-5 py-8 text-center transition hover:border-[var(--fa-blue)] hover:bg-blue-50">
              <Upload
                size={30}
                className="mb-3 text-[var(--fa-blue)]"
              />

              <span className="font-semibold text-[var(--fa-text)]">
                Upload vehicle photos
              </span>

              <span className="mt-1 text-sm text-gray-500">
                JPG, PNG or WebP • Maximum 6MB
                each
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImages}
                disabled={
                  images.length >= MAX_IMAGES
                }
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map(
                  (image, index) => (
                    <div
                      key={`${image.file.name}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-[var(--fa-border)] bg-gray-100"
                    >
                      <img
                        src={image.preview}
                        alt={`Vehicle preview ${
                          index + 1
                        }`}
                        className="aspect-[4/3] w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-[var(--fa-navy)] px-2.5 py-1 text-xs font-semibold text-white">
                          Main photo
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm hover:bg-white"
                        aria-label={`Remove image ${
                          index + 1
                        }`}
                        title="Remove image"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {images.length === 0 && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                <ImagePlus size={20} />
                Add clear photos showing the
                vehicle from different angles.
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push("/my-listings")
              }
              disabled={submitting}
              className="rounded-xl border border-[var(--fa-border)] bg-white px-6 py-3 font-semibold text-[var(--fa-text)] hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fa-blue)] px-7 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload size={19} />
                  Submit Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--fa-text)]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-[var(--fa-border)] bg-white px-4 outline-none transition focus:border-[var(--fa-blue)]"
      />
    </div>
  );
}