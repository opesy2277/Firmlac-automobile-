import { requireAdmin } from "@/lib/auth/require-admin";
import CarUploadForm from "@/components/admin/CarUploadForm";

export default async function NewCarPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[#101828]">
          Add a Car
        </h1>

        <div className="mt-6">
          <CarUploadForm />
        </div>
      </div>
    </main>
  );
}