"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HomeNav } from "@/components/ui/HomeNav";

export default function SetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Name
  const [name, setName] = useState("");

  // Step 2: Features
  const [floors, setFloors] = useState(1);
  const [hasBasement, setHasBasement] = useState(false);
  const [hasAttic, setHasAttic] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [garageSize, setGarageSize] = useState(1);
  const [hasBackyard, setHasBackyard] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasHotTub, setHasHotTub] = useState(false);
  const [hasGuestHouse, setHasGuestHouse] = useState(false);

  // Step 3: Type
  const [homeType, setHomeType] = useState("owned");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <p className="text-[#475569]">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  async function handleCreate() {
    setErrors({});
    setLoading(true);

    const res = await fetch("/api/homes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        homeType,
        floors,
        hasBasement,
        hasAttic,
        hasGarage,
        garageSize: hasGarage ? garageSize : 0,
        hasBackyard,
        hasPool,
        hasHotTub,
        hasGuestHouse,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors(data.errors || { form: "Failed to create home" });
      setLoading(false);
      return;
    }

    router.push(data.redirectUrl);
  }

  const inputClass =
    "w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#475569]";
  const labelClass = "block text-sm font-medium text-[#111827] mb-1";
  const radioLabelClass =
    "flex items-center gap-2 px-3 py-2 border border-[#e2e8f0] rounded-md cursor-pointer hover:border-[#475569] text-sm text-[#111827]";

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <HomeNav email={session?.user?.email ?? ""} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {["Name", "Features", "Type", "Review"].map((label, i) => (
              <div
                key={label}
                className={`text-xs font-medium ${
                  i + 1 <= step ? "text-[#475569]" : "text-[#e2e8f0]"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#475569] rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error display */}
        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {errors.form}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="border border-[#e2e8f0] rounded-lg bg-white p-8">
            <h2 className="text-xl font-semibold text-[#111827] mb-6">
              Name your home
            </h2>
            <div className="mb-4">
              <label htmlFor="name" className={labelClass}>
                Home name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder='e.g. "Main House", "Mountain Cabin"'
                autoFocus
              />
              {slug && (
                <p className="mt-1 text-xs text-[#475569]">
                  URL: /wiki/you/{slug}
                </p>
              )}
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="px-6 py-2 bg-[#475569] text-white rounded-md text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Features */}
        {step === 2 && (
          <div className="border border-[#e2e8f0] rounded-lg bg-white p-8">
            <h2 className="text-xl font-semibold text-[#111827] mb-6">
              What does your home have?
            </h2>

            <div className="space-y-6">
              {/* Floors */}
              <div>
                <label className={labelClass}>Floors</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFloors(n)}
                      className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                        floors === n
                          ? "bg-[#475569] text-white border-[#475569]"
                          : "border-[#e2e8f0] text-[#111827] hover:border-[#475569]"
                      }`}
                    >
                      {n === 4 ? "4+" : n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                {[
                  { key: "hasBasement", label: "Basement", value: hasBasement, set: setHasBasement },
                  { key: "hasAttic", label: "Attic", value: hasAttic, set: setHasAttic },
                  { key: "hasGarage", label: "Garage", value: hasGarage, set: setHasGarage },
                  { key: "hasBackyard", label: "Backyard", value: hasBackyard, set: setHasBackyard },
                  { key: "hasPool", label: "Pool", value: hasPool, set: setHasPool },
                  { key: "hasHotTub", label: "Hot Tub", value: hasHotTub, set: setHasHotTub },
                  { key: "hasGuestHouse", label: "Guest House / ADU", value: hasGuestHouse, set: setHasGuestHouse },
                ].map(({ key, label, value, set }) => (
                  <label key={key} className={radioLabelClass}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => set(e.target.checked)}
                      className="rounded border-[#e2e8f0] text-[#475569] focus:ring-[#475569]"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Garage size */}
              {hasGarage && (
                <div>
                  <label className={labelClass}>Garage size</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGarageSize(1)}
                      className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                        garageSize === 1
                          ? "bg-[#475569] text-white border-[#475569]"
                          : "border-[#e2e8f0] text-[#111827] hover:border-[#475569]"
                      }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setGarageSize(2)}
                      className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                        garageSize === 2
                          ? "bg-[#475569] text-white border-[#475569]"
                          : "border-[#e2e8f0] text-[#111827] hover:border-[#475569]"
                      }`}
                    >
                      Double
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-[#e2e8f0] text-[#111827] rounded-md text-sm font-medium hover:bg-[#f9fafb] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-[#475569] text-white rounded-md text-sm font-medium hover:bg-[#334155] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Home type */}
        {step === 3 && (
          <div className="border border-[#e2e8f0] rounded-lg bg-white p-8">
            <h2 className="text-xl font-semibold text-[#111827] mb-6">
              What type of home is this?
            </h2>
            <div className="space-y-3">
              {[
                { value: "owned", label: "I own this home" },
                { value: "renting", label: "I am renting" },
                { value: "rental", label: "Rental property (I am the landlord)" },
              ].map((option) => (
                <label key={option.value} className={radioLabelClass}>
                  <input
                    type="radio"
                    name="homeType"
                    value={option.value}
                    checked={homeType === option.value}
                    onChange={(e) => setHomeType(e.target.value)}
                    className="text-[#475569] focus:ring-[#475569]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-[#e2e8f0] text-[#111827] rounded-md text-sm font-medium hover:bg-[#f9fafb] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-[#475569] text-white rounded-md text-sm font-medium hover:bg-[#334155] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="border border-[#e2e8f0] rounded-lg bg-white p-8">
            <h2 className="text-xl font-semibold text-[#111827] mb-6">
              Review and create
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                <span className="text-[#475569]">Name</span>
                <span className="text-[#111827] font-medium">{name}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                <span className="text-[#475569]">Type</span>
                <span className="text-[#111827] font-medium capitalize">{homeType}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#e2e8f0]">
                <span className="text-[#475569]">Floors</span>
                <span className="text-[#111827] font-medium">{floors === 4 ? "4+" : floors}</span>
              </div>

              {[
                { label: "Basement", value: hasBasement },
                { label: "Attic", value: hasAttic },
                { label: `Garage${hasGarage ? ` (${garageSize === 2 ? "Double" : "Single"})` : ""}`, value: hasGarage },
                { label: "Backyard", value: hasBackyard },
                { label: "Pool", value: hasPool },
                { label: "Hot Tub", value: hasHotTub },
                { label: "Guest House", value: hasGuestHouse },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                  <span className="text-[#475569]">{label}</span>
                  <span className="text-[#111827] font-medium">
                    {value ? "✓" : "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-[#e2e8f0] text-[#111827] rounded-md text-sm font-medium hover:bg-[#f9fafb] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-6 py-2 bg-[#475569] text-white rounded-md text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating..." : "Create Home"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}