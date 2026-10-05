"use client";

import { Check, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  vehicleId: string;
  status: string;
  markSoldAction: (formData: FormData) => void;
  removeVehicleAction: (formData: FormData) => void;
};

export default function VehicleStatusActions({
  vehicleId,
  status,
  markSoldAction,
  removeVehicleAction,
}: Props) {
  const [removing, setRemoving] = useState(false);

  function handleRemove(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently remove this vehicle? This will also remove its uploaded images. This action cannot be undone."
    );

    if (!confirmed) {
      event.preventDefault();
      return;
    }

    setRemoving(true);
  }

  return (
    <div className="space-y-3">
      {status === "active" && (
        <form action={markSoldAction}>
          <input
            type="hidden"
            name="vehicleId"
            value={vehicleId}
          />

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            <Check size={18} />
            Mark as Sold
          </button>
        </form>
      )}

      <form
        action={removeVehicleAction}
        onSubmit={handleRemove}
      >
        <input
          type="hidden"
          name="vehicleId"
          value={vehicleId}
        />

        <button
          type="submit"
          disabled={removing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removing ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={18} />
          )}

          {removing ? "Removing..." : "Remove Vehicle"}
        </button>
      </form>
    </div>
  );
}