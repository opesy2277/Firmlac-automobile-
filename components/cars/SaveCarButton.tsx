"use client";

import { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface SaveCarButtonProps {
  carId: string;
}

export default function SaveCarButton({
  carId,
}: SaveCarButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSaved() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // A logged-out user is normal.
      // Do not show it as a console error.
      if (userError || !user) {
        if (mounted) {
          setSaved(false);
          setLoading(false);
        }

        return;
      }

      const { data, error } = await supabase
        .from("saved_cars")
        .select("id")
        .eq("user_id", user.id)
        .eq("car_id", carId)
        .maybeSingle();

      if (error) {
        console.error(
          "CHECK SAVED CAR ERROR:",
          JSON.stringify(error, null, 2)
        );

        if (mounted) {
          setSaved(false);
          setLoading(false);
        }

        return;
      }

      if (mounted) {
        setSaved(Boolean(data));
        setLoading(false);
      }
    }

    checkSaved();

    return () => {
      mounted = false;
    };
  }, [carId, supabase]);

  async function toggleSaved() {
    if (saving) return;

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // User is not logged in.
    // Send them to the normal login page.
    if (userError || !user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    // Verify that the car exists.
    const { data: car, error: carError } = await supabase
      .from("car_listings")
      .select("id, title")
      .eq("id", carId)
      .maybeSingle();

    if (carError) {
      console.error(
        "CAR LOOKUP ERROR:",
        JSON.stringify(carError, null, 2)
      );

      setSaving(false);
      return;
    }

    if (!car) {
      console.error(
        "INVALID CAR ID:",
        carId,
        "does not exist in car_listings."
      );

      setSaving(false);
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("saved_cars")
        .delete()
        .eq("user_id", user.id)
        .eq("car_id", carId);

      if (error) {
        console.error(
          "REMOVE SAVED CAR ERROR:",
          JSON.stringify(error, null, 2)
        );

        setSaving(false);
        return;
      }

      setSaved(false);
    } else {
      const { error } = await supabase
        .from("saved_cars")
        .insert({
          user_id: user.id,
          car_id: car.id,
        });

      if (error) {
        console.error(
          "SAVE CAR DATABASE ERROR:",
          JSON.stringify(error, null, 2)
        );

        setSaving(false);
        return;
      }

      setSaved(true);
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading saved status"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm"
      >
        <Heart
          size={19}
          className="animate-pulse text-gray-400"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={saving}
      aria-label={
        saved ? "Remove saved car" : "Save car"
      }
      title={
        saved ? "Remove saved car" : "Save car"
      }
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition ${
        saving
          ? "cursor-not-allowed opacity-50"
          : "hover:scale-105"
      }`}
    >
      {saved ? (
        <Check
          size={19}
          strokeWidth={2.5}
          className="text-green-600"
        />
      ) : (
        <Heart
          size={19}
          className="text-gray-700"
        />
      )}
    </button>
  );
}