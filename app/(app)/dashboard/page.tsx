import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    redirect("/login");
  }

  const userEmail = session.user.email;

  const homes = await db.home.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: { pages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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

  const pageHeadingStyle = {
    fontWeight: "normal" as const,
    borderBottom: "1px solid #a2a9b1",
    paddingBottom: 4,
    marginBottom: 16,
  } as const;

  const inputStyle = {
    backgroundColor: "#fff",
    border: "1px solid #a2a9b1",
    padding: "6px 8px",
    fontSize: "0.875em",
    color: "#202122",
    width: "100%",
  } as const;

  const buttonStyle = {
    backgroundColor: "#f8f9fa",
    border: "1px solid #a2a9b1",
    color: "#202122",
    padding: "6px 16px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  } as const;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Top navigation bar */}
      <div style={topBarStyle}>
        <span style={{ fontWeight: 600 }}>WikiHome</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.875em" }}>{userEmail}</span>
          <form
            action="/api/auth/signout"
            method="POST"
            style={{ display: "inline" }}
          >
            <button type="submit" style={buttonStyle}>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: 32 }}>
        <h1 style={{ ...pageHeadingStyle, fontSize: "1.5em" }}>
          My Homes
        </h1>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          {homes.length === 0 ? (
            <div style={{ textAlign: "center" }}>
              <p>You don't have any homes yet.</p>
              <Link href="/setup" style={{ ...buttonStyle, marginTop: 8 }}>
                Create your first home
              </Link>
            </div>
          ) : (
            <>
              <Link href="/setup" style={{ ...buttonStyle, padding: "4px 12px" }}>
                + Create new home
              </Link>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                {homes.map((home) => (
                  <div key={home.id} style={{ border: "1px solid #a2a9b1", padding: 16 }}>
                    <Link
                      href={`/wiki/${userEmail}/${home.slug}`}
                      style={{ color: "#3366cc", textDecoration: "none" }}
                    >
                      <strong>{home.name}</strong>
                    </Link>
                    <div style={{ fontSize: "0.75em", color: "#54595d", marginTop: 4 }}>
                      {home._count.pages} pages · {home.homeType} ·{" "}
                      {home.isPublic ? "Public" : "Private"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
