import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import "@/styles/wiki.css";

function StatusBadge({ status }: { status: string }) {
  const badgeClass =
    status === "stub"
      ? "badge-stub"
      : status === "draft"
        ? "badge-draft"
        : "badge-complete";
  return <span className={badgeClass}>{status}</span>;
}

export default async function HomeWikiPage({
  params,
}: {
  params: Promise<{ user: string; home: string }>;
}) {
  const session = await auth();
  const { home: homeSlug } = await params;

  const home = await db.home.findUnique({
    where: { slug: homeSlug },
    include: {
      owner: {
        select: { email: true, name: true },
      },
      categories: {
        orderBy: { name: "asc" },
        include: {
          pages: {
            orderBy: { title: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      },
      pages: {
        where: { categoryId: null },
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  if (!home) {
    notFound();
  }

  const isOwner = session?.user?.id === home.ownerId;
  const allCategories = [
    ...home.categories,
    ...(home.pages.length > 0
      ? [{ id: "uncategorized", name: "Uncategorized", pages: home.pages }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Navigation */}
      <nav className="border-b border-[#e2e8f0] bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-[#111827] hover:text-[#475569] transition-colors"
          >
            WikiHome
          </Link>
          <div className="flex items-center gap-4">
            {session?.user?.email && (
              <span className="text-sm text-[#475569]">
                {session.user.email}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Wiki body */}
      <div className="wiki-body">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-[#111827] mb-1">
            {home.name}
          </h1>
          <p className="text-sm text-[#475569]">
            Owner: {home.owner.name || home.owner.email} ·{" "}
            {home.homeType} · {home.floors}{" "}
            floor{home.floors !== 1 ? "s" : ""}
          </p>
          {isOwner && (
            <div className="mt-3 flex gap-2">
              <Link
                href={`/wiki/${home.owner.email}/${home.slug}/recent-changes`}
                className="text-xs px-3 py-1.5 border border-[#e2e8f0] rounded-md text-[#475569] hover:bg-[#f9fafb] transition-colors"
              >
                Recent Changes
              </Link>
              <Link
                href={`/wiki/${home.owner.email}/${home.slug}/search`}
                className="text-xs px-3 py-1.5 border border-[#e2e8f0] rounded-md text-[#475569] hover:bg-[#f9fafb] transition-colors"
              >
                Search
              </Link>
            </div>
          )}
        </div>

        {/* Stub notice */}
        <div className="stub-notice">
          This home wiki is growing! Many pages are stubs that need content.
          Help fill them out.
        </div>

        {/* Sidebar */}
        <div className="wiki-sidebar">
          <h3 className="text-sm font-semibold text-[#111827] mb-2">
            Categories
          </h3>
          <ul className="space-y-1">
            {allCategories.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`#cat-${cat.id}`}
                  className="text-sm text-[#0645ad] hover:underline"
                >
                  {cat.name} ({cat.pages.length})
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="wiki-content">
          {/* Table of contents */}
          <div className="wiki-toc">
            <h3 className="text-sm font-semibold text-[#111827] mb-2">
              Contents
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              {allCategories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#cat-${cat.id}`}
                    className="text-sm text-[#0645ad] hover:underline"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Pages by category */}
          {allCategories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="mb-8">
              <h2 className="text-xl font-serif text-[#111827] border-b border-[#a2a9b1] pb-1 mb-3">
                {cat.name}
              </h2>
              {cat.pages.length === 0 ? (
                <p className="text-sm text-[#475569] italic">No pages yet</p>
              ) : (
                <ul className="space-y-2">
                  {cat.pages.map((page) => (
                    <li key={page.id} className="flex items-center gap-3">
                      <Link
                        href={`/wiki/${home.owner.email}/${home.slug}/${page.slug}`}
                        className="text-[#0645ad] hover:underline text-sm"
                      >
                        {page.title}
                      </Link>
                      <StatusBadge status={page.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}