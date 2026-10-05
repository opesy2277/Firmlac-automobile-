"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type VehicleImage = {
  id: string;
  car_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

type Props = {
  vehicleId: string;
  vehicleName: string;
};

const MAX_FILE_SIZE = 6 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function VehicleImageManager({
  vehicleId,
  vehicleName,
}: Props) {
  const [images, setImages] = useState<VehicleImage[]>(
    []
  );

  const [loadingImages, setLoadingImages] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [savingImageId, setSavingImageId] =
    useState<string | null>(null);

  const [movingId, setMovingId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function verifyAdminSession() {
    const supabase = createClient();

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(
        `Session error: ${sessionError.message}`
      );
    }

    if (!sessionData.session) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error(
        "Your login session is no longer valid. Please log in again."
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userData.user.id)
      .single();

    if (profileError) {
      throw new Error(
        `Could not verify admin account: ${profileError.message}`
      );
    }

    if (profile?.user_type !== "admin") {
      throw new Error(
        "You do not have permission to manage vehicle images."
      );
    }

    return supabase;
  }

  async function loadImages() {
    setLoadingImages(true);
    setErrorMessage("");

    try {
      const supabase = await verifyAdminSession();

      const {
        data,
        error,
      } = await supabase
        .from("car_images")
        .select(`
          id,
          car_id,
          url,
          alt,
          sort_order
        `)
        .eq("car_id", vehicleId)
        .order("sort_order", {
          ascending: true,
        });

      if (error) {
        throw new Error(
          `Could not load images: ${error.message}`
        );
      }

      setImages(data ?? []);
    } catch (error) {
      setImages([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load vehicle images."
      );
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, [vehicleId]);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setUploading(true);

    try {
      const supabase = await verifyAdminSession();

      let nextOrder =
        images.length > 0
          ? Math.max(
              ...images.map(
                (image) => image.sort_order
              )
            ) + 1
          : 1;

      for (const file of files) {
        if (
          !ALLOWED_IMAGE_TYPES.includes(
            file.type
          )
        ) {
          throw new Error(
            `${file.name}: only JPG, PNG, and WebP images are allowed.`
          );
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `${file.name}: maximum image size is 6MB.`
          );
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const storagePath =
          `${vehicleId}/${crypto.randomUUID()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("car-images")
          .upload(
            storagePath,
            file,
            {
              cacheControl: "3600",
              contentType: file.type,
              upsert: false,
            }
          );

        if (uploadError) {
          throw new Error(
            `Could not upload ${file.name}: ${uploadError.message}`
          );
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("car-images")
          .getPublicUrl(
            storagePath
          );

        const {
          data: imageRecord,
          error: imageError,
        } = await supabase
          .from("car_images")
          .insert({
            car_id: vehicleId,
            url: publicUrlData.publicUrl,
            alt: `${vehicleName} vehicle image`,
            sort_order: nextOrder,
          })
          .select(`
            id,
            car_id,
            url,
            alt,
            sort_order
          `)
          .single();

        if (imageError) {
          await supabase.storage
            .from("car-images")
            .remove([storagePath]);

          throw new Error(
            `Could not save ${file.name}: ${imageError.message}`
          );
        }

        if (imageRecord) {
          setImages((current) =>
            [...current, imageRecord].sort(
              (a, b) =>
                a.sort_order -
                b.sort_order
            )
          );
        }

        nextOrder++;
      }

      setSuccessMessage(
        files.length === 1
          ? "Vehicle image uploaded successfully."
          : "Vehicle images uploaded successfully."
      );
    } catch (error) {
      console.error(
        "UPLOAD IMAGE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading images."
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveImageAlt(
    image: VehicleImage
  ) {
    setSavingImageId(image.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = await verifyAdminSession();

      const {
        data,
        error,
      } = await supabase
        .from("car_images")
        .update({
          alt:
            image.alt?.trim() || null,
        })
        .eq("id", image.id)
        .eq("car_id", vehicleId)
        .select("id")
        .single();

      if (error) {
        throw new Error(
          `Could not save image description: ${error.message}`
        );
      }

      if (!data) {
        throw new Error(
          "Image description was not updated."
        );
      }

      setSuccessMessage(
        "Image description updated successfully."
      );
    } catch (error) {
      console.error(
        "SAVE IMAGE DESCRIPTION ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save image description."
      );
    } finally {
      setSavingImageId(null);
    }
  }

  async function deleteImage(
    image: VehicleImage
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this vehicle image?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(image.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = await verifyAdminSession();

      const storagePath =
        getStoragePathFromUrl(image.url);

      const {
        data: deletedImage,
        error: deleteError,
      } = await supabase
        .from("car_images")
        .delete()
        .eq("id", image.id)
        .eq("car_id", vehicleId)
        .select("id")
        .single();

      if (deleteError) {
        throw new Error(
          `Could not delete image: ${deleteError.message}`
        );
      }

      if (!deletedImage) {
        throw new Error(
          "The image was not deleted."
        );
      }

      if (storagePath) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("car-images")
          .remove([storagePath]);

        if (storageError) {
          console.warn(
            "Storage cleanup failed:",
            storageError.message
          );
        }
      }

      setImages((current) =>
        current.filter(
          (item) => item.id !== image.id
        )
      );

      await normalizeImageOrder(
        supabase
      );

      setSuccessMessage(
        "Image deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE IMAGE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not delete image."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function makeMainImage(
    image: VehicleImage
  ) {
    if (image.sort_order === 1) {
      return;
    }

    setMovingId(image.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = await verifyAdminSession();

      const orderedImages = [...images].sort(
        (a, b) =>
          a.sort_order - b.sort_order
      );

      const selectedIndex =
        orderedImages.findIndex(
          (item) =>
            item.id === image.id
        );

      if (selectedIndex === -1) {
        throw new Error(
          "Could not find the selected image."
        );
      }

      const reordered = [
        orderedImages[selectedIndex],
        ...orderedImages.filter(
          (_, index) =>
            index !== selectedIndex
        ),
      ];

      await saveImageOrder(
        supabase,
        reordered
      );

      setImages(
        reordered.map(
          (item, index) => ({
            ...item,
            sort_order: index + 1,
          })
        )
      );

      setSuccessMessage(
        "Main vehicle image updated."
      );
    } catch (error) {
      console.error(
        "MAKE MAIN IMAGE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not change the main image."
      );
    } finally {
      setMovingId(null);
    }
  }

  async function moveImage(
    image: VehicleImage,
    direction: "up" | "down"
  ) {
    setMovingId(image.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = await verifyAdminSession();

      const orderedImages = [...images].sort(
        (a, b) =>
          a.sort_order - b.sort_order
      );

      const currentIndex =
        orderedImages.findIndex(
          (item) =>
            item.id === image.id
        );

      if (currentIndex === -1) {
        throw new Error(
          "Could not find the selected image."
        );
      }

      const targetIndex =
        direction === "up"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= orderedImages.length
      ) {
        return;
      }

      [
        orderedImages[currentIndex],
        orderedImages[targetIndex],
      ] = [
        orderedImages[targetIndex],
        orderedImages[currentIndex],
      ];

      await saveImageOrder(
        supabase,
        orderedImages
      );

      setImages(
        orderedImages.map(
          (item, index) => ({
            ...item,
            sort_order: index + 1,
          })
        )
      );

      setSuccessMessage(
        "Image order updated."
      );
    } catch (error) {
      console.error(
        "MOVE IMAGE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not change image order."
      );
    } finally {
      setMovingId(null);
    }
  }

  async function saveImageOrder(
    supabase: ReturnType<typeof createClient>,
    orderedImages: VehicleImage[]
  ) {
    /*
     * Use temporary negative positions first.
     * This prevents duplicate sort positions
     * from interfering with the reorder.
     */
    for (
      let index = 0;
      index < orderedImages.length;
      index++
    ) {
      const image =
        orderedImages[index];

      const { error } =
        await supabase
          .from("car_images")
          .update({
            sort_order: -(index + 1),
          })
          .eq("id", image.id)
          .eq("car_id", vehicleId);

      if (error) {
        throw new Error(
          `Could not prepare image order: ${error.message}`
        );
      }
    }

    for (
      let index = 0;
      index < orderedImages.length;
      index++
    ) {
      const image =
        orderedImages[index];

      const { error } =
        await supabase
          .from("car_images")
          .update({
            sort_order: index + 1,
          })
          .eq("id", image.id)
          .eq("car_id", vehicleId);

      if (error) {
        throw new Error(
          `Could not save image order: ${error.message}`
        );
      }
    }
  }

  async function normalizeImageOrder(
    supabase: ReturnType<typeof createClient>
  ) {
    const orderedImages = [...images]
      .filter(
        (image) =>
          image.id !== deletingId
      )
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order
      );

    for (
      let index = 0;
      index < orderedImages.length;
      index++
    ) {
      const image =
        orderedImages[index];

      await supabase
        .from("car_images")
        .update({
          sort_order: index + 1,
        })
        .eq("id", image.id)
        .eq("car_id", vehicleId);
    }

    setImages(
      orderedImages.map(
        (image, index) => ({
          ...image,
          sort_order: index + 1,
        })
      )
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--fa-text)]">
              Vehicle Images
            </h2>

            <p className="mt-1 text-sm text-[var(--fa-text-secondary)]">
              {vehicleName}
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--fa-blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--fa-navy)]">
            {uploading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Add Images
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-[var(--fa-text-secondary)]">
          <p>
            JPG, PNG, and WebP images are supported.
            Maximum file size is 6MB per image.
          </p>
        </div>
      </section>

      {loadingImages ? (
        <section className="flex justify-center rounded-2xl border border-[var(--fa-border)] bg-white p-12 shadow-sm">
          <Loader2
            size={32}
            className="animate-spin text-[var(--fa-blue)]"
          />
        </section>
      ) : images.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--fa-border)] bg-white p-12 text-center shadow-sm">
          <ImagePlus
            size={42}
            className="mx-auto text-[var(--fa-blue)]"
          />

          <h2 className="mt-4 text-lg font-bold text-[var(--fa-text)]">
            No images yet
          </h2>

          <p className="mt-2 text-sm text-[var(--fa-text-secondary)]">
            Add vehicle photos using the Add Images
            button above.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images
            .sort(
              (a, b) =>
                a.sort_order - b.sort_order
            )
            .map((image, index) => {
              const isFirst = index === 0;
              const isLast =
                index === images.length - 1;

              return (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border border-[var(--fa-border)] bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={image.url}
                      alt={
                        image.alt ||
                        `${vehicleName} vehicle image`
                      }
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-[var(--fa-text)] shadow">
                        #{index + 1}
                      </span>

                      {isFirst && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--fa-navy)] px-3 py-1.5 text-xs font-bold text-white shadow">
                          <Check size={14} />
                          Main Image
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-[var(--fa-text-secondary)]">
                        Image Description / Alt Text
                      </span>

                      <input
                        value={image.alt ?? ""}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setImages((current) =>
                            current.map(
                              (item) =>
                                item.id === image.id
                                  ? {
                                      ...item,
                                      alt: value,
                                    }
                                  : item
                            )
                          );
                        }}
                        placeholder="Describe this vehicle image"
                        className="h-10 w-full rounded-lg border border-[var(--fa-border)] px-3 text-sm outline-none focus:border-[var(--fa-blue)]"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          moveImage(
                            image,
                            "up"
                          )
                        }
                        disabled={
                          isFirst ||
                          movingId === image.id
                        }
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--fa-border)] px-3 py-2 text-xs font-bold text-[var(--fa-text)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowUp size={14} />
                        Move Up
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveImage(
                            image,
                            "down"
                          )
                        }
                        disabled={
                          isLast ||
                          movingId === image.id
                        }
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--fa-border)] px-3 py-2 text-xs font-bold text-[var(--fa-text)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowDown size={14} />
                        Move Down
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-[var(--fa-border)] pt-3">
                      {!isFirst ? (
                        <button
                          type="button"
                          onClick={() =>
                            makeMainImage(
                              image
                            )
                          }
                          disabled={
                            movingId === image.id
                          }
                          className="text-sm font-bold text-[var(--fa-blue)] hover:text-[var(--fa-navy)] disabled:opacity-50"
                        >
                          Make Main
                        </button>
                      ) : (
                        <span className="text-sm font-semibold text-[var(--fa-text-secondary)]">
                          Main image
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            saveImageAlt(
                              image
                            )
                          }
                          disabled={
                            savingImageId ===
                            image.id
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--fa-blue)] px-3 py-2 text-xs font-bold text-white hover:bg-[var(--fa-navy)] disabled:opacity-50"
                        >
                          {savingImageId ===
                          image.id ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Save size={14} />
                          )}

                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteImage(
                              image
                            )
                          }
                          disabled={
                            deletingId ===
                            image.id
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          image.id ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={14} />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      )}
    </div>
  );
}

function getStoragePathFromUrl(
  url: string
): string | null {
  try {
    const parsedUrl = new URL(url);

    const marker =
      "/storage/v1/object/public/car-images/";

    const index =
      parsedUrl.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const storagePath =
      parsedUrl.pathname.slice(
        index + marker.length
      );

    if (!storagePath) {
      return null;
    }

    return decodeURIComponent(
      storagePath
    );
  } catch {
    return null;
  }
}