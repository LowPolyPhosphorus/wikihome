import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - list user's homes
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json({ homes });
}

// POST - create home + generate stubs
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, homeType, floors, hasBasement, hasAttic, hasGarage, garageSize, hasBackyard, hasPool, hasHotTub, hasGuestHouse } = body;

  // Validate
  const errors: Record<string, string> = {};
  if (!name || name.trim().length === 0) errors.name = "Home name is required";
  if (!homeType) errors.homeType = "Home type is required";
  if (!floors || floors < 1) errors.floors = "Floors must be at least 1";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Generate slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (await db.home.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  // Create the home
  const home = await db.home.create({
    data: {
      name: name.trim(),
      slug: uniqueSlug,
      ownerId: session.user.id,
      homeType: homeType || "owned",
      floors: floors || 1,
      hasBasement: hasBasement || false,
      hasAttic: hasAttic || false,
      hasGarage: hasGarage || false,
      garageSize: garageSize || 0,
      hasBackyard: hasBackyard || false,
      hasPool: hasPool || false,
      hasHotTub: hasHotTub || false,
      hasGuestHouse: hasGuestHouse || false,
    },
  });

  // Create owner as member
  await db.homeMember.create({
    data: {
      homeId: home.id,
      userId: session.user.id,
      role: "owner",
    },
  });

  // Create categories
  const categoryData = [
    { name: "Room", homeId: home.id },
    { name: "System", homeId: home.id },
    { name: "Appliance", homeId: home.id },
    { name: "Exterior", homeId: home.id },
  ];

  await db.category.createMany({ data: categoryData });

  const categories = await db.category.findMany({
    where: { homeId: home.id },
  });

  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.name] = c.id;
  });

  // Generate stub pages
  const pageData: { title: string; content: string; slug: string; status: string; homeId: string; categoryId: string | null }[] = [];

  function page(title: string, category: string, note?: string) {
    const pageSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    pageData.push({
      title,
      content: note || "",
      slug: pageSlug,
      status: "stub",
      homeId: home.id,
      categoryId: catMap[category] || null,
    });
  }

  // Floor names
  const floorNames = ["Ground Floor", "Second Floor", "Third Floor", "Fourth Floor"];

  for (let f = 0; f < floors && f < floorNames.length; f++) {
    const floor = floorNames[f];
    page(floor, "Room");

    if (f === 0) {
      // Ground floor rooms
      page("Kitchen", "Room");
      page("Living Room", "Room");
      page("Dining Room", "Room");
      page("Entryway", "Room");
      page("Bathroom", "Room");
    } else {
      // Upper floor rooms
      const num = f + 1;
      page(`Bathroom`, "Room", `Bathroom on ${floor}`);
      for (let b = 1; b <= 3; b++) {
        const bedroomNum = (f - 1) * 3 + b;
        page(`Bedroom ${bedroomNum + 1}`, "Room", `Bedroom on ${floor}`);
      }
    }
  }

  // Systems
  page("HVAC", "System");
  page("Electrical Panel", "System");
  page("Plumbing", "System");
  page("Internet & Networking", "System");

  // Appliances category (empty for now, just category exists)

  // Conditional pages
  if (hasBasement) page("Basement", "Room");
  if (hasAttic) page("Attic", "Room");
  if (hasGarage) {
    if (garageSize === 2) {
      page("Garage", "Exterior", "Double garage");
    } else {
      page("Garage", "Exterior");
    }
  }
  if (hasBackyard) page("Backyard", "Exterior");
  if (hasPool) page("Pool", "Exterior");
  if (hasHotTub) page("Hot Tub", "Exterior");
  if (hasGuestHouse) page("Guest House", "Exterior");

  // Create all pages
  if (pageData.length > 0) {
    await db.page.createMany({ data: pageData });
  }

  // Get user for redirect URL
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  return NextResponse.json({
    home: {
      id: home.id,
      name: home.name,
      slug: home.slug,
      ownerId: home.ownerId,
    },
    redirectUrl: `/wiki/${user?.email}/${home.slug}`,
  });
}