"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

  // Step 4: Review (no state needed, data is derived)

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
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

  const styles = {
    fontFamily: '"Linux Libertine", Georgia, Times, serif',
    color: "#202122",
  };

  const topBarStyle = {
    borderBottom: "1px solid #a2a9b1",
    padding: "8px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as const;

  const inputStyle = {
    backgroundColor: "#fff",
    border: "1px solid #a2a9b1",
    padding: "6px 8px",
    fontSize: "0.875em",
    color: "#202122",
    width: "100%",
  } as const;

  const labelStyle = {
    display: "block",
    fontSize: "0.875em",
    fontWeight: 500,
    color: "#202122",
    marginBottom: 4,
  } as const;

  const buttonStyle = {
    backgroundColor: "#f8f9fa",
    border: "1px solid #a2a9b1",
    color: "#202122",
    padding: "6px 16px",
    cursor: "pointer",
  } as const;

  const checkLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 0",
    cursor: "pointer",
  } as const;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <span style={{ fontWeight: 600 }}>WikiHome</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.875em" }}>{session?.user?.email ?? ""}</span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={buttonStyle}>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: 32 }}>
        {/* Step indicator (plain text, no progress bar) */}
        <div style={{ marginBottom: 24 }}>
          <span>
            Step {step} of 4 —{" "}
            {["Name your home", "What does your home have?", "What type of home is this?", "Review and create"][step - 1]}
          </span>
        </div>

        {/* Error display */}
        {errors.form && (
          <div style={{ marginBottom: 16, padding: 8, backgroundColor: "#fff", border: "1px solid #a2a9b1", fontSize: "0.875em" }}>
            {errors.form}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div>
            <label htmlFor="name" style={labelStyle}>
              Home name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder='e.g. "Main House", "Mountain Cabin"'
              autoFocus
            />
            {slug && (
              <p style={{ fontSize: "0.75em", color: "#54595d", marginTop: 4 }}>
                URL: /wiki/you/{slug}
              </p>
            )}
            {errors.name && (
              <p style={{ fontSize: "0.75em", color: "#a2a9b1" }}>{errors.name}</p>
            )}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} disabled={!name.trim()} style={{ ...buttonStyle, opacity: !name.trim() ? 0.5 : 1 }}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Features */}
        {step === 2 && (
          <div>
            <h2 style={{ fontWeight: "normal", borderBottom: "1px solid #a2a9b1", paddingBottom: 4, marginBottom: 16 }}>
              What does your home have?
            </h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFloors(n)}
                  style={{ ...buttonStyle, backgroundColor: floors === n ? "#a2a9b1" : "#f8f9fa" }}
                >
                  {n === 4 ? "4+" : n}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              {[
                { key: "hasBasement", label: "Basement" },
                { key: "hasAttic", label: "Attic" },
                { key: "hasGarage", label: "Garage" },
                { key: "hasBackyard", label: "Backyard" },
                { key: "hasPool", label: "Pool" },
                { key: "hasHotTub", label: "Hot Tub" },
                { key: "hasGuestHouse", label: "Guest House / ADU" },
              ].map(({ key, label }) => {
                const setter = key as keyof typeof hasBasement;
                return (
                  <label key={key} style={checkLabelStyle}>
                    <input
                      type="checkbox"
                      checked={key === "hasBasement" ? hasBasement : key === "hasAttic" ? hasAttic : key === "hasGarage" ? hasGarage : key === "hasBackyard" ? hasBackyard : key === "hasPool" ? hasPool : key === "hasHotTub" ? hasHotTub : hasGuestHouse}
                      onChange={(e) => {
                        if (key === "hasBasement") setHasBasement(e.target.checked);
                        else if (key === "hasAttic") setHasAttic(e.target.checked);
                        else if (key === "hasGarage") setHasGarage(e.target.checked);
                        else if (key === "hasBackyard") setHasBackyard(e.target.checked);
                        else if (key === "hasPool") setHasPool(e.target.checked);
                        else if (key === "hasHotTub") setHasHotTub(e.target.checked);
                        else setHasGuestHouse(e.target.checked);
                      }}
                    />
                    {label}
                  </label>
                );
              })}
            </div>

            {hasGarage && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Garage size</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setGarageSize(s)}
                      style={{ ...buttonStyle, backgroundColor: garageSize === s ? "#a2a9b1" : "#f8f9fa" }}
                    >
                      {s === 2 ? "Double" : "Single"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={buttonStyle}>
                Back
              </button>
              <button onClick={() => setStep(3)} style={buttonStyle}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Home type */}
        {step === 3 && (
          <div>
            <h2 style={{ fontWeight: "normal", borderBottom: "1px solid #a2a9b1", paddingBottom: 4, marginBottom: 16 }}>
              What type of home is this?
            </h2>

            {["owned", "renting", "rental"].map((type, i) => (
              <label key={type} style={checkLabelStyle}>
                <input
                  type="radio"
                  name="homeType"
                  value={type}
                  checked={homeType === type}
                  onChange={(e) => setHomeType(e.target.value)}
                />
                {[ "I own this home", "I am renting", "Rental property (I am the landlord)"][i]}
              </label>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={buttonStyle}>
                Back
              </button>
              <button onClick={() => setStep(4)} style={buttonStyle}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 style={{ fontWeight: "normal", borderBottom: "1px solid #a2a9b1", paddingBottom: 4, marginBottom: 16 }}>
              Review and create
            </h2>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr><td style={{ borderBottom: "1px solid #a2a9b1", padding: 8 }}>Name</td><td style={{ borderBottom: "1px solid #a2a9b1", padding: 8, fontWeight: 500 }}>{name}</td></tr>
                <tr><td style={{ borderBottom: "1px solid #a2a9b1", padding: 8 }}>Type</td><td style={{ borderBottom: "1px solid #a2a9b1", padding: 8, fontWeight: 500 }}>{homeType}</td></tr>
                <tr><td style={{ borderBottom: "1px solid #a2a9b1", padding: 8 }}>Floors</td><td style={{ borderBottom: "1px solid #a2a9b1", padding: 8, fontWeight: 500 }}>{floors === 4 ? "4+" : floors}</td></tr>
              </tbody>
            </table>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(3)} style={buttonStyle}>
                Back
              </button>
              <button onClick={handleCreate} disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.5 : 1 }}>
                {loading ? "Creating..." : "Create Home"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
