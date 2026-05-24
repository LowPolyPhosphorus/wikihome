import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { HomeNav } from "@/components/ui/HomeNav";

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

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <HomeNav email={session.user.email ?? ""} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-[#111827]">
            Your Homes
          </h1>
          <Link
            href="/setup"
            className="inline-flex items-center px-4 py-2 bg-[#475569] text-white rounded-md text-sm font-medium hover:bg-[#334155] transition-colors"
          >
            + Create new home
          </Link>
        </div>

        {homes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              Welcome to WikiHome
            </h2>
            <p className="text-[#475569] mb-8 max-w-md mx-auto">
              You don't have any homes yet. Create your first home to start
              documenting everything about it — from appliances to room layouts.
            </p>
            <Link
              href="/setup"
              className="inline-flex items-center px-6 py-3 bg-[#475569] text-white rounded-md text-base font-medium hover:bg-[#334155] transition-colors"
            >
              Create your first home
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {homes.map((home) => (
              <Link
                key={home.id}
                href={`/wiki/${userEmail}/${home.slug}`}
                className="block border border-[#e2e8f0] rounded-lg bg-white p-4 hover:border-[#475569] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[#111827]">
                      {home.name}
                    </h3>
                    <p className="text-sm text-[#475569] mt-0.5">
                      {home._count.pages} pages · {home.homeType}
                    </p>
                  </div>
                  <span className="text-[#475569] text-sm">
                    {home.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}